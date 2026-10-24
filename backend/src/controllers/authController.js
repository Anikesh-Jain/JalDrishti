const crypto = require('crypto');
const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { verifyGoogleIdToken } = require('../services/googleAuthService');
const { sendPasswordResetEmail } = require('../services/emailService');
const { isConnected } = require('../config/db');

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * Register a new Citizen account
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    if (!isConnected()) {
      return res.status(503).json({
        error: 'Database service is currently unavailable. Please verify MongoDB is running.'
      });
    }

    const { name, email, password, phone, hardwareStatus } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Name is required and must be at least 2 characters long'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        error: 'A valid email address is required'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email address already exists'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Build onboarding state if provided at registration
    let hardwareOnboarding = { status: 'pending', completedAt: null };
    if (hardwareStatus && ['yes', 'no', 'not_sure'].includes(hardwareStatus)) {
      hardwareOnboarding = {
        status: hardwareStatus,
        completedAt: new Date()
      };
    }

    // Public registration strictly defaults to non-privileged 'Citizen' role
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'Citizen',
      phone: phone && typeof phone === 'string' ? phone.trim() : null,
      hardwareOnboarding
    });

    // Generate signed JWT
    const token = generateToken({
      userId: newUser._id.toString(),
      role: newUser.role
    });

    return res.status(201).json({
      message: 'Account registered successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        status: newUser.status,
        organization: newUser.organization,
        hardwareOnboarding: newUser.hardwareOnboarding,
        assignedNodeId: newUser.assignedNodeId,
        createdAt: newUser.createdAt
      },
      token
    });
  } catch (error) {
    console.error('[AuthController Register Error]:', error.message);
    return res.status(500).json({
      error: 'An error occurred during registration. Please try again.'
    });
  }
};

/**
 * Authenticate existing user with email and password
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        error: 'Email and password are required and must be valid strings'
      });
    }

    if (!isConnected()) {
      return res.status(503).json({
        error: 'Database service is currently unavailable. Please verify MongoDB is running.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user record including passwordHash
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Google-only users without passwordHash must use Google login
    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'This account was created via Google. Please sign in with Google.'
      });
    }

    // Verify bcrypt password hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate signed JWT
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role
    });

    return res.status(200).json({
      message: 'Authentication successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin,
        organization: user.organization,
        avatar: user.avatar,
        hardwareOnboarding: user.hardwareOnboarding,
        assignedNodeId: user.assignedNodeId
      },
      token
    });
  } catch (error) {
    console.error('[AuthController Login Error]:', error.message);
    return res.status(500).json({
      error: 'An error occurred during login. Please try again.'
    });
  }
};

/**
 * Authenticate with Google ID Token
 * POST /api/auth/google
 */
const googleAuth = async (req, res) => {
  const { credential } = req.body || {};

  if (!credential || typeof credential !== 'string' || !credential.trim()) {
    return res.status(400).json({
      error: 'Google ID token credential is required'
    });
  }

  // Cryptographically verify Google ID token with google-auth-library
  let googleProfile;
  try {
    googleProfile = await verifyGoogleIdToken(credential.trim());
  } catch (verifyError) {
    console.warn('[AuthController Google Token Verification Failed]:', verifyError.message);
    return res.status(401).json({
      error: verifyError.message || 'Google token verification failed'
    });
  }

  const { googleId, email, name } = googleProfile;

  if (!email) {
    return res.status(400).json({
      error: 'Google account does not provide an email address'
    });
  }

  // Database operations with connection safeguard
  if (!isConnected()) {
    return res.status(503).json({
      error: 'Database service is currently unavailable. Please verify MongoDB is running.'
    });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user with matching googleId already exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. Check if user with matching email already exists to link accounts safely
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        user.googleId = googleId;
        user.lastLogin = new Date();
        await user.save();
      } else {
        // 3. Provision new user strictly defaulting to Citizen role
        user = await User.create({
          name: name || 'Google User',
          email: normalizedEmail,
          googleId,
          role: 'Citizen',
          passwordHash: null,
          status: 'Active',
          lastLogin: new Date()
        });
      }
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate signed JWT
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role
    });

    return res.status(200).json({
      message: 'Google authentication successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin,
        organization: user.organization,
        avatar: user.avatar,
        hardwareOnboarding: user.hardwareOnboarding,
        assignedNodeId: user.assignedNodeId
      },
      token
    });
  } catch (dbError) {
    console.error('[AuthController Google Database Error]:', dbError.message);
    return res.status(500).json({
      error: 'A server error occurred while retrieving or creating your account. Please try again.'
    });
  }
};

