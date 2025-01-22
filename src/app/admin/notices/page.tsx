"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, logSupabaseError } from "@/lib/supabase/client";
import type { Notice, Category, UserRole } from "@/types/notice";
import { NoticeForm } from "@/components/admin/notice-form";
import { formatDate } from "@/lib/date-utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function NoticesManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
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
      fetchData();
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

      // Check if user has admin role from session metadata
      const isAdmin = session.user.role === 'admin' || session.user.app_metadata?.role === 'admin';
      const role = isAdmin ? 'admin' : 'user';

      if (!isAdmin) {
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
      logSupabaseError(error, "Checking authentication");
      toast({
        title: "Authentication Error",
        description: "Please sign in to access this area.",
        variant: "destructive",
      });
      router.push('/auth/admin-signin');
    }
  }

  async function fetchData() {
    try {
      const [noticesResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('notices')
          .select(`
            *,
            category:categories!fk_category(*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
      ]);

      if (noticesResponse.error) throw noticesResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setNotices(noticesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      logSupabaseError(error, "Fetching notices data");
      toast({
        title: "Error",
        description: "Failed to load data. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteNotice(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting notice:", error);
      toast({
        title: "Error",
        description: "You don't have permission to delete this notice",
        variant: "destructive",
      });
      return;
    }

    fetchData();
  }

  async function handleTogglePublish(notice: Notice) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("notices")
      .update({ published: !notice.published })
      .eq("id", notice.id);

    if (error) {
      console.error("Error toggling notice publish state:", error);
      toast({
        title: "Error",
        description: "You don't have permission to update this notice",
        variant: "destructive",
      });
      return;
    }

    fetchData();
  }

  async function handleToggleSponsored(notice: Notice) {
    if (userRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only administrators can change sponsored status",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("notices")
      .update({ is_sponsored: !notice.is_sponsored })
      .eq("id", notice.id);

    if (error) {
      console.error("Error toggling notice sponsored state:", error);
      toast({
        title: "Error",
        description: "Failed to update notice",
        variant: "destructive",
      });
      return;
    }

    fetchData();
  }

  const handleCreateNotice = () => {
    setSelectedNotice(null);
    setIsCreateModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsCreateModalOpen(true);
  };

  const handleCloseNoticeModal = async () => {
    setIsCreateModalOpen(false);
    await fetchData();
  };

  return (
    <div className="container mx-auto px-4">
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Notices</h1>
          <Button onClick={handleCreateNotice}>
            <Plus className="h-4 w-4 mr-2" />
            Create Notice
          </Button>
        </div>

        <div className="grid gap-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {notice.category && typeof notice.category !== 'string' && (
                      <CategoryIcon
                        name={notice.category.icon || "default"}
                        className="h-4 w-4"
                      />
                    )}
                    <h3 className="font-semibold">{notice.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created on {formatDate(notice.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleSponsored(notice)}
                    className={notice.is_sponsored ? "text-yellow-500" : ""}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(notice)}
                  >
                    {notice.published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditNotice(notice)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNotice(notice.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {isCreateModalOpen && (
          <NoticeForm
            notice={selectedNotice}
            categories={categories}
            onClose={handleCloseNoticeModal}
            isOpen={isCreateModalOpen}
          />
        )}
      </div>
    </div>
  );
} 