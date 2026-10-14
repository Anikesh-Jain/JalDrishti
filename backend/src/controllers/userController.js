const mongoose = require('mongoose');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');

/**
 * JalDrishti User Management Controller (Admin-Only RBAC)
 *
 * Exposes administrative user listing, creation, role modification,
 * status updates, and deletion. Strictly requires Admin role.
 */

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * Retrieve all users with role and status information
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role && ['Admin', 'Citizen'].includes(role)) {
      filter.role = role;
    }
    if (status && ['Active', 'Inactive'].includes(status)) {
      filter.status = status;
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Provision a new user account with administrator-specified role
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organization } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const userRole = role === 'Admin' ? 'Admin' : 'Citizen';
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: userRole,
      phone: phone ? phone.trim() : null,
      organization: organization ? organization.trim() : 'JalDrishti Project',
      status: 'Active'
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        phone: newUser.phone,
        organization: newUser.organization,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing user's role, status, or details
 * PATCH /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { role, status, name, phone, organization } = req.body;

    if (role && ['Admin', 'Citizen'].includes(role)) {
      // Prevent self-demotion from Admin to Citizen to avoid admin lockout
      if (req.user._id.toString() === user._id.toString() && role !== 'Admin') {
        return res.status(400).json({ error: 'Administrators cannot remove their own administrator privileges' });
      }
      user.role = role;
    }

    if (status && ['Active', 'Inactive'].includes(status)) {
      if (req.user._id.toString() === user._id.toString() && status === 'Inactive') {
        return res.status(400).json({ error: 'Administrators cannot deactivate their own account' });
      }
      user.status = status;
    }

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone ? phone.trim() : null;
    }
    if (organization !== undefined) {
      user.organization = organization ? organization.trim() : user.organization;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        organization: user.organization,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user account (Admin only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Safeguard 1: Prevent currently logged-in Admin from deleting themselves
    if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
      return res.status(400).json({ error: 'Administrators cannot delete their own account' });
    }

    // Find target user first to verify existence and inspect role
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found or already deleted' });
    }

    // Safeguard 2: Prevent deleting the last remaining Admin account
    if (targetUser.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot delete the last remaining Administrator account. The system must retain at least one administrator.'
        });
      }
    }

    // Perform deletion directly from MongoDB
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) removed successfully`,
      data: {
        _id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