/**
 * Retrieve authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    user: req.user
  });
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, organization, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone && typeof phone === 'string' ? phone.trim() : null;
    }
    if (organization && typeof organization === 'string') {
      user.organization = organization.trim();
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (req.body.hardwareStatus && ['yes', 'no', 'not_sure'].includes(req.body.hardwareStatus)) {
      user.hardwareOnboarding = {
        status: req.body.hardwareStatus,
        completedAt: new Date()
      };
    } else if (req.body.hardwareOnboarding && typeof req.body.hardwareOnboarding === 'object') {
      if (req.body.hardwareOnboarding.status && ['yes', 'no', 'not_sure'].includes(req.body.hardwareOnboarding.status)) {
        user.hardwareOnboarding = {
          status: req.body.hardwareOnboarding.status,
          completedAt: new Date()
        };
      }
    }

    // Handle password update if requested
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long' });
      }

      if (user.passwordHash) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to set a new password' });
        }
        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ error: 'Current password does not match' });
        }
      }
      user.passwordHash = await hashPassword(newPassword);
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin,
        organization: user.organization,
        avatar: user.avatar,
        hardwareOnboarding: user.hardwareOnboarding,
        assignedNodeId: user.assignedNodeId
      }
    });
  } catch (error) {
    console.error('[AuthController UpdateProfile Error]:', error.message);
    return res.status(500).json({
      error: 'An error occurred while updating profile'
    });
  }
};

/**
 * Fast-track demo login endpoint for academic evaluation
 * POST /api/auth/demo-login
 * Body: { role: 'Admin' | 'Citizen' }
 */
const demoLogin = async (req, res) => {
  try {
    const { role } = req.body || {};
    const targetRole = role === 'Admin' ? 'Admin' : 'Citizen';
    const user = targetRole === 'Admin'
      ? (await User.findOne({ email: 'admin@jaldrishti.org' })) || (await User.findOne({ role: 'Admin' }))
      : await User.findOne({ role: 'Citizen' });

    if (!user) {
      return res.status(404).json({
        error: `Demo user for role ${targetRole} not found in database`
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role
    });

    return res.status(200).json({
      message: `${targetRole} demo authentication successful`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin,
        organization: user.organization,
        avatar: user.avatar,
        hardwareOnboarding: user.hardwareOnboarding,
        assignedNodeId: user.assignedNodeId
      },
      token
    });
  } catch (error) {
    console.error('[AuthController DemoLogin Error]:', error.message);
    return res.status(500).json({
      error: 'An error occurred during demo login. Please try again.'
    });
  }
};

/**
 * Request a password reset link
 * POST /api/auth/forgot-password
 * Returns a neutral response regardless of whether the account exists
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        error: 'A valid email address is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate cryptographically secure single-use token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour validity
      await user.save();

      const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const clientUrl = rawClientUrl.split(',')[0].trim();
      const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        name: user.name
      });
    }

    // Neutral response to avoid user enumeration
    return res.status(200).json({
      message: 'If an account matches that email address, password reset instructions have been sent.'
    });
  } catch (error) {
    console.error('[AuthController ForgotPassword Error]:', error.message);
    return res.status(500).json({
      error: 'An error occurred while processing your request. Please try again.'
    });
  }
};

/**
 * Reset password using single-use verification token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'Password reset token is required'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Password reset token is invalid, expired, or has already been used.'
      });
    }

    // Hash new password using bcrypt
    const passwordHash = await hashPassword(password);
    user.passwordHash = passwordHash;

    // Invalidate the single-use token immediately
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    // Explicitly preserve role and privileges
    await user.save();

    return res.status(200).json({
      message: 'Password has been reset successfully. You may now log in with your new credentials.'
    });
  } catch (error) {
    console.error('[AuthController ResetPassword Error]:', error.message);
    return res.status(500).json({
      error: 'An error occurred while resetting your password. Please try again.'
    });
  }
};

/**
 * Update hardware onboarding preference for authenticated user
 * PUT /api/auth/onboarding
 */
const updateOnboarding = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['yes', 'no', 'not_sure'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: yes, no, not_sure' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.hardwareOnboarding = {
      status,
      completedAt: new Date()
    };
    await user.save();

    return res.status(200).json({
      message: 'Hardware onboarding preference saved successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin,
        organization: user.organization,
        avatar: user.avatar,
        hardwareOnboarding: user.hardwareOnboarding,
        assignedNodeId: user.assignedNodeId
      }
    });
  } catch (error) {
    console.error('[AuthController UpdateOnboarding Error]:', error.message);
    return res.status(500).json({ error: 'Failed to update onboarding preference' });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  googleAuth,
  getMe,
  updateProfile,
  updateOnboarding,
  forgotPassword,
  resetPassword
};

