'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Notice } from "@/types/notice"
import { NoticesDisplay } from "@/components/features/notices/notices-display"
import { NoticesFilter } from "@/components/features/notices/notices-filter"
import { dynamic, revalidate } from './config'

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

export default function Home() {
  const [notices, setNotices] = useState<{ regularNotices: Notice[], sponsoredNotices: Notice[] }>({ 
    regularNotices: [], 
    sponsoredNotices: [] 
  })
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([])

  // Fetch notices on component mount
  useEffect(() => {
    getNotices().then(setNotices)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Sponsored Notices */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Featured Notices</h2>
          <NoticesDisplay 
            regularNotices={[]}
            sponsoredNotices={notices.sponsoredNotices}
          />
        </div>
      </section>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <NoticesFilter 
          notices={notices.regularNotices}
          onFilteredNotices={setFilteredNotices}
        />

        {/* Regular Notices */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Notices</h2>
          <NoticesDisplay 
            regularNotices={filteredNotices.length > 0 ? filteredNotices : notices.regularNotices}
            sponsoredNotices={[]}
          />
        </div>
      </main>
    </div>
  )
}
