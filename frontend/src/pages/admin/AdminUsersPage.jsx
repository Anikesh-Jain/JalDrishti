import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/feedback/LoadingState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  RefreshCwIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ShieldCheckIcon
} from '../../components/common/Icons';

/**
 * JalDrishti Admin - User Management (REM-08 / Reference Image Row 3 Center)
 *
 * Implements:
 * - Header: "Admin - User Management / Manage system users and their roles"
 * - "+ Add User" button & modal
 * - Interactive table: Name (avatar circle + name), Email, Role (badges), Status, Last Login, Actions
 * - Edit user role / toggle active status
 * - Safe user deletion with in-app confirmation modal, immediate UI update, and real backend persistence
 */
export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Notifications state (success / error alerts)
  const [notification, setNotification] = useState(null);

  // Deletion modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Citizen',
    phone: '',
    organization: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.getAll();
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err.message);
      setNotification({
        type: 'error',
        message: `Failed to load user directory: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setNotification(null);
    try {
      const res = await api.users.create(formData);
      setIsAddOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Citizen', phone: '', organization: '' });
      if (res?.data) {
        setUsers((prev) => [res.data, ...prev]);
      } else {
        await loadUsers();
      }
      setNotification({
        type: 'success',
        message: res?.message || 'New user account created successfully.'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: `User creation failed: ${err.message}`
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setNotification(null);
    try {
      await api.users.update(user._id, { status: nextStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
      );
      setNotification({
        type: 'success',
        message: `Status of ${user.name} updated to ${nextStatus}.`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Status update failed: ${err.message}`
      });
    }
  };

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'Admin' ? 'Citizen' : 'Admin';
    if (!window.confirm(`Are you sure you want to change ${user.name}'s role to ${nextRole}?`)) {
      return;
    }
    setNotification(null);
    try {
      await api.users.update(user._id, { role: nextRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u))
      );
      setNotification({
        type: 'success',
        message: `Role of ${user.name} changed to ${nextRole}.`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Role change failed: ${err.message}`
      });
    }
  };

  // Open deletion modal for target user
  const openDeleteModal = (targetUser) => {
    setNotification(null);
    setUserToDelete(targetUser);
    setIsDeleteModalOpen(true);
  };

  // Execute deletion confirmed by Admin
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    // Frontend safety check for self-deletion
    const isSelf =
      currentUser &&
      (currentUser._id === userToDelete._id || currentUser.email === userToDelete.email);
    if (isSelf) {
      setNotification({
        type: 'error',
        message: 'Administrators cannot delete their own account.'
      });
      setIsDeleteModalOpen(false);
      return;
    }

    // Frontend safety check for last remaining admin
    if (userToDelete.role === 'Admin') {
      const adminCount = users.filter((u) => u.role === 'Admin').length;
      if (adminCount <= 1) {
        setNotification({
          type: 'error',
          message:
            'Cannot delete the last remaining Administrator account. The system must retain at least one administrator.'
        });
        setIsDeleteModalOpen(false);
        return;
      }
    }

    setDeleteLoading(true);
    setNotification(null);

    try {
      const res = await api.users.delete(userToDelete._id);

      // Immediately update local UI state (remove from list without requiring full page refresh)
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));

      // Display confirmed success notification
      setNotification({
        type: 'success',
        message:
          res?.message ||
          `User ${userToDelete.name} (${userToDelete.email}) was successfully deleted from MongoDB.`
      });

      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      // Show useful error message in UI (NOT a misleading success or generic browser alert)
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete user account.'
      });
      setIsDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header matching reference UI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin - User Management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage system users and their roles
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              loading={loading}
              className="text-xs border-slate-300 flex items-center gap-1.5"
            >
              <RefreshCwIcon className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] flex items-center gap-1.5 shadow-xs"
            >
              <span>+</span>
              <span>Add User</span>
            </Button>
          </div>
        </div>

        {/* In-app Notification Alert Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangleIcon className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-xs font-semibold">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
              title="Dismiss notification"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Users Table matching reference UI */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
          {loading && users.length === 0 ? (
            <div className="py-12 flex justify-center">
              <LoadingState message="Loading directory of registered system users..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Last Login</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => {
                    const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                    const isAdmin = u.role === 'Admin';
                    const isActive = u.status !== 'Inactive';
                    const isSelf =
                      currentUser &&
                      (currentUser._id === u._id || currentUser.email === u.email);

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name + Circle Avatar */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-xs ${
                                isAdmin ? 'bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]' : 'bg-[#547181]'
                              }`}
                            >
                              {initial}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900">{u.name}</span>
                              {isSelf && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                          {u.email}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isAdmin
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isAdmin ? 'Administrator' : 'Citizen'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Last Login */}
                        <td className="py-3 px-3 text-slate-500">
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Oct 9, 2026'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleToggleRole(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed opacity-40'
                                  : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-100'
                              }`}
                              title={isSelf ? 'Cannot modify your own role' : 'Change Role'}
                            >
                              <RefreshCwIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed opacity-40'
                                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                              }`}
                              title={isSelf ? 'Cannot delete your own account' : 'Delete Account'}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangleIcon className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">Confirm Account Deletion</h3>
                </div>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              {/* User details card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{userToDelete.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      userToDelete.role === 'Admin'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {userToDelete.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-mono">{userToDelete.email}</p>
              </div>

              {/* Edge Case Warning / Normal Caution */}
              {currentUser &&
              (currentUser._id === userToDelete._id || currentUser.email === userToDelete.email) ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <strong>Action Blocked:</strong> You cannot delete your currently active administrator account.
                </div>
              ) : userToDelete.role === 'Admin' &&
                users.filter((u) => u.role === 'Admin').length <= 1 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <strong>Action Blocked:</strong> This user is the only Administrator in the system. The system must retain at least one administrator account.
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete this user? Their account and access permissions will be immediately removed from MongoDB. <strong>This action cannot be undone.</strong>
                </p>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  loading={deleteLoading}
                  onClick={handleConfirmDelete}
                  disabled={
                    deleteLoading ||
                    Boolean(
                      currentUser &&
                        (currentUser._id === userToDelete._id || currentUser.email === userToDelete.email)
                    ) ||
                    Boolean(
                      userToDelete.role === 'Admin' &&
                        users.filter((u) => u.role === 'Admin').length <= 1
                    )
                  }
                  className="bg-rose-600 hover:bg-rose-700 font-bold text-white"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Provision New User Account</h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikram Patel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="Citizen">Citizen</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone (Optional)</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    loading={actionLoading}
                    className="bg-[#0284C7] hover:bg-[#0369A1]"
                  >
                    Create User
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
