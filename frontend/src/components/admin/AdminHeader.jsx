import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Container from '../layout/Container';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * JalDrishti AdminHeader Component
 * Provides top bar for Admin layout with administrator identity and portal actions.
 */
export default function AdminHeader({ onToggleMobileNav, isMobileNavOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD] sticky top-0 z-30 shadow-xs">
      <Container>
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Portal Label */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="md:hidden p-2 rounded-lg text-[#547181] hover:bg-[#F0FAFF] focus-ring"
              aria-label="Toggle Navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>

            <Link to="/admin" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#0EA5E9]/25">
                JD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-[#163344] leading-tight">
                    JalDrishti
                  </h1>
                  <Badge variant="safe" size="sm">
                    Admin Portal
                  </Badge>
                </div>
                <p className="text-[11px] text-[#547181] font-medium hidden sm:block">
                  System Telemetry & Administrative Overview
                </p>
              </div>
            </Link>
          </div>

          {/* Admin Identity & Actions */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500">{user?.email || 'admin@jaldrishti.org'}</p>
            </div>

            <Link to="/">
              <Button variant="outline" size="sm" className="text-xs">
                Citizen Portal
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-slate-600 hover:text-red-600"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
