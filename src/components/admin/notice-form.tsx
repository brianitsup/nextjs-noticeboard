"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { Notice, Category } from "@/types/notice"
import { getCategoryIcon } from "@/components/ui/category-icon"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  category_id: z.string({
    required_error: "Please select a category.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority level.",
  }),
  expiresAt: z.date().nullable().refine(
    (date) => {
      if (!date) return true;
      return date > new Date();
    },
    {
      message: "Expiry date must be in the future",
    }
  ),
})

export interface NoticeFormProps {
  notice?: Notice | null;
  categories: Category[];
  onClose: () => void;
  isOpen: boolean;
}

export function NoticeForm({ notice, categories, onClose, isOpen }: NoticeFormProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: notice?.title || "",
      content: notice?.content || "",
      category_id: notice?.category_id || "",
      priority: (notice?.priority as "low" | "medium" | "high") || "medium",
      expiresAt: notice?.expiresAt ? new Date(notice.expiresAt) : null,
    },
  })

  // Get the selected category for the SelectValue display
  const getSelectedCategory = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create or edit notices",
          variant: "destructive",
        });
        return;
      }

      const { expiresAt, ...rest } = values;
      const noticeData = {
        ...rest,
        expires_at: expiresAt,
        posted_at: new Date().toISOString(),
        posted_by: session.user.id,
        created_by: session.user.id,
        published: true,
      }

      if (notice?.id) {
        const { error } = await supabase
          .from("notices")
          .update(noticeData)
          .eq("id", notice.id)

        if (error) throw error;
        toast({
          title: "Success",
          description: "Notice updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("notices")
          .insert([noticeData])

        if (error) {
          console.error("Error details:", error);
          throw error;
        }
        toast({
          title: "Success",
          description: "Notice created successfully",
        });
      }

      onClose()
    } catch (error: any) {
      console.error("Error saving notice:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save notice",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{notice ? "Edit Notice" : "Create Notice"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter notice title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear and concise title for your notice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notice content"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main content of your notice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {field.value && (
                            <span className="flex items-center gap-2">
                              {(() => {
                                const category = getSelectedCategory(field.value);
                                const icon = category?.icon;
                                return icon ? getCategoryIcon(icon) : null;
                              })()}
                              {getSelectedCategory(field.value)?.name || 'Select a category'}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            {category.icon && getCategoryIcon(category.icon)}
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of notice you want to create.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the priority level of your notice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full rounded-md border p-2"
                      placeholderText="Select expiry date and time"
                    />
                  </FormControl>
                  <FormDescription>
                    When should this notice expire?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 