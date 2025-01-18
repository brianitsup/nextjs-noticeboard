'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function SupabaseStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('id')
          .limit(1)
        
        if (error) throw error
        setStatus('connected')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        {status === 'loading' && (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span>Checking connection...</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Connected to Supabase</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Connection Error: {error}</span>
          </>
        )}
      </div>
    </div>
  )
} 