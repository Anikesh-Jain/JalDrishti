import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeftIcon, CheckCircleIcon } from '../components/common/Icons';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * JalDrishti Authentication: ForgotPasswordPage
 * Allows users to request a password reset email securely without account enumeration
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.auth.forgotPassword(email.trim());
      setFeedbackMessage(
        res?.message ||
        'If an account matches that email address, password reset instructions have been sent.'
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md my-auto">
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-[#BAE6FD] p-7 sm:p-8 shadow-xl shadow-[#0EA5E9]/10 text-[#163344]">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#547181] hover:text-[#0284C7] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
          <h1 className="text-2xl font-bold font-heading text-[#163344] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-[#547181] mt-1">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">Request Processed</p>
                <p className="mt-1 leading-relaxed text-[#547181]">{feedbackMessage}</p>
              </div>
            </div>

            <p className="text-xs text-[#547181] leading-relaxed">
              For security reasons, this link expires after 1 hour. If you do not see the email in your inbox, please verify your spam folder.
            </p>

            <Link
              to="/login"
              className="w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-sm text-center block text-white bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] transition-all"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#163344] mb-1.5" htmlFor="email">
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
                  if (error) setError('');
                }}
                placeholder="name@domain.com"
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
                  <span>Sending instructions...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
