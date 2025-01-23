"use client";

import { formatDate } from "@/lib/date-utils";
import { Notice } from "@/types/notice";
import { getCategoryIcon } from "@/components/ui/category-icon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight } from "lucide-react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface NoticeCardProps {
  notice: Notice;
  isPaid?: boolean;
}

export function NoticeCard({ notice, isPaid = false }: NoticeCardProps) {
  const categoryIcon = typeof notice.category === 'string' 
    ? 'FileText'  // Default icon if category is just a string
    : notice.category?.icon || 'FileText';

  const categoryName = typeof notice.category === 'string'
    ? notice.category
    : notice.category?.name || 'Uncategorized';

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card 
          className={cn(
            "h-[300px] cursor-pointer transition-all hover:shadow-md",
            isPaid ? "border-yellow-500 shadow-lg" : undefined
          )}
        >
          <CardHeader className="space-y-2 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCategoryIcon(categoryIcon)}
                <span className="text-sm text-muted-foreground">
                  {categoryName}
                </span>
              </div>
              <div className="flex gap-2">
                {isPaid && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
                {notice.priority && (
                  <Badge variant="outline" className={priorityColors[notice.priority]}>
                    {notice.priority}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold leading-tight line-clamp-2">
                {notice.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(notice.posted_at || notice.created_at), "PPP")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-4">
                {notice.content}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
                <span>Click to read more</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(categoryIcon)}
            <span className="text-sm text-muted-foreground">
              {categoryName}
            </span>
            {isPaid && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                <Sparkles className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {notice.priority && (
              <Badge variant="outline" className={priorityColors[notice.priority]}>
                {notice.priority}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl">{notice.title}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <CalendarIcon className="h-4 w-4" />
            {format(new Date(notice.posted_at || notice.created_at), "PPP")}
            {notice.expires_at && (
              <span className="text-muted-foreground">
                (Expires: {format(new Date(notice.expires_at), "PPP")})
              </span>
            )}
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-base whitespace-pre-wrap">{notice.content}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 