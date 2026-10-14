import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../feedback/LoadingState';

/**
 * JalDrishti Protected Route Guard
 *
 * Ensures unauthenticated users are safely redirected to /login.
 * Displays accessible LoadingState while restoring stored session tokens.
 * Avoids redirect loops and does not implement premature role dashboards.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState message="Verifying authentication session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
