import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * JalDrishti Official Brand Emblem & Logo
 *
 * Water droplet examined under a magnifying glass representing
 * IoT water quality inspection, scientific analysis, and precision monitoring.
 * Uses the user-supplied high-resolution brand asset.
 */
export function LogoIcon({ size = 36, className = '' }) {
  return (
    <img
      src="/logo.png"
      alt="JalDrishti Water Quality Inspection Emblem"
      width={size}
      height={size}
      className={`shrink-0 object-contain rounded-lg drop-shadow-xs ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

export default function Logo({
  size = 36,
  withText = true,
  dark = false,
  className = '',
  tagline = true
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <LogoIcon size={size} />
      {withText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`text-xl font-extrabold font-heading tracking-tight ${
                dark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Jal
            </span>
            <span className="text-xl font-extrabold font-heading tracking-tight text-cyan-500">
              Drishti
            </span>
          </div>
          {tagline && (
            <span
              className={`text-[10px] font-medium tracking-wider uppercase mt-1 ${
                dark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Clean Water, Safer Tomorrow
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Role-aware and State-aware Brand Logo Link
 *
 * Implements Issue 5 Requirements:
 * - Admin logged in: Navigates to Admin Dashboard (/admin).
 * - Citizen logged in: Navigates to Citizen Dashboard (/citizen).
 * - Logged out visitor on public landing page: Scrolls smoothly to top hero section without redirecting to protected dashboard.
 * - Logged out visitor on other pages: Navigates to public landing page (/).
 */
export function BrandLogoLink({
  size = 36,
  dark = false,
  tagline = true,
  className = '',
  onClick
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = isAuthenticated && user
    ? (user.role === 'Admin' ? '/admin' : '/citizen')
    : '/';

  const handleClick = (e) => {
    if (onClick) onClick(e);

    if (isAuthenticated && user) {
      const dest = user.role === 'Admin' ? '/admin' : '/citizen';
      navigate(dest);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      // Unauthenticated visitor
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        if (window.location.hash) {
          window.history.pushState(null, '', '/');
        }
      } else {
        navigate('/');
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <Link
      to={destination}
      onClick={handleClick}
      className={`inline-flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg ${className}`}
      aria-label="JalDrishti Brand Home"
    >
      <Logo size={size} dark={dark} tagline={tagline} />
    </Link>
  );
}
