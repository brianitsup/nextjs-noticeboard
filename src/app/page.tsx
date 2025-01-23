"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CategoryFilter } from "@/components/category-filter"
import { NoticeCard } from "@/components/notice-card"
import { Carousel } from "@/components/carousel"
import type { Notice, Category } from "@/types/notice"

export default function Home() {
  const searchParams = useSearchParams()
  const [notices, setNotices] = useState<Notice[]>([])
  const [paidNotices, setPaidNotices] = useState<Notice[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || "")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noticesRes, categoriesRes] = await Promise.all([
          fetch('/api/notices'),
          fetch('/api/categories')
        ])

        if (!noticesRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const noticesData = await noticesRes.json()
        const categoriesData = await categoriesRes.json()

        // Transform the data to match the Notice type
        const transformNotice = (notice: any): Notice => ({
          ...notice,
          created_at: new Date(notice.created_at),
          posted_at: notice.posted_at ? new Date(notice.posted_at) : undefined,
          expires_at: notice.expires_at ? new Date(notice.expires_at) : undefined,
          event_date: notice.event_date ? new Date(notice.event_date) : undefined,
        })

        setNotices((noticesData.regular || []).map(transformNotice))
        setPaidNotices((noticesData.paid || []).map(transformNotice))
        setCategories(categoriesData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const filteredNotices = notices.filter(notice => {
    const matchesCategory = !selectedCategory || notice.category_id === selectedCategory
    const searchQuery = searchParams.get('q')?.toLowerCase()
    const matchesSearch = !searchQuery || 
      notice.title.toLowerCase().includes(searchQuery) || 
      notice.content.toLowerCase().includes(searchQuery)
    return matchesCategory && matchesSearch
  })

  const sortedNotices = [...filteredNotices].sort((a, b) => {
    const sortBy = searchParams.get('sort')
    if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      {/* Featured Notices */}
      {paidNotices.length > 0 && (
        <div className="w-full bg-muted/50">
          <div className="container py-8">
            <h2 className="text-2xl font-semibold mb-6">Featured Notices</h2>
            <Carousel>
              {paidNotices.map((notice) => (
                <div key={notice.id} className="keen-slider__slide">
                  <NoticeCard notice={notice} isPaid />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}

      <div className="container py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <div className="order-last lg:order-first">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Regular Notices */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">All Notices</h2>
            {sortedNotices.length === 0 ? (
              <p className="text-muted-foreground">No notices found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
