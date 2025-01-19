"use client";

import { useState, useEffect } from "react";
import { Notice } from "@/types/notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NoticeFormProps {
  notice?: Notice | null;
  onSubmit: (data: Partial<Notice>) => void;
  onCancel: () => void;
}

export function NoticeForm({ notice, onSubmit, onCancel }: NoticeFormProps) {
  const [formData, setFormData] = useState<Partial<Notice>>({
    title: "",
    content: "",
    category: "announcement",
    is_sponsored: false,
    priority: "low",
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        category: notice.category,
        is_sponsored: notice.is_sponsored || false,
        priority: notice.priority,
      });
    }
  }, [notice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      posted_at: new Date().toISOString(),
    });
  };

  return (
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
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category as string}
          onValueChange={(value: string) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="advertisement">Advertisement</SelectItem>
            <SelectItem value="promotion">Promotion</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value: Notice["priority"]) =>
            setFormData({ ...formData, priority: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="sponsored"
          checked={formData.is_sponsored}
          onCheckedChange={(checked: boolean) =>
            setFormData({ ...formData, is_sponsored: checked })
          }
        />
        <Label htmlFor="sponsored">Sponsored</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{notice ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
} 