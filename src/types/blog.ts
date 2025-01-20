export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  featured_image?: string;
  meta_description?: string;
  tags?: string[];
} 