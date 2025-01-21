import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
    tests: {},
  };

  try {
    const supabase = createClient();

    // Test 1: Categories (public access)
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('count')
        .limit(1);
      
      results.tests.categories = {
        success: !catError,
        error: catError ? {
          message: catError.message,
          code: catError.code,
        } : null,
        hasData: !!categories,
      };
    } catch (e) {
      results.tests.categories = { success: false, error: e };
    }

    // Test 2: Auth Status
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      results.tests.auth = {
        success: !authError,
        error: authError ? {
          message: authError.message,
          code: authError.code,
        } : null,
        hasSession: !!session,
      };
    } catch (e) {
      results.tests.auth = { success: false, error: e };
    }

    // Test 3: Notices (RLS protected)
    try {
      const { data: notices, error: noticesError } = await supabase
        .from('notices')
        .select('count')
        .limit(1);
      
      results.tests.notices = {
        success: !noticesError,
        error: noticesError ? {
          message: noticesError.message,
          code: noticesError.code,
        } : null,
        hasData: !!notices,
      };
    } catch (e) {
      results.tests.notices = { success: false, error: e };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({
      ...results,
      error: {
        message: error.message,
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 