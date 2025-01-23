import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface SetupUser {
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'moderator';
}

const users: SetupUser[] = [
  {
    email: 'admin@noticeboard.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'editor@noticeboard.com',
    password: 'editor123',
    role: 'editor'
  },
  {
    email: 'moderator@noticeboard.com',
    password: 'moderator123',
    role: 'moderator'
  }
];

async function setupUsers() {
  for (const user of users) {
    try {
      console.log(`Setting up user ${user.email}...`);
      
      // First try to get the user
      const { data: userList, error: fetchError } = await supabase.auth.admin.listUsers();
      
      if (fetchError) {
        console.error(`Error fetching users:`, fetchError);
        continue;
      }

      if (!userList?.users) {
        console.error('No users list returned');
        continue;
      }

      const existingUser = userList.users.find((u: User) => u.email === user.email);
      let userId: string;

      if (existingUser) {
        console.log(`Updating existing user ${user.email}`);
        userId = existingUser.id;
        
        // Update user metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { 
            email: user.email,
            user_metadata: { role: user.role },
            email_confirm: true
          }
        );

        if (updateError) {
          console.error(`Error updating user ${user.email}:`, updateError);
          continue;
        }
      } else {
        console.log(`Creating new user ${user.email}`);
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { role: user.role }
        });

        if (createError) {
          console.error(`Error creating user ${user.email}:`, createError);
          continue;
        }

        if (!newUser?.user) {
          console.error('No user data returned');
          continue;
        }

        userId = newUser.user.id;
      }

      // Update role in database using raw SQL
      const { error: roleError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          user_metadata: { role: user.role }
        }
      );

      if (roleError) {
        console.error(`Error setting role for ${user.email}:`, roleError);
        continue;
      }

      console.log(`✅ Successfully set up user ${user.email} with role ${user.role}`);

    } catch (error: any) {
      console.error(`❌ Unexpected error for ${user.email}:`, error);
    }
  }
}

setupUsers()
  .then(() => {
    console.log('✨ Setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }); 