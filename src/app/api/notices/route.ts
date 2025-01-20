import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    
    console.log('Attempting to fetch notices...')

    // Build the base query without role checks
    let query = supabase
      .from('notices')
      .select(`
        id,
        title,
        content,
        category_id,
        expires_at,
        priority,
        posted_by,
        created_by,
        posted_at,
        created_at,
        is_sponsored,
        published,
        categories!notices_category_id_fkey (
          id,
          name,
          icon
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

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

    console.log('Notices fetched successfully:', data?.length || 0, 'notices')
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error in notices route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 