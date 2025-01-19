"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { NoticeForm } from "@/components/admin/notice-form"
import { supabase } from "@/lib/supabase"
import type { Category } from "@/types/notice"

export default function CreateNoticePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        console.error("Error fetching categories:", error)
        return
      }

      setCategories(data || [])
    }

    fetchCategories()
  }, [])

  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Post a Notice</h1>
      <NoticeForm onClose={handleClose} categories={categories} />
    </div>
  )
} 