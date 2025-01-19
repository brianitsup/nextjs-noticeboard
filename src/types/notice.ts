export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category_id: string;
  category?: Category | string;
  postedBy: string;
  posted_at?: string;
  postedAt?: Date | string;
  expires_at?: string;
  expiresAt?: Date | string;
  priority: 'low' | 'medium' | 'high';
  is_sponsored?: boolean;
  isSponsored?: boolean;
  published?: boolean;
} 