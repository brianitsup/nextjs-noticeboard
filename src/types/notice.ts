export type UserRole = 'admin' | 'editor' | 'moderator' | 'user';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  created_at: string;
  created_by: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: Category | string;
  category_id: string;
  posted_by: string;
  posted_at: string | null;
  expires_at: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  is_sponsored: boolean;
  published: boolean;
  created_at: string;
  created_by: string;
  // Frontend-specific fields
  postedAt?: string;
  expiresAt?: string;
  isSponsored?: boolean;
} 