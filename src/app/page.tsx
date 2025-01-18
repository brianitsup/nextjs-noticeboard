import { Metadata } from "next"
import { Plus, Bell, Megaphone, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import type { Notice } from "@/types/notice"
import { SupabaseStatus } from "@/components/supabase-status"
import { NoticesDisplay } from "@/components/notices-display"

export const metadata: Metadata = {
  title: "Notice Board - Public Announcements & Ads",
  description: "A digital notice board for public announcements, advertisements, and promotions",
}

function transformNotice(notice: any): Notice {
  return {
    ...notice,
    postedAt: notice.posted_at,
    expiresAt: notice.expires_at,
    isSponsored: notice.is_sponsored
  }
}

async function getNotices() {
  const { data: regularNotices, error: regularError } = await supabase
    .from('notices')
    .select('*')
    .eq('is_sponsored', false)
    .order('posted_at', { ascending: false })

  const { data: sponsoredNotices, error: sponsoredError } = await supabase
    .from('notices')
    .select('*')
    .eq('is_sponsored', true)
    .order('posted_at', { ascending: false })

  if (regularError || sponsoredError) {
    console.error('Error fetching notices:', regularError || sponsoredError)
    return { regularNotices: [], sponsoredNotices: [] }
  }

  // Enhanced debug logging
  if (regularNotices?.[0]) {
    console.log('Sample notice data:', {
      id: regularNotices[0].id,
      title: regularNotices[0].title,
      posted_at: regularNotices[0].posted_at,
      expires_at: regularNotices[0].expires_at,
      is_sponsored: regularNotices[0].is_sponsored
    })
  }

  return {
    regularNotices: (regularNotices || []).map(transformNotice),
    sponsoredNotices: (sponsoredNotices || []).map(transformNotice)
  }
}

export default async function Home() {
  const { regularNotices, sponsoredNotices } = await getNotices()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Notice Board</h1>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Make a Post
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="announcement">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Announcements
                </span>
              </SelectItem>
              <SelectItem value="advertisement">
                <span className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Advertisements
                </span>
              </SelectItem>
              <SelectItem value="promotion">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Promotions
                </span>
              </SelectItem>
              <SelectItem value="event">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notices Display */}
        <NoticesDisplay 
          regularNotices={regularNotices}
          sponsoredNotices={sponsoredNotices}
        />

        {/* Supabase Connection Status */}
        <SupabaseStatus />
      </main>
    </div>
  )
}
