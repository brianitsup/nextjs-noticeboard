"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { NoticeForm } from "@/components/admin/notice-form"
import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/types/notice"

export default function CreateNoticePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        console.error("Error fetching categories:", error)
        return
      }

      setCategories(data || [])
      setIsLoading(false)
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Post a Notice</h1>
      <NoticeForm onClose={handleClose} categories={categories} isOpen={true} />
    </div>
  )
} 