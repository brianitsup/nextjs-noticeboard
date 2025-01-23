import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '../../types/supabase';
import { logSupabaseError } from './client';

export const createServerClient = () => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.debug(`[Supabase Server ${new Date().toISOString()}] Creating server client for environment:`, isDevelopment ? 'development' : 'production');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    return createServerComponentClient<Database>({ cookies });
  } catch (error) {
    logSupabaseError(error, 'Server client creation failed');
    throw error;
  }
}; 