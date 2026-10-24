import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlertContext } from '../context/AlertContext';
import Logo, { BrandLogoLink } from '../components/common/Logo';

/**
 * JalDrishti Authenticated Left Sidebar (REM-05 / DEC-19)
 *
 * Refined light drinking-water-inspired sidebar:
 * - Fresh light water surface with soft cyan border (#BAE6FD)
 * - Original JalDrishti emblem + brand typography
 * - Navigation links: Dashboard, Water Quality, Live Map, Alerts (badge), Reports, Image Screening, Devices, Users (Admin only), Settings
 * - Role-aware visibility and active link styling
 */
export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { unreadCount } = useAlertContext();
  const location = useLocation();
  const isAdmin = user?.role === 'Admin';

  // Navigation items matching reference UI sidebar exactly
  const navItems = [
    {
      name: 'Dashboard',
      path: isAdmin ? '/admin' : '/citizen',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      matchPaths: ['/citizen', '/admin']
    },
    {
      name: 'Water Quality',
      path: '/citizen/trends',
      alias: '/water-quality',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      matchPaths: ['/citizen/trends', '/water-quality']
    },
    {
      name: 'Live Map',
      path: '/citizen/map',
      alias: '/map',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      matchPaths: ['/citizen/map', '/map']
    },
    {
      name: 'Alerts',
      path: '/citizen/alerts',
      alias: '/alerts',
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-rose-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      matchPaths: ['/citizen/alerts', '/alerts']
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      matchPaths: ['/reports']
    },
    {
      name: 'Image Screening',
      path: '/citizen/image-screening',
      alias: '/image-screening',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      matchPaths: ['/citizen/image-screening', '/image-screening']
    },
    {
      name: 'Devices',
      path: '/devices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      matchPaths: ['/devices']
    },
    ...(isAdmin
      ? [
          {
            name: 'Users',
            path: '/admin/users',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            matchPaths: ['/admin/users']
          },
          {
            name: 'Inquiries',
            path: '/admin#inquiries',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ),
            matchPaths: ['/admin#inquiries']
          }
        ]
      : []),
    {
      name: 'Settings',
      path: isAdmin ? '/admin/settings' : '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      matchPaths: ['/settings', '/admin/settings']
    }
  ];

  const isCurrentActive = (item) => {
    return item.matchPaths.some((p) => {
      if (p === '/admin#inquiries') return location.pathname === '/admin' && location.hash === '#inquiries';
      if (p === '/admin') return location.pathname === '/admin' && location.hash !== '#inquiries';
      if (p === '/citizen') return location.pathname === '/citizen';
      return location.pathname.startsWith(p);
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Persistent Left Sidebar with Pale Water Blue Glassmorphism */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#E5F6FF]/92 md:bg-[#E5F6FF]/88 backdrop-blur-md text-[#334155] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#BAE6FD] shadow-xs`}
        aria-label="Sidebar navigation"
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-[#BAE6FD]/80 justify-between bg-[#E5F6FF]/60">
          <BrandLogoLink size={36} dark={false} tagline={true} onClick={onClose} />
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-[#475569] hover:text-[#0284C7] p-1 rounded-md"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto water-scrollbar">
          {navItems.map((item) => {
            const active = isCurrentActive(item);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/20 font-semibold'
                    : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`${active ? 'text-white' : 'text-[#0284C7] group-hover:text-[#0284C7]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white rounded-full ${
                      item.badgeColor || 'bg-rose-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User Role Status Pill */}
        <div className="p-4 border-t border-[#BAE6FD] bg-[#E5F6FF]/95">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 border border-[#BAE6FD] shadow-xs">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isAdmin ? 'bg-[#0284C7] animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs text-[#475569]">
                Mode: <strong className="text-[#0284C7]">{isAdmin ? 'Administrator' : 'Citizen'}</strong>
              </span>
            </div>
            <span className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold">
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
