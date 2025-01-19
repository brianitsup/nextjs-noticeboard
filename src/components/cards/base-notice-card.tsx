"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import type { Notice } from "@/types/notice"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/date-utils"
import { getCategoryIcon } from "@/components/ui/category-icon"

interface BaseNoticeCardProps {
  notice: Notice
  isSponsored?: boolean
}

export function BaseNoticeCard({ notice, isSponsored = false }: BaseNoticeCardProps) {
  const postedDate = formatDate(notice.posted_at ?? notice.postedAt ?? null)
  const expiryDate = formatDate(notice.expires_at ?? notice.expiresAt ?? null)

  return (
    <Card className={cn(
      "transition-all hover:shadow-md relative flex flex-col h-full",
      isSponsored && "bg-gradient-to-b from-yellow-50/50 to-transparent"
    )}>
      {isSponsored && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100/50 text-yellow-800">
            <Sparkles className="h-3 w-3" />
            Sponsored
          </span>
        </div>
      )}
      <CardHeader className="pb-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {getCategoryIcon(notice.category)}
          {typeof notice.category === 'string' 
            ? notice.category.charAt(0).toUpperCase() + notice.category.slice(1)
            : notice.category?.name 
              ? notice.category.name.charAt(0).toUpperCase() + notice.category.name.slice(1)
              : 'Uncategorized'
          }
        </span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-2">{notice.title}</h3>
        <p className="text-muted-foreground mb-4">{notice.content}</p>
        <div className="text-xs text-muted-foreground space-y-1 mb-4">
          <p>Posted by: {notice.postedBy}</p>
          <p>Posted: {postedDate}</p>
          <p>Expires: {expiryDate}</p>
        </div>
        <Button variant="outline" className="w-full mt-auto flex items-center justify-center gap-2">
          View Details <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
} 