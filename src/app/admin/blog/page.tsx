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
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
          {['admin', 'editor'].includes(userRole) && (
            <Button onClick={handleCreatePost} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Post
            </Button>
          )}
        </div>

        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {post.excerpt}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(post)}
                          className={post.published ? "text-green-600" : "text-gray-400"}
                        >
                          {post.published ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {['admin', 'editor'].includes(userRole) && (
                          <Button
                            variant="outline"
                            size="sm"
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
        </div>
      </div>
    </div>
  );
} 