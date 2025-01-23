import { Permission, UserRole, USER_ROLE_PERMISSIONS } from '@/types/user';

export function hasPermission(
  userRole: UserRole,
  path: string,
  requiredPermission: Permission
): boolean {
  // Admin has all permissions
  if (userRole === 'admin') return true;

  // Get permissions for the user's role
  const rolePermissions = USER_ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  // Check if the path exists in the role's permissions
  const pathPermissions = rolePermissions[path];
  if (!pathPermissions) return false;

  // Check if the required permission is included in the path's permissions
  return pathPermissions.includes(requiredPermission);
}

export function getPathPermissions(userRole: UserRole, path: string): Permission[] {
  if (userRole === 'admin') {
    return ['create', 'read', 'update', 'delete'];
  }

  const rolePermissions = USER_ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return [];

  return rolePermissions[path] || [];
}

export function canAccessPath(userRole: UserRole, path: string): boolean {
  return hasPermission(userRole, path, 'read');
} 