import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    
    console.log('Attempting to fetch notices...')

    // First, fetch paid notices for the carousel
    const { data: paidNotices, error: paidError } = await supabaseAdmin
      .from('notices')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon,
          slug
        )
      `)
      .eq('is_published', true)
      .eq('is_paid', true)
      .order('created_at', { ascending: false })

    if (paidError) {
      console.error('Error fetching paid notices:', paidError)
    }

    // Then fetch regular notices
    let query = supabaseAdmin
      .from('notices')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon,
          slug
        )
      `)
      .eq('is_published', true)
      .eq('is_paid', false)
      .order('created_at', { ascending: false })

    // Add category filter if specified
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: regularNotices, error: regularError } = await query

    if (regularError) {
      console.error('Error fetching regular notices:', regularError)
      return NextResponse.json(
        { error: regularError.message },
        { status: 500 }
      )
    }

    // Transform notice data
    const transformNotice = (notice: any) => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      priority: notice.priority || 'low',
      category: notice.categories || {
        id: notice.category_id,
        name: 'Uncategorized',
        icon: 'FileText',
        slug: 'uncategorized'
      },
      category_id: notice.category_id,
      posted_at: notice.published_at || notice.created_at,
      expires_at: notice.expires_at,
      created_at: notice.created_at,
      created_by: notice.created_by,
      published: notice.is_published,
      is_sponsored: notice.is_paid || false
    })

    const transformedPaidNotices = (paidNotices || []).map(transformNotice)
    const transformedRegularNotices = (regularNotices || []).map(transformNotice)

    console.log('Notices fetched successfully:', {
      paid: transformedPaidNotices.length,
      regular: transformedRegularNotices.length
    })

    return NextResponse.json({
      paid: transformedPaidNotices,
      regular: transformedRegularNotices
    })
  } catch (error) {
    console.error('Unexpected error in notices route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Skip reCAPTCHA verification in development
    if (process.env.NODE_ENV === 'production') {
      // Verify reCAPTCHA token
      const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify'
      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${body.captchaToken}`,
      })

      const verificationData = await verificationResponse.json()

      if (!verificationData.success) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        )
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('notices')
      .insert([
        {
          title: body.title,
          content: body.content,
          category_id: body.category_id,
          priority: body.priority,
          expires_at: body.expires_at,
          submitter_email: body.submitter_email,
          status: 'draft',
          is_published: false,
          is_paid: false,
        }
      ])
      .select()

    if (error) {
      console.error('Error creating notice:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Unexpected error in notices route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 