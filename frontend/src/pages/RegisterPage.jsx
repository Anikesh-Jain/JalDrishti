import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon, UsersIcon, CheckCircleIcon } from '../components/common/Icons';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * JalDrishti Authentication: RegisterPage
 *
 * Professional Environmental SaaS UI:
 * - Rendered inside AuthLayout with natural water background and dark oceanic overlay
 * - Compact glassmorphism card matching LoginPage styling
 * - High-contrast accessible inputs with subtle cyan focus rings
 * - Citizen account registration calling backend POST /api/auth/register
 * - Strictly defaults to 'Citizen' role on the server; zero emojis
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined
      });
      navigate('/citizen', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md my-auto">
      {/* Restrained Fresh Water Glassmorphism Form Card */}
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-[#BAE6FD] p-7 sm:p-8 shadow-xl shadow-[#0EA5E9]/10 text-[#163344]">
        {/* Compact Card Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-[#163344] tracking-tight">
            Create Citizen Account
          </h1>
          <p className="text-xs text-[#547181] mt-1">
            Register for real-time water quality alerts & community monitoring
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-[#163344] mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isSubmitting}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Sharma"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F0FAFF] border ${
                fieldErrors.name ? 'border-red-400 focus:border-red-400' : 'border-[#BAE6FD] focus:border-[#0EA5E9]'
              } text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>

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
              value={formData.email}
              onChange={handleChange}
              placeholder="you@domain.com"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F0FAFF] border ${
                fieldErrors.email ? 'border-red-400 focus:border-red-400' : 'border-[#BAE6FD] focus:border-[#0EA5E9]'
              } text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#163344] mb-1.5" htmlFor="phone">
              Mobile Number <span className="text-[#547181] font-normal">(Optional, for SMS alerts)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              disabled={isSubmitting}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+919876543210"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F0FAFF] border border-[#BAE6FD] focus:border-[#0EA5E9] text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#163344] mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 chars"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F0FAFF] border ${
                  fieldErrors.password ? 'border-red-400 focus:border-red-400' : 'border-[#BAE6FD] focus:border-[#0EA5E9]'
                } text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all`}
              />
              {fieldErrors.password && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163344] mb-1.5" htmlFor="confirmPassword">
                Confirm
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F0FAFF] border ${
                  fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-[#BAE6FD] focus:border-[#0EA5E9]'
                } text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] transition-all`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] focus:ring-2 focus:ring-[#38BDF8] shadow-md shadow-[#0EA5E9]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        {/* Return to Sign In */}
        <p className="text-center text-xs text-[#547181] mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#0284C7] hover:text-[#0369A1] font-semibold underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
