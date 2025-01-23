'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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

export const createClient = () => {
  return createClientComponentClient();
}

export const supabase = createClient();