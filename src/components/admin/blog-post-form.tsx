"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BlogEditor } from "./blog-editor";
import { BlogPost } from "@/types/blog";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BlogPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  post?: BlogPost | null;
}

export function BlogPostForm({ isOpen, onClose, post }: BlogPostFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>(
    post ?? {
      title: "",
      content: "",
      excerpt: "",
      published: false,
    }
  );

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create or edit blog posts",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const slug = formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "";
      const data = {
        ...formData,
        slug,
        author_id: userId,
        updated_at: new Date().toISOString(),
      };

      if (post?.id) {
        const { error } = await supabase
          .from("blog_posts")
          .update(data)
          .eq("id", post.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([{ ...data, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      onClose();
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <BlogEditor
              content={formData.content ?? ""}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="published">Published</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : post ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 