import { createClient } from '@/lib/supabase/client';

interface ActivityLog {
  action: string;
  details: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

class ActivityLogger {
  private supabase = createClient();

  private async isAdmin(userId: string): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session?.user) return false;
    
    return session.user.role === 'admin' || session.user.app_metadata?.role === 'admin';
  }

  async log(activity: Omit<ActivityLog, 'ip_address' | 'user_agent'>) {
    try {
      // Special case for admin sign-in - don't check session
      const isSignInActivity = activity.action === 'Admin Login';
      
      if (!isSignInActivity) {
        // For non-sign-in activities, verify session and admin status
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session?.user) {
          console.warn('No active session found, skipping activity log');
          return;
        }

        const isAdmin = await this.isAdmin(session.user.id);
        if (!isAdmin) {
          console.warn('Non-admin user attempted to log activity');
          return;
        }
      }

      // Get IP address
      let ip = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ip = ipData.ip;
      } catch (ipError) {
        console.warn('Failed to get IP address:', ipError);
      }

      // Get current session for user_id if available
      const { data: { session } } = await this.supabase.auth.getSession();
      
      // Prepare log data
      const logData = {
        ...activity,
        user_id: session?.user?.id || null,
        ip_address: ip,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        created_at: new Date().toISOString()
      };

      // Try to log the activity
      const { error } = await this.supabase
        .from('admin_activity_logs')
        .insert([logData]);

      if (error) {
        console.warn('Failed to log activity:', error);
      }
    } catch (error) {
      console.warn('Activity logging error:', error);
    }
  }

  async getRecentLogs(limit = 10) {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) {
        console.warn('No active session found');
        return [];
      }

      const isAdmin = await this.isAdmin(session.user.id);
      if (!isAdmin) {
        console.warn('Non-admin user attempted to view logs');
        return [];
      }

      const { data, error } = await this.supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Failed to fetch activity logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Error fetching activity logs:', error);
      return [];
    }
  }
}

// Create a singleton instance
export const activityLogger = new ActivityLogger(); 