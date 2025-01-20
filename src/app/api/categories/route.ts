import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Attempting to fetch categories...')
    
    // Simple query without role checks
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('name')

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('Categories fetched successfully:', data?.length || 0, 'categories')
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error in categories route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 