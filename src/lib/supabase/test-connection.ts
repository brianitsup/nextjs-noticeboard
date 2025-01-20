import { createClient } from '@/lib/supabase/client';

export async function testConnection() {
  const supabase = createClient();
  
  try {
    // Test the connection by fetching a single row
    const { data, error } = await supabase
      .from('notices')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase Error:', error);
      return { success: false, error };
    }

    console.log('Supabase Connection Test:', { success: true, data });
    return { success: true, data };
  } catch (error) {
    console.error('Connection Test Error:', error);
    return { success: false, error };
  }
} 