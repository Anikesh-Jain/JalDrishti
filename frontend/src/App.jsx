import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import CitizenDashboardPage from './pages/citizen/CitizenDashboardPage';
import CitizenTrendsPage from './pages/citizen/CitizenTrendsPage';
import CitizenAlertsPage from './pages/citizen/CitizenAlertsPage';
import CitizenMapPage from './pages/citizen/CitizenMapPage';
import ReportsPage from './pages/reports/ReportsPage';
import CitizenImageScreeningPage from './pages/citizen/CitizenImageScreeningPage';
import DevicesPage from './pages/DevicesPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import ScrollRestorationHandler from './components/common/ScrollRestorationHandler';

/**
 * Helper to dynamically route /dashboard based on active user role
 */
function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/citizen" replace />;
}

/**
 * JalDrishti Root Application Component
 * Composes AuthProvider, routing, layout shells, and role-protected routes.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollRestorationHandler />
        <Routes>
          {/* Public & Authentication Routes */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
          <Route path="/reset-password" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
          
          {/* Dynamic Dashboard routing */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          {/* Citizen Routes (accessible by Citizen and Admin) */}
          <Route path="/citizen" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><CitizenDashboardPage /></RoleRoute>} />
          <Route path="/citizen/trends" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><CitizenTrendsPage /></RoleRoute>} />
          <Route path="/citizen/alerts" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><CitizenAlertsPage /></RoleRoute>} />
          <Route path="/citizen/map" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><CitizenMapPage /></RoleRoute>} />
          <Route path="/citizen/image-screening" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><CitizenImageScreeningPage /></RoleRoute>} />
          
          {/* Aliases for clean top-level navigation matching sidebar */}
          <Route path="/water-quality" element={<Navigate to="/citizen/trends" replace />} />
          <Route path="/live-map" element={<Navigate to="/citizen/map" replace />} />
          <Route path="/map" element={<Navigate to="/citizen/map" replace />} />
          <Route path="/alerts" element={<Navigate to="/citizen/alerts" replace />} />
          <Route path="/image-screening" element={<Navigate to="/citizen/image-screening" replace />} />
          
          {/* Devices / Hardware Topology */}
          <Route path="/devices" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><DevicesPage /></RoleRoute>} />

          {/* Reports (shared for Citizen and Admin) */}
          <Route path="/reports" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><ReportsPage /></RoleRoute>} />
          <Route path="/citizen/reports" element={<Navigate to="/reports" replace />} />
          <Route path="/admin/reports" element={<Navigate to="/reports" replace />} />

          {/* Settings & Profile */}
          <Route path="/settings" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><AdminSettingsPage /></RoleRoute>} />
          <Route path="/profile" element={<RoleRoute allowedRoles={['Citizen', 'Admin']}><ProfilePage /></RoleRoute>} />

          {/* Administrator Protected Routes */}
          <Route path="/admin" element={<RoleRoute allowedRoles={['Admin']}><AdminDashboardPage /></RoleRoute>} />
          <Route path="/admin/inquiries" element={<Navigate to="/admin#inquiries" replace />} />
          <Route path="/admin/settings" element={<RoleRoute allowedRoles={['Admin']}><AdminSettingsPage /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute allowedRoles={['Admin']}><AdminUsersPage /></RoleRoute>} />
          <Route path="/users" element={<RoleRoute allowedRoles={['Admin']}><AdminUsersPage /></RoleRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
