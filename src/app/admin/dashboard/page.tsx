'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { activityLogger } from '@/lib/activity-logger';

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
  ip_address: string;
}

export default function AdminDashboard() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const supabase = createClient();
  const router = useRouter();

  // Verify session on mount and periodically
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/auth/admin-signin');
        return;
      }

      const isAdmin = session.user.role === 'admin' || session.user.app_metadata?.role === 'admin';
      if (!isAdmin) {
        await supabase.auth.signOut();
        router.push('/auth/admin-signin');
      }
    };

    // Check immediately
    checkSession();

    // Check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router, supabase.auth]);

  // Load activity logs
  useEffect(() => {
    const loadLogs = async () => {
      const logs = await activityLogger.getRecentLogs(10);
      setActivityLogs(logs);
    };

    loadLogs();
  }, []);

  // Mock stats data
  const stats = [
    {
      title: 'Total Posts',
      value: '156',
      change: '+12%',
      icon: FileText
    },
    {
      title: 'Active Users',
      value: '2.4K',
      change: '+5.3%',
      icon: Users
    },
    {
      title: 'Engagement Rate',
      value: '24.8%',
      change: '+2.1%',
      icon: BarChart3
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>

      {/* Activity Logs Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <div className="divide-y divide-border">
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start space-x-4">
                  <Activity className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>IP: {log.ip_address}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 flex items-center justify-center text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-2" />
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 