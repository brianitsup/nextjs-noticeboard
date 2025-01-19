import { Metadata } from "next"
import { Bell, Megaphone, AlertCircle, Calendar, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import type { Notice } from "@/types/notice"
import { SupabaseStatus } from "@/components/supabase-status"
import { NoticesDisplay } from "@/components/notices-display"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "Notice Board - Public Announcements & Ads",
  description: "A digital notice board for public announcements, advertisements, and promotions",
}

function transformNotice(notice: any): Notice {
  return {
    ...notice,
    postedAt: notice.posted_at,
    expiresAt: notice.expires_at,
    isSponsored: notice.is_sponsored,
    category: notice.category
  }
}

async function getNotices() {
  const { data: regularNotices, error: regularError } = await supabase
    .from('notices')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_sponsored', false)
    .eq('published', true)
    .order('posted_at', { ascending: false })

  const { data: sponsoredNotices, error: sponsoredError } = await supabase
    .from('notices')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_sponsored', true)
    .eq('published', true)
    .order('posted_at', { ascending: false })

  if (regularError || sponsoredError) {
    console.error('Error fetching notices:', regularError || sponsoredError)
    return { regularNotices: [], sponsoredNotices: [] }
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
      {/* Hero Section with Sponsored Notices */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Featured Notices</h2>
          <NoticesDisplay 
            regularNotices={[]}
            sponsoredNotices={sponsoredNotices}
          />
        </div>
      </section>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold">Filter Notices</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search notices..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Regular Notices */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Notices</h2>
          <NoticesDisplay 
            regularNotices={regularNotices}
            sponsoredNotices={[]}
          />
        </div>

        {/* Supabase Connection Status */}
        <SupabaseStatus />
      </main>
    </div>
  )
}
