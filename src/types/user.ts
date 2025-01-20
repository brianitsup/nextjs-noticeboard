export type UserRole = 'admin' | 'editor' | 'moderator';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at?: string;
}

export const USER_ROLE_PERMISSIONS = {
  admin: ['create', 'read', 'update', 'delete'],
  editor: ['create', 'read', 'update'],
  moderator: ['read', 'update'],
} as const; 