"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, logSupabaseError, logSupabaseResponse } from "@/lib/supabase/client";
import type { Notice, Category, UserRole } from "@/types/notice";
import { NoticeForm } from "@/components/admin/notice-form";
import { CategoryForm } from "@/components/admin/category-form";
import { formatDate } from "@/lib/date-utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import React from "react";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";

export default function AdminDashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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
        router.push('/admin/signin');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      if (!userData || !['admin', 'editor', 'moderator'].includes(userData.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
        router.push('/');
        return;
      }

      setUserRole(userData.role as UserRole);
      setIsLoading(false);
    } catch (error) {
      logSupabaseError(error, "Checking authentication");
      toast({
        title: "Authentication Error",
        description: "Please sign in to access this area.",
        variant: "destructive",
      });
      router.push('/admin/signin');
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
      logSupabaseError(error, "Fetching admin data");
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

  async function handleDeleteCategory(id: string) {
    if (userRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only administrators can delete categories",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
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

  const handleCreateCategory = () => {
    if (!['admin', 'editor'].includes(userRole ?? '')) {
      toast({
        title: "Error",
        description: "Only administrators and editors can create categories",
        variant: "destructive",
      });
      return;
    }
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsCreateModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    if (!['admin', 'editor'].includes(userRole ?? '')) {
      toast({
        title: "Error",
        description: "Only administrators and editors can edit categories",
        variant: "destructive",
      });
      return;
    }
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseNoticeModal = async () => {
    setIsCreateModalOpen(false);
    setSelectedNotice(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      fetchData();
    }
  };

  const handleCloseCategoryModal = async () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchData();
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Manage Notices</h2>
            <Button onClick={handleCreateNotice} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Notice
            </Button>
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
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Posted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    {userRole === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Sponsored
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {notices.map((notice) => (
                    <tr key={notice.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {notice.title}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {typeof notice.category === 'string' 
                            ? notice.category
                            : notice.category?.name ?? 'Unknown'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {notice.postedAt ? formatDate(notice.postedAt) : 'N/A'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(notice)}
                            className={notice.published ? "text-green-600" : "text-gray-400"}
                          >
                            {notice.published ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                      {userRole === 'admin' && (
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-500">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSponsored(notice)}
                              className={notice.is_sponsored ? "text-yellow-500" : "text-gray-400"}
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditNotice(notice)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {(userRole === 'admin' || notice.created_by === (supabase.auth.getSession() as any)?.user?.id) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNotice(notice.id)}
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

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Manage Categories</h2>
            {['admin', 'editor'].includes(userRole ?? '') && (
              <Button onClick={handleCreateCategory} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Category
              </Button>
            )}
          </div>

          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {category.description}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          <CategoryIcon name={category.icon} />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex space-x-2">
                          {['admin', 'editor'].includes(userRole ?? '') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {userRole === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
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

        {isCreateModalOpen && (
          <NoticeForm
            isOpen={isCreateModalOpen}
            notice={selectedNotice}
            categories={categories}
            onClose={handleCloseNoticeModal}
          />
        )}
        {isCategoryModalOpen && (
          <CategoryForm
            isOpen={isCategoryModalOpen}
            category={selectedCategory}
            onClose={handleCloseCategoryModal}
          />
        )}
      </div>
    </div>
  );
} 