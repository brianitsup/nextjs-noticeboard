import { createClient } from './client';
import { logSupabaseError, logSupabaseResponse } from './client';

export async function testConnection() {
  const supabase = createClient();
  
  try {
    // Test 1: Basic connection and categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (catError) {
      logSupabaseError(catError, 'Categories test failed');
      return { success: false, error: catError };
    }
    logSupabaseResponse({ data: categories }, 'Categories test successful');

    // Test 2: Auth status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      logSupabaseError(authError, 'Auth test failed');
      return { success: false, error: authError };
    }
    logSupabaseResponse({ data: { hasSession: !!session } }, 'Auth test successful');

    // Test 3: Notices with RLS
    const { data: notices, error: noticesError } = await supabase
      .from('notices')
      .select('count')
      .limit(1);

    if (noticesError) {
      logSupabaseError(noticesError, 'Notices test failed');
      return { success: false, error: noticesError };
    }
    logSupabaseResponse({ data: notices }, 'Notices test successful');

    return { 
      success: true, 
      data: {
        categories: categories,
        hasSession: !!session,
        notices: notices
      }
    };
  } catch (error) {
    logSupabaseError(error, 'Connection test failed');
    return { success: false, error };
  }
} 