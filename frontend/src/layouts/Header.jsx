import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapPinIcon, EyeIcon } from '../components/common/Icons';

/**
 * JalDrishti Authenticated Top Header (REM-06 / DEC-19)
 *
 * Matching the reference image:
 * - Search bar: "Search stations, locations..."
 * - Station selector dropdown: "All Stations"
 * - Notification bell with unread badge + popover
 * - Date display & "[● Live Data]" badge
 * - User avatar pill with Name, Role badge ("Administrator"/"Citizen"), and functional dropdown
 */
export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isStationOpen, setIsStationOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState('All Stations');
  const [stations, setStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentAlerts, setRecentAlerts] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const stationRef = useRef(null);

  const isAdmin = user?.role === 'Admin';

  // Format date matching reference UI: "Oct 9, 2026  10:27 PM"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      setCurrentTime(now.toLocaleString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch nodes for station dropdown & recent alerts for notification popover (only when authenticated)
  useEffect(() => {
    if (!user) {
      setStations([]);
      setRecentAlerts([]);
      return;
    }

    let mounted = true;
    async function loadHeaderData() {
      try {
        const nodesRes = await api.sensor.getNodes();
        if (mounted && nodesRes && nodesRes.data) {
          setStations(nodesRes.data);
        }
      } catch {
        // Fallback placeholder stations
      }

      try {
        const alertsRes = await api.alerts.getActive();
        if (mounted && alertsRes && alertsRes.data) {
          setRecentAlerts(alertsRes.data.slice(0, 4));
        }
      } catch {
        // Fallback
      }
    }

    loadHeaderData();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (stationRef.current && !stationRef.current.contains(event.target)) {
        setIsStationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/citizen/map?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Get user avatar initial
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#BAE6FD] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-[#547181] hover:text-[#163344] hover:bg-[#F0FAFF] focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search input matching reference */}
        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#547181]/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations, locations..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F0FAFF] border border-[#BAE6FD] rounded-xl text-[#163344] placeholder-[#547181]/60 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] focus:bg-white transition-all"
          />
        </form>
      </div>

      {/* Right: Station Selector, Notifications, Date/Live Pill, User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Station Selector Dropdown */}
        <div className="relative hidden lg:block" ref={stationRef}>
          <button
            onClick={() => setIsStationOpen(!isStationOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#163344] bg-[#F0FAFF] hover:bg-[#E0F7FF] border border-[#BAE6FD] rounded-xl transition-colors"
          >
            <MapPinIcon className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{selectedStation}</span>
            <svg className="w-3.5 h-3.5 text-[#547181]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isStationOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
              <button
                onClick={() => {
                  setSelectedStation('All Stations');
                  setIsStationOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-medium ${
                  selectedStation === 'All Stations'
                    ? 'text-cyan-700 bg-cyan-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Stations (Global Overview)
              </button>
              {stations.map((st) => (
                <button
                  key={st.nodeId || st.id}
                  onClick={() => {
                    setSelectedStation(st.name || st.nodeId);
                    setIsStationOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between ${
                    selectedStation === (st.name || st.nodeId)
                      ? 'text-cyan-700 bg-cyan-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{st.name || st.nodeId}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date and Live Data Badge */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-[#475569] font-medium">
          <span>{currentTime || 'Oct 10, 2026  10:27 PM'}</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DDF8E8] text-[#15803D] border border-[#A7F3D0] font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
            <span>Live Data</span>
          </div>
        </div>

        {/* Notification Bell Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-[#475569] hover:text-[#0284C7] hover:bg-[#E5F6FF] rounded-xl transition-colors"
            aria-label="View notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Red badge */}
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications & Alerts</span>
                <Link
                  to="/citizen/alerts"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-semibold text-cyan-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((a) => (
                    <div key={a._id} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {a.parameter.toUpperCase()} Limit Breach
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Measured value: {a.value} (Limit: {a.thresholdLimit})
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Station: {a.nodeId}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active threshold alerts. All parameters normal.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown matching reference UI */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#E5F6FF] transition-colors focus:outline-none"
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
          >
            {/* Avatar Circle with Initial */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0284C7] to-[#38BDF8] text-white font-extrabold flex items-center justify-center text-sm shadow-sm shadow-[#0284C7]/20 ring-2 ring-[#BAE6FD]/60 select-none">
              <span className="text-white drop-shadow-xs select-none font-bold">{userInitial}</span>
            </div>

            {/* User Name & Role Badge (Desktop) */}
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-[#1E293B]">
                {user?.name || (isAdmin ? 'Anikesh Jain' : 'Akshat Jain')}
              </span>
              <span className="text-[10px] font-medium text-[#475569]">
                {isAdmin ? 'Administrator' : 'Citizen'}
              </span>
            </div>

            <svg className="w-3.5 h-3.5 text-[#475569] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#BAE6FD] rounded-2xl shadow-xl py-2 z-50">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-[#BAE6FD]/60">
                <p className="text-xs font-bold text-[#1E293B]">{user?.name || 'User'}</p>
                <p className="text-[11px] text-[#475569] truncate">{user?.email || ''}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F6FF] text-[#0284C7] border border-[#BAE6FD]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                  <span>Role: {user?.role || 'Citizen'}</span>
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
                  </svg>
                  <span>My Profile</span>
                </Link>

                <Link
                  to={isAdmin ? '/admin/settings' : '/settings'}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings & Thresholds</span>
                </Link>

                {isAdmin ? (
                  <Link
                    to="/citizen"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-cyan-700 hover:bg-cyan-50 font-medium transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 text-cyan-600" />
                    <span>View Citizen Dashboard</span>
                  </Link>
                ) : (
                  <div className="px-4 py-1.5 text-[10px] text-slate-400">
                    Administrator access requires an Admin account.
                  </div>
                )}
              </div>

              {/* Logout */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
