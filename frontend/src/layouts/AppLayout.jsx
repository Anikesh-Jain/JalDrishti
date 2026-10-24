import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo, { BrandLogoLink } from '../components/common/Logo';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Footer from './Footer';

/**
 * JalDrishti Layout: AppLayout
 * Clean public shell with JalDrishti brand header, responsive navigation, and structured footer.
 */
export default function AppLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', href: '/#overview' },
    { name: 'Indicators', href: '/#indicators' },
    { name: 'Architecture', href: '/#how-it-works' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Contact', href: '/#contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F0FAFF] text-[#163344] font-sans">
      {/* Top Application Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Branding - role-aware navigation */}
            <BrandLogoLink size={36} dark={false} tagline={true} />

            {/* Public Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#547181]" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:text-[#0284C7] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* User Session / Status Area */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-[#163344]">{user.name}</p>
                    <p className="text-[10px] text-[#547181]">{user.email}</p>
                  </div>
                  <Badge
                    variant={user.role === 'Admin' ? 'safe' : 'info'}
                    size="sm"
                  >
                    {user.role || 'Citizen'}
                  </Badge>
                  <Link to={user.role === 'Admin' ? '/admin' : '/citizen'}>
                    <Button variant="primary" size="sm" className="text-xs bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white shadow-xs font-semibold">
                      Dashboard →
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs text-[#547181] hover:text-rose-600 hidden sm:inline-flex"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-xs text-[#547181] hover:text-[#0369A1]">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" className="text-xs bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white shadow-xs font-semibold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="md:hidden p-2 rounded-lg text-[#547181] hover:text-[#0284C7] hover:bg-[#F0FAFF] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/98 border-t border-[#BAE6FD] px-4 pt-3 pb-4 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#334155] hover:bg-[#F0FAFF] hover:text-[#0284C7] transition-colors"
              >
                {link.name}
              </a>
            ))}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Page Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Cohesive Application Footer */}
      <Footer />
    </div>
  );
}
