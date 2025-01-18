"use client"

import { useRouter } from "next/navigation"
import { NoticeForm } from "@/components/notice-form"

export default function CreateNoticePage() {
  const router = useRouter()

  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Post a Notice</h1>
      <NoticeForm onClose={handleClose} />
    </div>
  )
} 