import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

const defaultCategories = [
  { name: 'Advertisement', slug: 'advertisement', icon: 'Megaphone' },
  { name: 'Announcement', slug: 'announcement', icon: 'Bell' },
  { name: 'Event', slug: 'event', icon: 'Calendar' },
  { name: 'List', slug: 'list', icon: 'ListTodo' },
  { name: 'Press Release', slug: 'press-release', icon: 'BookOpen' },
  { name: 'Promotion', slug: 'promotion', icon: 'AlertCircle' },
]

export async function GET() {
  try {
    // First, check if we need to initialize categories
    const { data: existingCategories } = await supabaseAdmin
      .from('categories')
      .select('*')

    if (!existingCategories?.length) {
      // Initialize categories with icons
      const { data: categories, error: insertError } = await supabaseAdmin
        .from('categories')
        .insert(defaultCategories)
        .select()

      if (insertError) throw insertError
      return NextResponse.json(categories)
    }

    // Update existing categories with icons if they don't have them
    const { data: categories, error: updateError } = await supabaseAdmin
      .from('categories')
      .upsert(
        existingCategories.map((cat: any) => ({
          ...cat,
          icon: defaultCategories.find(d => d.slug === cat.slug)?.icon || 'FileText'
        }))
      )
      .select()

    if (updateError) throw updateError
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
} 