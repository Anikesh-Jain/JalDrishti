import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CheckCircleIcon } from '../components/common/Icons';

/**
 * JalDrishti Authentication: ResetPasswordPage
 * Allows users with a valid single-use token to securely set a new password
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing or invalid password reset token. Please request a new link.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.auth.resetPassword({
        token,
        password,
        confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed. The link may have expired or already been used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md my-auto">
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-[#BAE6FD] p-7 sm:p-8 shadow-xl shadow-[#0EA5E9]/10 text-[#163344]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-[#163344] tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-[#547181] mt-1">
            Choose a strong new password for your JalDrishti account.
          </p>
        </div>

        {!token ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700">
              No reset token found in the request URL. Please request a new password reset link.
            </div>
            <Link
              to="/forgot-password"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-center block text-white bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] transition-all"
            >
              Request New Link
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">Password Updated</p>
                <p className="mt-1 leading-relaxed text-[#547181]">
                  Your password has been changed successfully. You can now sign in with your new credentials.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-sm text-center text-white bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] transition-all cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#163344] mb-1.5" htmlFor="password">
                New Password (min 6 characters)
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F0FAFF] border border-[#BAE6FD] focus:border-[#0EA5E9] text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163344] mb-1.5" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={isSubmitting}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F0FAFF] border border-[#BAE6FD] focus:border-[#0EA5E9] text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] focus:ring-2 focus:ring-[#38BDF8] shadow-md shadow-[#0EA5E9]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
