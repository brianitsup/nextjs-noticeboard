import { createClient } from '@supabase/supabase-js'
import { CategoryFilter } from "@/components/category-filter"
import { NoticeCard } from "@/components/notice-card"
import { Carousel } from "@/components/carousel"
import type { Notice, Category } from "@/types/notice"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const categoryId = searchParams.category as string
  const searchQuery = (searchParams.q as string)?.toLowerCase()
  const sortBy = searchParams.sort as string

  // Fetch paid notices
  const { data: paidNotices, error: paidError } = await supabase
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

  // Fetch regular notices
  let query = supabase
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

  // Add category filter if specified
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data: regularNotices, error: regularError } = await query.order('created_at', { ascending: sortBy === 'oldest' })

  if (regularError) {
    console.error('Error fetching regular notices:', regularError)
    throw new Error('Failed to fetch notices')
  }

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
    throw new Error('Failed to fetch categories')
  }

  // Transform notices
  const transformNotice = (notice: any): Notice => ({
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
    is_published: notice.is_published,
    is_sponsored: notice.is_paid || false
  })

  const transformedPaidNotices = (paidNotices || []).map(transformNotice)
  const transformedRegularNotices = (regularNotices || []).map(transformNotice)

  // Filter notices by search query if provided
  const filteredNotices = searchQuery
    ? transformedRegularNotices.filter(notice =>
        notice.title.toLowerCase().includes(searchQuery) ||
        notice.content.toLowerCase().includes(searchQuery)
      )
    : transformedRegularNotices

  return (
    <div className="min-h-screen">
      {/* Featured Notices */}
      {transformedPaidNotices.length > 0 && (
        <div className="w-full bg-muted/50">
          <div className="container py-8">
            <h2 className="text-2xl font-semibold mb-6">Featured Notices</h2>
            <Carousel>
              {transformedPaidNotices.map((notice) => (
                <div key={notice.id} className="keen-slider__slide">
                  <NoticeCard notice={notice} isPaid />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}

      <div className="container py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <div className="order-last lg:order-first">
            <CategoryFilter
              categories={categories}
              selectedCategory={categoryId}
            />
          </div>

          {/* Regular Notices */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">All Notices</h2>
            {filteredNotices.length === 0 ? (
              <p className="text-muted-foreground">No notices found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
