import { createClient } from "@/lib/supabase/client"

// Define the standard icon mapping for categories
export const standardCategoryIcons = {
  announcement: 'Bell',
  advertisement: 'Megaphone',
  promotion: 'AlertCircle',
  event: 'Calendar',
  list: 'ListTodo',
  general: 'Info',
  news: 'Newspaper',
  alert: 'AlertTriangle',
  notice: 'FileText',
  update: 'RefreshCw'
} as const

export type CategoryName = keyof typeof standardCategoryIcons

// Function to update category icons in the database to match our standard icons
export async function updateCategoryIcons() {
  const supabase = createClient()
  const { data: categories, error: fetchError } = await supabase
    .from('categories')
    .select('id, name, icon')

  if (fetchError) {
    console.error('Error fetching categories:', fetchError)
    return
  }

  // Update each category with its standard icon if different
  for (const category of categories || []) {
    const standardIcon = standardCategoryIcons[category.name.toLowerCase() as CategoryName]
    if (standardIcon && standardIcon !== category.icon) {
      const { error: updateError } = await supabase
        .from('categories')
        .update({ icon: standardIcon })
        .eq('id', category.id)

      if (updateError) {
        console.error(`Error updating category ${category.name}:`, updateError)
      }
    }
  }
}

// Function to get the standard icon name for a category
export function getStandardIconName(categoryName: string): string {
  return standardCategoryIcons[categoryName.toLowerCase() as CategoryName] || 'FileText'
} 