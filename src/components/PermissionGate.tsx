import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PermissionGateProps {
  /** Single permission code that must be held */
  permission?: string;
  /** User must hold AT LEAST ONE of these codes */
  anyOf?: string[];
  /** User must hold ALL of these codes */
  allOf?: string[];
  children: React.ReactNode;
  /** What to render when the check fails — defaults to nothing */
  fallback?: React.ReactNode;
}

/**
 * Renders `children` only when the current user satisfies the permission check.
 * Use this to hide/show individual buttons, form fields, columns, or UI sections.
 *
 * Rules (evaluated in order):
 *  1. anyOf  → user needs at least one code in the list
 *  2. allOf  → user needs every code in the list
 *  3. permission → user needs exactly that one code
 *
 * If none of the props are supplied the gate always renders (nothing to check).
 */
export function PermissionGate({ permission, anyOf, allOf, children, fallback = null }: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let allowed: boolean;
  if (anyOf)       allowed = hasAnyPermission(anyOf);
  else if (allOf)  allowed = hasAllPermissions(allOf);
  else if (permission) allowed = hasPermission(permission);
  else             allowed = true; // no restriction specified

  return <>{allowed ? children : fallback}</>;
}
