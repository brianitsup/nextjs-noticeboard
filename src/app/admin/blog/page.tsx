"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { BlogPost } from "@/types/blog";
import { formatDate } from "@/lib/date-utils";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/user";
import { Card } from "@/components/ui/card";

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userRole && ['admin', 'editor', 'moderator'].includes(userRole)) {
      fetchPosts();
    }
  }, [userRole]);

  async function checkAuth() {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        throw authError;
      }

      if (!session) {
        router.push('/auth/admin-signin');
        return;
      }

      // Get user role from metadata
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

      setUserRole(role as UserRole);
      setIsLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      toast({
        title: "Authentication Error",
        description: "Please sign in to access this area.",
        variant: "destructive",
      });
      router.push('/auth/admin-signin');
    }
  }

  async function fetchPosts() {
    const supabase = createClient();
    const { data: postsData, error: postsError } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return;
    }

    setPosts(postsData);
  }

  async function handleDeletePost(id: string) {
    // Only admins and editors can delete posts
    if (!['admin', 'editor'].includes(userRole ?? '')) {
      toast({
        title: "Error",
        description: "You don't have permission to delete blog posts",
        variant: "destructive",
      });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Blog post deleted successfully",
    });
    fetchPosts();
  }

  async function handleTogglePublish(post: BlogPost) {
    // All roles can toggle publish status
    const supabase = createClient();
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !post.published })
      .eq("id", post.id);

    if (error) {
      console.error("Error toggling post publish state:", error);
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Blog post ${post.published ? "unpublished" : "published"} successfully`,
    });
    fetchPosts();
  }

  const handleCreatePost = () => {
    // Only admins and editors can create posts
    if (!['admin', 'editor'].includes(userRole ?? '')) {
      toast({
        title: "Error",
        description: "Only administrators and editors can create blog posts",
        variant: "destructive",
      });
      return;
    }
    router.push('/admin/blog/new');
  };

  const handleEditPost = (post: BlogPost) => {
    // All roles can edit posts
    router.push(`/admin/blog/${post.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
          {['admin', 'editor'].includes(userRole) && (
            <Button onClick={handleCreatePost}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {post.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {post.excerpt}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(post.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(post)}
                        className={post.published ? "text-green-600" : ""}
                      >
                        {post.published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPost(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {['admin', 'editor'].includes(userRole) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
} 