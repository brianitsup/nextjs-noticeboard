"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import type { Notice } from "@/types/notice"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/date-utils"
import { getCategoryIcon } from "@/components/ui/category-icon"
import { Badge } from "@/components/ui/badge"

interface BaseNoticeCardProps {
  notice: Notice
  children?: React.ReactNode
  isSponsored?: boolean
}

export function BaseNoticeCard({ notice, children, isSponsored }: BaseNoticeCardProps) {
  const isExpired = notice.expiresAt ? new Date(notice.expiresAt) < new Date() : false
  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  }

  const categoryIcon = typeof notice.category === 'string' 
    ? notice.category as string
    : (notice.category?.icon as string) || 'FileText' // Default icon if none is specified

  const categoryName = typeof notice.category === 'string'
    ? (notice.category as string).charAt(0).toUpperCase() + (notice.category as string).slice(1)
    : notice.category?.name ?? 'Uncategorized'

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isExpired ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {getCategoryIcon(categoryIcon)}
          {categoryName}
        </span>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold leading-tight">{notice.title}</h3>
          {isSponsored && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Sponsored
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {notice.priority && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[notice.priority as keyof typeof priorityColors]}`}>
              {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)} Priority
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            Posted {formatDate(notice.postedAt || null)}
          </span>
          {notice.expiresAt && (
            <span className="text-xs text-muted-foreground">
              Expires {formatDate(notice.expiresAt)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{notice.content}</p>
        {children}
      </CardContent>
    </Card>
  )
} 