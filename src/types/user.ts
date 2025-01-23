export type UserRole = 'admin' | 'editor' | 'moderator' | 'user';

export interface Role {
  id: number;
  name: UserRole;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role_id: number;
  role?: Role;  // For joined queries
  created_at: string;
  last_sign_in_at?: string;
}

export type Permission = 'create' | 'read' | 'update' | 'delete';

export const USER_ROLE_PERMISSIONS: Record<UserRole, Record<string, Permission[]>> = {
  admin: {
    '/admin': ['create', 'read', 'update', 'delete'],
    '/admin/dashboard': ['create', 'read', 'update', 'delete'],
    '/admin/notices': ['create', 'read', 'update', 'delete'],
    '/admin/categories': ['create', 'read', 'update', 'delete'],
    '/admin/blog': ['create', 'read', 'update', 'delete'],
    '/admin/users': ['create', 'read', 'update', 'delete'],
    '/admin/profile': ['create', 'read', 'update', 'delete'],
    '/admin/settings': ['create', 'read', 'update', 'delete']
  },
  editor: {
    '/admin/dashboard': ['read'],
    '/admin/notices': ['create', 'read', 'update', 'delete'],
    '/admin/categories': ['create', 'read', 'update', 'delete'],
    '/admin/blog': ['create', 'read', 'update', 'delete'],
    '/admin/users': ['read', 'update'],
    '/admin/profile': ['read']
  },
  moderator: {
    '/admin/dashboard': ['read'],
    '/admin/notices': ['read', 'update'],
    '/admin/categories': ['read', 'update'],
    '/admin/blog': ['read'],
    '/admin/users': ['read'],
    '/admin/profile': ['read']
  },
  user: {
    '/admin/profile': ['read']
  }
} as const; 