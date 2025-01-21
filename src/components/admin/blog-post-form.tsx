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
      tags: [],
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

      // Validate required fields
      if (!formData.title?.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.content?.trim()) {
        throw new Error("Content is required");
      }
      if (!formData.excerpt?.trim()) {
        // Generate excerpt from content if not provided
        formData.excerpt = formData.content
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .slice(0, 150) // Get first 150 characters
          .trim() + '...'; // Add ellipsis
      }

      const slug = formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "";
      
      // Ensure tags is always a valid array
      const tags = Array.isArray(formData.tags) ? formData.tags : [];
      
      // Clean and prepare tags
      const cleanedTags = tags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.replace(/[^a-zA-Z0-9\s-]/g, ''));

      const preparedData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        published: formData.published || false,
        slug,
        author_id: userId,
        updated_at: new Date().toISOString(),
        // Ensure we send null for empty arrays to let PostgreSQL use its default
        tags: cleanedTags.length > 0 ? cleanedTags : null
      };

      // Debug log to see what we're sending
      console.log('Sending to Supabase:', JSON.stringify(preparedData, null, 2));

      if (post?.id) {
        const { data, error } = await supabase
          .from("blog_posts")
          .update(preparedData)
          .eq("id", post.id)
          .select();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        console.log('Update response:', data);
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert([{ ...preparedData, created_at: new Date().toISOString() }])
          .select();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        console.log('Insert response:', data);
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

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
        </DialogHeader>
        <form 
          onSubmit={(e) => {
            const target = e.target as HTMLElement;
            const isEditorButton = target.closest('.tiptap-toolbar-button');
            if (isEditorButton) {
              e.preventDefault();
              return;
            }
            handleSubmit(e);
          }} 
          className="space-y-6"
        >
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
            <Label htmlFor="excerpt">
              Excerpt <span className="text-sm text-gray-500">(optional - will be generated from content if empty)</span>
            </Label>
            <Input
              id="excerpt"
              value={formData.excerpt || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ 
                  ...formData, 
                  excerpt: value.length > 150 ? value.slice(0, 150) : value 
                });
              }}
              placeholder="Brief summary of the post (max 150 characters)"
              maxLength={150}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <div className="editor-container" onClick={e => e.stopPropagation()}>
              <BlogEditor
                content={formData.content ?? ""}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Handle empty input case
                if (!inputValue || !inputValue.trim()) {
                  setFormData({ ...formData, tags: [] });
                  return;
                }

                // Split by comma, clean up, and ensure unique values
                const newTags = Array.from(
                  new Set(
                    inputValue
                      .split(",")
                      .map(tag => tag.trim())
                      .filter(tag => tag.length > 0)
                      .map(tag => tag.replace(/[^a-zA-Z0-9\s-]/g, ''))
                  )
                );

                setFormData({ ...formData, tags: newTags });
              }}
              placeholder="Enter tags separated by commas (letters, numbers, spaces, and hyphens only)"
            />
            <p className="text-sm text-gray-500">
              Current tags: {Array.isArray(formData.tags) && formData.tags.length > 0 
                ? formData.tags.join(", ") 
                : "No tags"}
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
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