export type UserRole = 'admin' | 'editor' | 'moderator' | 'user';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  created_at: string;
  created_by: string;
  requires_date?: boolean;
  date_label?: string;
  date_description?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  priority: string;
  event_date?: Date;
  created_at: Date;
  posted_at?: Date;
  posted_by?: string;
  expires_at?: Date;
  is_paid?: boolean;
  is_published?: boolean;
  is_sponsored?: boolean;
  // Frontend-specific fields
  postedAt?: string;
  expiresAt?: string;
  isSponsored?: boolean;
} 