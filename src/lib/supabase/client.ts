import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Debug function to safely stringify objects with circular references
const safeStringify = (obj: any, indent = 2) => {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      return value;
    },
    indent
  );
};

// Debug logger with timestamp
export const logSupabaseError = (error: any, context: string) => {
  console.error(`[Supabase Error ${new Date().toISOString()}] ${context}:`, safeStringify({
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    status: error.status,
    statusText: error.statusText,
  }));
};

export const logSupabaseResponse = (response: any, context: string) => {
  console.debug(`[Supabase Debug ${new Date().toISOString()}] ${context}:`, safeStringify({
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    error: response.error,
  }));
};

// Singleton instance
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Create a single supabase client for interacting with your database
export const createClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }

  console.debug(`[Supabase ${new Date().toISOString()}] Creating new client instance for URL:`, process.env.NEXT_PUBLIC_SUPABASE_URL);

  try {
    supabaseInstance = createClientComponentClient<Database>();

    // Test the connection with multiple queries to verify different aspects
    const testConnection = async () => {
      if (!supabaseInstance) return;

      try {
        // Test 1: Basic connection
        const { data: catCount, error: catError } = await supabaseInstance
          .from('categories')
          .select('*', { count: 'exact', head: true });
        
        if (catError) {
          console.error('[Supabase] Categories test failed:', catError);
        } else {
          console.debug('[Supabase] Categories test successful');
        }

        // Test 2: Auth status
        const { data: { session }, error: authError } = await supabaseInstance.auth.getSession();
        if (authError) {
          console.error('[Supabase] Auth test failed:', authError);
        } else {
          console.debug('[Supabase] Auth test successful, session:', session ? 'exists' : 'none');
        }

        // Test 3: RLS policies
        const { data: notices, error: noticesError } = await supabaseInstance
          .from('notices')
          .select('count')
          .limit(1);
        
        if (noticesError) {
          console.error('[Supabase] Notices test failed:', noticesError);
        } else {
          console.debug('[Supabase] Notices test successful');
        }

      } catch (error) {
        console.error('[Supabase] Connection tests failed:', error);
      }
    };

    void testConnection();

    return supabaseInstance;
  } catch (error) {
    logSupabaseError(error, 'Client creation failed');
    throw error;
  }
}; 