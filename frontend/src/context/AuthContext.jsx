import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

/**
 * JalDrishti Phase 13: Centralized Authentication Context
 *
 * Manages user authentication lifecycle, JWT token restoration,
 * and exposes secure login, registration, Google auth, and logout handlers.
 * Token storage strategy references jaldrishti_auth_token in localStorage via api.js.
 * The backend remains the source of truth for user roles and privileges.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on application mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await api.auth.getMe(storedToken);
        if (isMounted) {
          if (response && response.user) {
            setUser(response.user);
            setToken(storedToken);
            setAuthToken(storedToken);
          } else {
            // Unexpected response payload format
            setUser(null);
            setToken(null);
            setAuthToken(null);
          }
        }
      } catch (err) {
        // Token is invalid, expired, or server rejected authentication
        if (isMounted) {
          setUser(null);
          setToken(null);
          setAuthToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Authenticate with email and password
   * Calls POST /api/auth/login
   */
  const login = useCallback(async ({ email, password }) => {
    const response = await api.auth.login({ email, password });
    if (response && response.token && response.user) {
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error('Authentication succeeded but invalid response structure received');
  }, []);

  /**
   * Fast-track demo login for evaluation
   * Calls POST /api/auth/demo-login
   */
  const demoLogin = useCallback(async (role) => {
    const response = await api.auth.demoLogin(role);
    if (response && response.token && response.user) {
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error('Demo authentication succeeded but invalid response structure received');
  }, []);


  /**
   * Register a new Citizen account
   * Calls POST /api/auth/register
   * Role is strictly assigned server-side as 'Citizen'
   */
  const register = useCallback(async ({ name, email, password, phone }) => {
    const payload = {
      name,
      email,
      password,
      ...(phone ? { phone } : {})
    };
    const response = await api.auth.register(payload);
    if (response && response.token && response.user) {
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error('Registration succeeded but invalid response structure received');
  }, []);

  /**
   * Authenticate with Google ID Token credential
   * Calls POST /api/auth/google
   */
  const googleLogin = useCallback(async (credential) => {
    if (!credential) {
      throw new Error('Google credential token is required');
    }
    const response = await api.auth.google(credential);
    if (response && response.token && response.user) {
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error('Google authentication succeeded but invalid response structure received');
  }, []);

  /**
   * Update profile information
   */
  const updateProfile = useCallback(async (data) => {
    const response = await api.auth.updateProfile(data);
    if (response && response.user) {
      setUser(response.user);
      return response;
    }
    throw new Error('Failed to update profile');
  }, []);

  /**
   * Update hardware onboarding choice
   */
  const updateHardwareOnboarding = useCallback(async (status) => {
    const response = await api.auth.updateOnboarding(status);
    if (response && response.user) {
      setUser(response.user);
      return response;
    }
    throw new Error('Failed to update hardware onboarding status');
  }, []);

  /**
   * Refresh authenticated user record from server
   */
  const refreshUser = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) return null;
    try {
      const response = await api.auth.getMe(storedToken);
      if (response && response.user) {
        setUser(response.user);
        return response.user;
      }
    } catch {
      // Ignore
    }
    return null;
  }, []);

  /**
   * Logout current user and clear stored tokens
   */
  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  // Integrated Device Onboarding & Setup modal state
  const [deviceSetupModal, setDeviceSetupModal] = useState({
    isOpen: false,
    step: 'initial' // 'initial' | 'resume' | 'install' | 'claim' | 'wifi' | 'verify' | 'not_sure' | 'no_device'
  });

  const openDeviceSetup = useCallback((step = 'initial') => {
    setDeviceSetupModal({
      isOpen: true,
      step: step || 'initial'
    });
  }, []);

  const closeDeviceSetup = useCallback(() => {
    setDeviceSetupModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    demoLogin,
    register,
    googleLogin,
    updateProfile,
    updateHardwareOnboarding,
    refreshUser,
    logout,
    deviceSetupModal,
    openDeviceSetup,
    closeDeviceSetup
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
