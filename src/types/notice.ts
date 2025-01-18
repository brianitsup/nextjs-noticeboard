export interface Category {
  id: string;
  name: 'announcement' | 'advertisement' | 'promotion' | 'event';
  description?: string;
  icon: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category_id: string;
  category?: Category;
  postedBy: string;
  posted_at?: string;
  postedAt?: Date | string;
  expires_at?: string;
  expiresAt?: Date | string;
  priority: 'low' | 'medium' | 'high';
  is_sponsored?: boolean;
  isSponsored?: boolean;
} 