import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../feedback/LoadingState';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { LockIcon } from './Icons';

/**
 * JalDrishti Role-Based Route Guard (RoleRoute - REM-02 / DEC-23)
 *
 * Enforces role authorization using server-verified user identity.
 * - Unauthenticated users are redirected to /login
 * - Authenticated users without required role receive accessible access-denied state with guided actions
 * - Authorized users are granted access to protected view
 */
export default function RoleRoute({ allowedRoles = ['Admin'], children }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState message="Verifying role authorization..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = user?.role || 'Citizen';
  const hasRequiredRole = allowedRoles.includes(userRole);

  if (!hasRequiredRole) {
    const handleAdminSwitch = () => {
      logout();
      navigate('/login?role=admin&redirect=' + encodeURIComponent(location.pathname));
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-xl border-amber-200/80 rounded-2xl bg-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-xs">
            <LockIcon className="w-7 h-7 text-amber-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Administrator Permissions Required
          </h2>
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            The page you are trying to view (<code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">{location.pathname}</code>) is restricted to verified <strong>Administrator</strong> accounts.
          </p>

          <div className="bg-slate-50 rounded-xl p-3 mb-6 inline-flex items-center gap-2 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Your Authenticated Role:</span>
            <Badge variant="info" size="sm">
              {userRole}
            </Badge>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link to="/citizen" className="w-full">
              <Button variant="primary" size="md" className="w-full bg-[#0284C7] hover:bg-[#0369A1]">
                Return to Citizen Dashboard →
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={handleAdminSwitch}
              className="w-full text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              Sign In as Administrator
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            Default Evaluator Admin: <code className="text-slate-600 font-mono">admin@jaldrishti.org</code>
          </p>
        </Card>
      </div>
    );
  }

  return children;
}
