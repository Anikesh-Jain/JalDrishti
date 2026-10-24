import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import CitizenLayout from '../../layouts/CitizenLayout';
import Button from '../../components/common/Button';
import { ShieldCheckIcon } from '../../components/common/Icons';

/**
 * JalDrishti Dedicated User Profile Destination
 * 
 * Provides authenticated personal identity management:
 * - Read-only role display with RBAC explanation
 * - Editable personal info (Name, Phone for SMS, Organization)
 * - Credential security management (Password change)
 * - Hardware device ownership preference & linked unit
 * - Persists updates directly to MongoDB via PUT /api/auth/profile
 */
export default function ProfilePage() {
  const { user, updateProfile, updateHardwareOnboarding, openDeviceSetup } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const Layout = isAdmin ? AdminLayout : CitizenLayout;

  // Personal Information state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organization, setOrganization] = useState(user?.organization || 'JalDrishti Water Authority');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Hardware Device preference state
  const [hardwareStatus, setHardwareStatus] = useState(user?.hardwareOnboarding?.status || 'pending');
  const [hardwareSaving, setHardwareSaving] = useState(false);
  const [hardwareSuccess, setHardwareSuccess] = useState('');
  const [hardwareError, setHardwareError] = useState('');

  // Synchronize state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setOrganization(user.organization || 'JalDrishti Water Authority');
      setHardwareStatus(user.hardwareOnboarding?.status || 'pending');
    }
  }, [user]);

  const handleHardwareSave = async (status) => {
    setHardwareSaving(true);
    setHardwareSuccess('');
    setHardwareError('');
    try {
      await updateHardwareOnboarding(status);
      setHardwareStatus(status);
      setHardwareSuccess('Hardware monitoring preference updated.');
      setTimeout(() => setHardwareSuccess(''), 4000);
      if (status === 'yes') {
        openDeviceSetup(user?.assignedNodeId ? 'verify' : 'install');
      }
    } catch (err) {
      setHardwareError(err.message || 'Failed to update preference');
    } finally {
      setHardwareSaving(false);
    }
  };

  // Handle personal information submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name || name.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters long.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        organization: organization ? organization.trim() : undefined
      });
      setProfileSuccess('Profile information saved successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setOrganization(user.organization || 'JalDrishti Water Authority');
    }
    setProfileError('');
    setProfileSuccess('');
  };

  // Handle password update submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const userInitial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Personal identity credentials, contact information, and role authorization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Overview Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-blue-600 bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md ring-4 ring-cyan-100/60 select-none">
                <span className="text-white drop-shadow-sm select-none font-black">{userInitial}</span>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'User'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'user@jaldrishti.org'}</p>

            {/* Read-Only Role Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
              <ShieldCheckIcon className="w-4 h-4 text-cyan-600" />
              <span>Role: {user?.role || 'Citizen'}</span>
            </div>

            {/* Security Notice on Role */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left w-full">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">RBAC Protected:</strong> User role is enforced server-side. Privilege escalation is strictly prohibited.
                </p>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="mt-5 pt-5 border-t border-slate-100 w-full space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {user?.status || 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Organization</span>
                <span className="text-slate-800 font-semibold truncate max-w-[150px]">
                  {user?.organization || 'JalDrishti'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Last Login</span>
                <span className="text-slate-500 text-[11px]">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Active session'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form & Password Security */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Personal Information</h3>
            <p className="text-xs text-slate-500 mb-6">
              Update your contact details and display credentials
            </p>

            {profileSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Email is linked to identity authentication and cannot be changed.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || 'Citizen'}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    System role is immutable via user profile.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Emergency Phone (SMS Alerts)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used to dispatch water contamination SMS warnings.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Organization / Department
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. State Water Authority, JalDrishti Research Group"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelProfile}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingProfile}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm shadow-xs"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Section 2: Ready-Made Hardware Monitoring Device */}
          <div className="bg-white rounded-2xl border border-[#BAE6FD] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">JalDrishti Monitoring Device</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Declare or update whether you own a ready-made inline pipeline sensor monitor
                </p>
              </div>
              <button
                type="button"
                onClick={() => openDeviceSetup(user?.assignedNodeId ? 'verify' : 'install')}
                className="text-xs font-bold text-[#0284C7] hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                {user?.assignedNodeId ? 'Device Diagnostics & Readings →' : 'Launch Device Setup →'}
              </button>
            </div>

            {hardwareSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {hardwareSuccess}
              </div>
            )}
            {hardwareError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {hardwareError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'yes', label: 'Yes, I have a device', desc: 'Ready-made pipeline unit' },
                { value: 'no', label: "No, I don't have one", desc: 'Using AI image screening' },
                { value: 'not_sure', label: 'Not sure / Decide later', desc: 'Exploring features' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={hardwareSaving}
                  onClick={() => handleHardwareSave(opt.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all text-xs ${
                    hardwareStatus === opt.value
                      ? 'border-[#0284C7] bg-[#F0FAFF] font-bold text-[#0284C7] ring-1 ring-[#0284C7]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>{opt.label}</span>
                    {hardwareStatus === opt.value && <span className="text-[10px]">✓</span>}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-normal">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Linked Device ID:</span>{' '}
                <strong className="text-slate-900 font-mono">
                  {user?.assignedNodeId || 'None (Unlinked)'}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => openDeviceSetup(user?.assignedNodeId ? 'verify' : 'install')}
                className="px-3 py-1.5 rounded-lg bg-[#0284C7] text-white font-bold text-[11px] hover:bg-[#0369A1] transition-colors cursor-pointer"
              >
                {user?.assignedNodeId ? 'View Live Telemetry' : (hardwareStatus === 'yes' ? 'Resume Device Setup' : 'Set Up Device')}
              </button>
            </div>
          </div>

          {/* Section 3: Password & Credential Security */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Security & Password</h3>
            <p className="text-xs text-slate-500 mb-6">
              Update password credentials for your account
            </p>

            {passwordSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingPassword}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-[#0EA5E9]/20"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
