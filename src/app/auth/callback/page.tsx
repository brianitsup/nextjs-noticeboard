"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const returnTo = searchParams.get("returnTo") || "/"

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error:", error.message)
        router.push("/auth/sign-in")
        return
      }

      if (session) {
        router.push(returnTo)
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we complete the sign-in process.</p>
      </div>
    </div>
  )
} 