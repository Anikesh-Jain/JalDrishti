import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo, { BrandLogoLink } from '../components/common/Logo';

/**
 * JalDrishti AuthLayout
 * Professional environmental technology SaaS authentication shell:
 * - Fluid natural water background with controlled contrast overlay
 * - Compact top header with brand logo on far left and Sign In/Sign Up links on far right
 * - Perfectly centered glassmorphism container
 * - Compact unobtrusive footer
 */
export default function AuthLayout({ children }) {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#F0FAFF] text-[#334155] font-sans">
      {/* Background Approved Transparent Pipeline Water Flow Visual */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-transform duration-1000"
        style={{ backgroundImage: `url('/images/pipeline-water.png')` }}
      />
      {/* Subtle Directional Dark-Blue Overlay keeping transparent pipeline & water stream clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-slate-900/15 to-slate-950/45 pointer-events-none" />

      {/* 1. Compact Authentication Header */}
      <header className="relative z-20 border-b border-[#BAE6FD] bg-white/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Far Left: Branding */}
          <BrandLogoLink size={32} dark={false} tagline={true} />

          {/* Far Right: Clean Auth Navigation */}
          <nav className="flex items-center space-x-2 text-xs font-semibold" aria-label="Authentication navigation">
            <Link
              to="/login"
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                isLogin
                  ? 'bg-[#E5F6FF] text-[#0284C7] border border-[#BAE6FD] font-bold shadow-xs'
                  : 'text-[#475569] hover:text-[#0284C7] hover:bg-[#E5F6FF]/50'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                !isLogin
                  ? 'bg-[#E5F6FF] text-[#0284C7] border border-[#BAE6FD] font-bold shadow-xs'
                  : 'text-[#475569] hover:text-[#0284C7] hover:bg-[#E5F6FF]/50'
              }`}
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. Main Centered Form Slot */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* 3. Compact Unobtrusive Footer */}
      <footer className="relative z-20 py-4 border-t border-[#BAE6FD] bg-white/85 backdrop-blur-md text-center text-xs text-[#475569]">
        <p>
          © 2026 JalDrishti — CS506 Minor Project | Acropolis Institute of Technology and Research, Indore
        </p>
      </footer>
    </div>
  );
}
