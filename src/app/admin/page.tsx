"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Notice } from "@/types/notice";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NoticeForm } from "@/components/admin/notice-form";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createAuthClient();
  const { toast } = useToast();

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("posted_at", { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch notices: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Notice deleted successfully",
      });
      
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete notice: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedNotice(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: Partial<Notice>) => {
    try {
      if (selectedNotice) {
        // Update existing notice
        const { error } = await supabase
          .from("notices")
          .update(formData)
          .eq("id", selectedNotice.id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Notice updated successfully",
        });
      } else {
        // Create new notice
        const { error } = await supabase.from("notices").insert(formData);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Notice created successfully",
        });
      }

      setIsDialogOpen(false);
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save notice: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-lg">Loading notices...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Notices</h2>
        <Button onClick={handleCreate} className="flex items-center gap-2">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td className="whitespace-nowrap px-6 py-4">{notice.title}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {notice.category}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {new Date(notice.posted_at || "").toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(notice)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(notice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNotice ? "Edit Notice" : "Create Notice"}
            </DialogTitle>
          </DialogHeader>
          <NoticeForm
            notice={selectedNotice}
            onSubmit={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 