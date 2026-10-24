import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/common/GoogleLoginButton';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * JalDrishti Authentication: LoginPage
 * 
 * Professional Environmental SaaS UI:
 * - Removed oversized logo above form; branding lives exclusively in AuthLayout header
 * - Restrained glassmorphism card with high-contrast inputs
 * - Zero emojis (clean SVGs for demo evaluation buttons)
 * - 1-Click Admin Demo & Citizen Demo handlers with role-based redirects
 */
export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return to requested protected route if redirected, else role destination
  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatAuthError = (err, defaultMsg = 'Invalid email or password.') => {
    if (!err) return defaultMsg;
    if (err.status === 0 || err.message?.includes('Network error') || err.message?.includes('Failed to fetch')) {
      return 'Unable to reach the server. Please check your network connection or verify the backend is running.';
    }
    if (err.status === 429) {
      return err.message || 'Too many authentication attempts. Please wait a few minutes before trying again.';
    }
    if (err.status === 503) {
      return err.message || 'Authentication service or database is temporarily unavailable. Please try again shortly.';
    }
    if (err.status >= 500) {
      return err.message || 'A server error occurred during login. Please try again later.';
    }
    return err.message || defaultMsg;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login({
        email: email.trim(),
        password
      });
      const dest = (from && from !== '/' && from !== '/login') 
        ? from 
        : (res?.user?.role === 'Admin' ? '/admin' : '/citizen');
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(formatAuthError(err, 'Invalid email or password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = React.useCallback(async (credential) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const res = await googleLogin(credential);
      const dest = (from && from !== '/' && from !== '/login') 
        ? from 
        : (res?.user?.role === 'Admin' ? '/admin' : '/citizen');
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(formatAuthError(err, 'Google authentication failed.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [googleLogin, from, navigate]);

  const handleGoogleError = React.useCallback((err) => {
    setServerError(formatAuthError(err, 'Google Sign-In failed.'));
  }, []);

  return (
    <div className="w-full max-w-md my-auto">
      {/* Restrained Fresh Water Glassmorphism Form Card */}
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-[#BAE6FD] p-7 sm:p-8 shadow-xl shadow-[#0EA5E9]/10 text-[#334155]">
        {/* Compact Card Title - No oversized logo graphic */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-[#1E293B] tracking-tight">
            Sign In
          </h1>
          <p className="text-xs text-[#475569] mt-1">
            Access IoT water quality telemetry & early warnings
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="name@domain.com"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F8FCFE] border ${
                fieldErrors.email ? 'border-red-400 focus:border-red-400' : 'border-[#BAE6FD] focus:border-[#0284C7]'
              } text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#0284C7] transition-all`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#334155]" htmlFor="password">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#0284C7] hover:text-[#0369A1] font-medium transition-colors cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F8FCFE] border ${
                fieldErrors.password ? 'border-red-400 focus:border-red-400' : 'border-[#BAE6FD] focus:border-[#0284C7]'
              } text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#0284C7] transition-all`}
            />
            {fieldErrors.password && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#0284C7] focus:ring-2 focus:ring-[#38BDF8] shadow-md shadow-[#0284C7]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#BAE6FD]/80" />
          </div>
          <span className="relative px-3 bg-white text-[11px] font-medium text-[#475569] uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Official Google Identity Services integration */}
        <div className="flex justify-center">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isSubmitting}
          />
        </div>

        {/* Registration Link */}
        <p className="text-center text-xs text-[#475569] mt-6">
          Do not have an account?{' '}
          <Link
            to="/register"
            className="text-[#0284C7] hover:text-[#0369A1] font-semibold underline underline-offset-4"
          >
            Create Citizen Account
          </Link>
        </p>
      </div>
    </div>
  );
}
