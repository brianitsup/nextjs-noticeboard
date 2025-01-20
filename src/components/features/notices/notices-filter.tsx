'use client'

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Notice } from "@/types/notice"
import { createClient } from "@/lib/supabase/client"
import { getCategoryIcon } from "@/components/ui/category-icon"

interface NoticesFilterProps {
  notices: Notice[]
  onFilteredNotices: (notices: Notice[]) => void
}

interface Category {
  id: string
  name: string
  icon: string
}

export function NoticesFilter({ notices, onFilteredNotices }: NoticesFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon')
        .order('name')
      
      if (!error && data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase()
    const filtered = notices.filter(notice => 
      notice.title.toLowerCase().includes(searchTerm) ||
      notice.content.toLowerCase().includes(searchTerm)
    )
    onFilteredNotices(filtered)
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      onFilteredNotices(notices)
      return
    }
    
    const filtered = notices.filter(notice => {
      if (typeof notice.category === 'object' && notice.category) {
        return notice.category.id === value
      }
      return false
    })
    onFilteredNotices(filtered)
  }

  const handleSortChange = (value: string) => {
    const sorted = [...notices].sort((a, b) => {
      const dateA = new Date(a.posted_at || a.postedAt || '').getTime()
      const dateB = new Date(b.posted_at || b.postedAt || '').getTime()
      return value === 'newest' ? dateB - dateA : dateA - dateB
    })
    onFilteredNotices(sorted)
  }

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-lg font-semibold">Filter Notices</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search notices..." 
            className="pl-9" 
            onChange={handleSearch}
          />
        </div>
        <Select onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center gap-2">
                  {getCategoryIcon(category.name)}
                  {category.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleSortChange}>
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
  )
} 