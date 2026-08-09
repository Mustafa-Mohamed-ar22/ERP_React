import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  /** Single permission code required to view this route */
  permission?: string;
  /** At least one of these codes must be held to view this route */
  anyOf?: string[];
  children: React.ReactNode;
}

/**
 * Route-level permission guard.
 *
 * - While permissions are loading → show a centered spinner (not an error).
 * - If the user lacks the required permission → redirect to /unauthorized.
 * - Routes with NO `permission` / `anyOf` props should NOT be wrapped in this
 *   component — they are "ungated" (any authenticated user can reach them).
 */
export function ProtectedRoute({ permission, anyOf, children }: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, permissionsLoading } = useAuth();

  // Show a neutral loading screen while the first /me/permissions call is in-flight.
  // This prevents a flash-redirect to /unauthorized for legitimate users.
  if (permissionsLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
      }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const allowed = anyOf ? hasAnyPermission(anyOf) : (permission ? hasPermission(permission) : true);

  if (!allowed) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
