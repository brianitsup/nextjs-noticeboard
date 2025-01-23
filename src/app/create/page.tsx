"use client"

import { useRouter } from "next/navigation"
import CreateNoticeDialog from "@/components/create-notice-dialog"

export default function CreatePage() {
  const router = useRouter()

  return (
    <CreateNoticeDialog
      onClose={() => {
        router.push("/")
      }}
    />
  )
} 