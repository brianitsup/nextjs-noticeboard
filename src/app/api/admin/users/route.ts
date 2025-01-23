import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../../../../types/supabase';

// Export config for Next.js Edge Runtime
export const runtime = 'edge';

// Initialize admin client only if environment variables are available
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Required environment variables are missing');
  }

  console.debug(`[Admin API ${new Date().toISOString()}] Initializing admin client for environment:`, isDevelopment ? 'development' : 'production');

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
};

// Get the regular client for user context
const getSupabaseClient = () => {
  return createRouteHandlerClient<Database>({ cookies });
};

// Export the GET handler
export async function GET(request: Request) {
  try {
    const adminClient = getSupabaseAdmin();
    const userClient = getSupabaseClient();

    // Verify the user has admin access
    const { data: { session }, error: authError } = await userClient.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData, error: userError } = await userClient
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users
    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Ensure we're getting a proper request
    if (!req.body) {
      return NextResponse.json({ error: 'No request body' }, { status: 400 });
    }

    // Parse request body
    const requestData = await req.json();
    const { email, password } = requestData;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get auth cookie
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: adminCheck } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (adminCheck?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Get admin client
    const supabaseAdmin = getSupabaseAdmin();

    // Create auth user
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Initial delay for trigger
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify user creation with retries
    let verifyUser = null;
    let verifyError = null;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      const { data: userData, error: checkError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userData) {
        verifyUser = userData;
        break;
      }

      verifyError = checkError;
      // Wait before next retry (increasing delay)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }

    if (!verifyUser) {
      console.error('Error verifying user creation:', verifyError);
      return NextResponse.json(
        { 
          error: 'User created but verification failed. Please check user list.',
          userId: data.user.id
        },
        { status: 201 }
      );
    }

    return NextResponse.json({
      user: verifyUser,
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 