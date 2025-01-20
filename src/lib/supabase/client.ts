import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

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

// Debug logger
export const logSupabaseError = (error: any, context: string) => {
  console.error(`[Supabase Error] ${context}:`, safeStringify({
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  }));
};

export const logSupabaseResponse = (response: any, context: string) => {
  console.debug(`[Supabase Debug] ${context}:`, safeStringify({
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    error: response.error,
  }));
};

// Create a single supabase client for interacting with your database
export const createClient = () => {
  return createClientComponentClient<Database>();
}; 