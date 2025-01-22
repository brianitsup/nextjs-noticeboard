"use client"

import { useEffect, useState } from "react"
import type { Notice, Category } from "@/types/notice"
import { NoticeCard } from "@/components/notice-card"
import { CategoryFilter } from "@/components/category-filter"
import { useToast } from "@/components/ui/use-toast"
import { Carousel } from "@/components/ui/carousel"

export default function Home() {
  const [regularNotices, setRegularNotices] = useState<Notice[]>([])
  const [sponsoredNotices, setSponsoredNotices] = useState<Notice[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [selectedCategory])

  function transformNotice(notice: any): Notice {
    return {
      ...notice,
      category: notice.categories || notice.category,
      postedAt: notice.posted_at,
      postedBy: notice.posted_by,
      expiresAt: notice.expires_at,
      isSponsored: notice.is_sponsored
    }
  }

  async function fetchData() {
    try {
      // Fetch categories from our API
      const categoriesRes = await fetch('/api/categories')
      if (!categoriesRes.ok) {
        throw new Error('Failed to fetch categories')
      }
      const categoriesData = await categoriesRes.json()
      setCategories(categoriesData || [])

      // Fetch notices from our API
      const noticesUrl = selectedCategory 
        ? `/api/notices?category=${selectedCategory}`
        : '/api/notices'
      
      const noticesRes = await fetch(noticesUrl)
      if (!noticesRes.ok) {
        throw new Error('Failed to fetch notices')
      }
      const noticesData = await noticesRes.json()
      
      // Separate notices into regular and sponsored
      const regular: Notice[] = []
      const sponsored: Notice[] = []
      
      noticesData.forEach((notice: any) => {
        const transformedNotice = transformNotice(notice)
        if (transformedNotice.isSponsored) {
          sponsored.push(transformedNotice)
        } else {
          regular.push(transformedNotice)
        }
      })

      setRegularNotices(regular)
      setSponsoredNotices(sponsored)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try refreshing the page.",
        variant: "destructive",
      })
    }
  }

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Sponsored Notices Carousel */}
      {sponsoredNotices.length > 0 && (
        <div className="mb-12">
          <Carousel opts={{ 
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}>
            {sponsoredNotices.map((notice) => (
              <div key={notice.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-1 pr-1 sm:pl-2 sm:pr-2">
                <NoticeCard notice={notice} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
      
      {/* Category Filter */}
      <div className="mb-8">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Regular Notices */}
      <section>
        <h2 className="text-2xl font-bold mb-4">All Notices</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
          {regularNotices.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No notices found.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
