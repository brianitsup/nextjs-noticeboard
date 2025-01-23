import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Permission, UserRole, Role } from '@/types/user';
import { hasPermission, getPathPermissions, canAccessPath } from '@/lib/auth/permissions';

interface UserRoleData {
  role_id: number;
  role: {
    name: UserRole;
  };
}

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) {
          setUserRole(null);
          return;
        }

        // Get user's role using the new role relationship
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select(`
            role_id,
            role:roles (
              name
            )
          `)
          .eq('id', session.user.id)
          .single<UserRoleData>();

        if (roleError) throw roleError;
        
        setUserRole(userData?.role?.name || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user role'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, []);

  const checkPermission = (path: string, permission: Permission) => {
    if (!userRole) return false;
    return hasPermission(userRole, path, permission);
  };

  const getPermissions = (path: string) => {
    if (!userRole) return [];
    return getPathPermissions(userRole, path);
  };

  const checkAccess = (path: string) => {
    if (!userRole) return false;
    return canAccessPath(userRole, path);
  };

  return {
    userRole,
    isLoading,
    error,
    checkPermission,
    getPermissions,
    checkAccess
  };
} 