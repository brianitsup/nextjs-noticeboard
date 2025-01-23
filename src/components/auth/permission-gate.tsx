import { ReactNode } from 'react';
import { Permission, UserRole } from '@/types/user';
import { hasPermission } from '@/lib/auth/permissions';

interface PermissionGateProps {
  userRole: UserRole;
  path: string;
  requiredPermission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  userRole,
  path,
  requiredPermission,
  children,
  fallback = null
}: PermissionGateProps) {
  const hasAccess = hasPermission(userRole, path, requiredPermission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface MultiPermissionGateProps {
  userRole: UserRole;
  path: string;
  requiredPermissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'all' | 'any';
}

export function MultiPermissionGate({
  userRole,
  path,
  requiredPermissions,
  children,
  fallback = null,
  mode = 'all'
}: MultiPermissionGateProps) {
  const hasAccess = mode === 'all'
    ? requiredPermissions.every(permission => hasPermission(userRole, path, permission))
    : requiredPermissions.some(permission => hasPermission(userRole, path, permission));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 