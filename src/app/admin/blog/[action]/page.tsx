"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { BlogPost } from "@/types/blog";
import type { UserRole } from "@/types/user";
import slugify from "slugify";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export default function BlogPostEditor({ params }: { params: { action: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const isEdit = params.action !== "new";

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    meta_description: "",
    featured_image: "",
    tags: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isEdit && userRole) {
      fetchPost();
    }
  }, [isEdit, userRole]);

  async function checkAuth() {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        router.push('/auth/admin-signin');
        return;
      }

      const role = session.user.role || session.user.app_metadata?.role || 'user';

      if (!['admin', 'editor', 'moderator'].includes(role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
        router.push('/');
        return;
      }

      // Only admins and editors can create new posts
      if (!isEdit && !['admin', 'editor'].includes(role)) {
        toast({
          title: "Access Denied",
          description: "Only administrators and editors can create new posts.",
          variant: "destructive",
        });
        router.push('/admin/blog');
        return;
      }

      setUserRole(role as UserRole);
      setIsLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push('/auth/admin-signin');
    }
  }

  async function fetchPost() {
    if (!isEdit) return;

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", params.action)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blog post",
        variant: "destructive",
      });
      router.push('/admin/blog');
      return;
    }

    if (post) {
      setPost(post);
      setFormData({
        title: post.title || "",
        content: post.content || "",
        meta_description: post.meta_description || "",
        featured_image: post.featured_image || "",
        tags: post.tags || "",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent, shouldPublish: boolean = false) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be signed in to create or edit blog posts",
          variant: "destructive",
        });
        return;
      }

      const slug = slugify(formData.title, { lower: true, strict: true });
      const excerpt = formData.content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .split(' ')
        .slice(0, 15)
        .join(' ') + '...';

      const postData = {
        title: formData.title,
        content: formData.content,
        meta_description: formData.meta_description,
        featured_image: formData.featured_image,
        tags: formData.tags,
        published: shouldPublish,
        slug,
        excerpt,
        author_id: session.user.id,
        updated_at: new Date().toISOString()
      };

      let error;
      if (isEdit) {
        const { data: existingPost } = await supabase
          .from("blog_posts")
          .select("author_id")
          .eq("id", params.action)
          .single();

        if (!existingPost || existingPost.author_id !== session.user.id) {
          toast({
            title: "Error",
            description: "You can only edit your own blog posts",
            variant: "destructive",
          });
          return;
        }

        ({ error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", params.action));
      } else {
        ({ error } = await supabase
          .from("blog_posts")
          .insert([postData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Blog post ${isEdit ? 'updated' : 'created'} successfully`,
      });
      router.push('/admin/blog');
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} blog post`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/blog')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSaving}
          >
            {isSaving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Input
            id="meta_description"
            value={formData.meta_description}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            placeholder="Brief description for SEO (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured_image">Featured Image URL</Label>
          <Input
            id="featured_image"
            type="url"
            value={formData.featured_image}
            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
            placeholder="https://example.com/image.jpg (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Comma-separated tags (optional)"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            variant="outline"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
} 