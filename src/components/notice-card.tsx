"use client";

import { formatDate } from "@/lib/date-utils";
import { Notice } from "@/types/notice";
import { getCategoryIcon } from "@/components/ui/category-icon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

interface NoticeCardProps {
  notice: Notice;
}

export function NoticeCard({ notice }: NoticeCardProps) {
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

  return (
    <Card className={notice.isSponsored ? "border-yellow-500" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(categoryIcon)}
            <span className="text-sm text-muted-foreground">
              {categoryName}
            </span>
          </div>
          {notice.isSponsored && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <Sparkles className="mr-1 h-3 w-3" />
              Sponsored
            </Badge>
          )}
          {notice.priority && (
            <Badge variant="outline" className={priorityColors[notice.priority]}>
              {notice.priority}
            </Badge>
          )}
        </div>
        <CardTitle>{notice.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(new Date(notice.posted_at || notice.created_at), "PPP")}
          {notice.expires_at && (
            <span className="text-muted-foreground">
              (Expires: {format(new Date(notice.expires_at), "PPP")})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{notice.content}</p>
        </div>
        {notice.is_sponsored && (
          <Badge variant="secondary" className="mt-4">
            Sponsored
          </Badge>
        )}
      </CardContent>
    </Card>
  );
} 