"use client";

import { formatDate } from "@/lib/date-utils";
import { Notice } from "@/types/notice";
import { getCategoryIcon } from "@/components/ui/category-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

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
        </div>
        <CardTitle>{notice.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{notice.content}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Posted: {formatDate(notice.postedAt || null)}</span>
            {notice.expiresAt && (
              <span>Expires: {formatDate(notice.expiresAt || null)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 