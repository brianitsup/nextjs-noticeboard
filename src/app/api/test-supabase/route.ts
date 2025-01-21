import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Query to list all tables and their columns in the public schema
    const { data: schema, error: schemaError } = await supabase.rpc('get_schema_info', {});
    
    if (schemaError) {
      // If the function doesn't exist, create it first
      await supabase.rpc('create_schema_helper', {});
      
      // Try again to get schema info
      const { data: retrySchema, error: retryError } = await supabase.rpc('get_schema_info', {});
      
      return NextResponse.json({
        status: 'checking schema',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        error: retryError ? {
          message: retryError.message,
          code: retryError.code,
          details: retryError.details,
        } : null,
        schema: retrySchema,
      });
    }

    return NextResponse.json({
      status: 'checking schema',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      error: null,
      schema,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: {
        message: error.message,
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 