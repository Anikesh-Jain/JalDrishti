import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Badge from '../common/Badge';

/**
 * JalDrishti AdminSidebar Component
 * Provides responsive navigation for the Administrator Portal.
 * Non-Phase sections are clearly labeled with upcoming phase tags to prevent dead or false links.
 */
export default function AdminSidebar({ className = '', onNavClick }) {
  const location = useLocation();

  const navItems = [
    {
      name: 'System Overview',
      path: '/admin',
      isCurrent: true,
      phaseTag: null
    },
    {
      name: 'Threshold Configuration',
      path: '/admin/settings?tab=thresholds',
      isCurrent: true,
      phaseTag: null
    },
    {
      name: 'Alert History',
      path: '/citizen/alerts',
      isCurrent: true,
      phaseTag: null
    },
    {
      name: 'Geospatial Node Map',
      path: '/citizen/map',
      isCurrent: true,
      phaseTag: null
    },
    {
      name: 'Notification Settings',
      path: '/admin/settings?tab=notifications',
      isCurrent: true,
      phaseTag: null
    },
    {
      name: 'Reporting & Logs',
      path: '/reports',
      isCurrent: true,
      phaseTag: null
    },
    {
      name: 'AI Image Screening',
      path: '/citizen/image-screening',
      isCurrent: true,
      phaseTag: null
    }
  ];

  return (
    <aside className={`w-full md:w-64 bg-[#E5F6FF]/92 md:bg-[#E5F6FF]/88 backdrop-blur-md border-r border-[#BAE6FD] flex flex-col text-[#334155] ${className}`}>
      <div className="p-4 border-b border-[#BAE6FD]/80 bg-[#E5F6FF]/60 hidden md:block">
        <span className="text-xs font-semibold text-[#0284C7] uppercase tracking-wider">
          Admin Navigation
        </span>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          if (item.isCurrent) {
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onNavClick}
                className={({ isActive }) => {
                  const isMatch = item.path.includes('?')
                    ? (location.pathname + location.search === item.path) ||
                      (location.pathname === '/admin/settings' && !location.search && item.path.includes('thresholds'))
                    : isActive;

                  return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isMatch
                      ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/20 font-semibold'
                      : 'text-[#475569] hover:text-[#0284C7] hover:bg-white/70'
                  }`;
                }}
              >
                <span>{item.name}</span>
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
              </NavLink>
            );
          }

          return (
            <div
              key={item.name}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-[#94A3B8] cursor-not-allowed opacity-80"
              title={`${item.name} will be implemented in ${item.phaseTag}`}
            >
              <span>{item.name}</span>
              <Badge variant="neutral" size="sm">
                {item.phaseTag}
              </Badge>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#BAE6FD] bg-[#E5F6FF]/95 text-[11px] text-[#475569]">
        <p className="font-semibold text-[#1E293B]">JalDrishti Control Plane</p>
        <p className="text-[#475569]">Environmental IoT Monitoring</p>
      </div>
    </aside>
  );
}
