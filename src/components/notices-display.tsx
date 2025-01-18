'use client'

import { Sparkles } from "lucide-react"
import { Carousel } from "@/components/ui/carousel"
import Cards from "@/components/cards"
import type { Notice } from "@/types/notice"

interface NoticesDisplayProps {
  regularNotices: Notice[]
  sponsoredNotices: Notice[]
}

export function NoticesDisplay({ regularNotices, sponsoredNotices }: NoticesDisplayProps) {
  return (
    <>
      {/* Sponsored Posts */}
      {sponsoredNotices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <h2 className="text-lg font-semibold">Featured Posts</h2>
          </div>
          <div className="px-4 sm:px-6 lg:px-8">
            <Carousel opts={{ 
              align: "start", 
              loop: true,
              slidesToScroll: 1,
            }}>
              {sponsoredNotices.map((notice) => (
                <div key={notice.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-1 pr-1 sm:pl-2 sm:pr-2">
                  {Cards.getCardComponentByCategory(notice, true)}
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularNotices.map((notice) => (
          <div key={notice.id}>
            {Cards.getCardComponentByCategory(notice)}
          </div>
        ))}
      </div>
    </>
  )
} 