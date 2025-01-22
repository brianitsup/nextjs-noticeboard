import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();

    // Query to get all policies for the categories table
    const { data: policies, error } = await supabase
      .rpc('get_policies_info', {
        target_table: 'categories'
      });

    if (error) {
      console.error('Error getting policies:', error);
      return NextResponse.json({
        error: error.message,
        hint: "Failed to get policies information"
      }, { status: 500 });
    }

    return NextResponse.json({ policies });
  } catch (error: any) {
    console.error('Error in debug-policies:', error);
    return NextResponse.json({
      error: error.message,
      hint: "Failed to connect to database"
    }, { status: 500 });
  }
} 