export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'announcement' | 'advertisement' | 'promotion' | 'event';
  postedBy: string;
  posted_at?: string;
  postedAt?: Date | string;
  expires_at?: string;
  expiresAt?: Date | string;
  priority: 'low' | 'medium' | 'high';
  is_sponsored?: boolean;
  isSponsored?: boolean;
} 