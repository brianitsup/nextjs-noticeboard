'use client';

import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Activity,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
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

  // Mock activity logs
  const activityLogs = [
    {
      action: 'Post Created',
      title: 'New Announcement: Summer Schedule',
      timestamp: '2 minutes ago',
      user: 'Admin User'
    },
    {
      action: 'Post Updated',
      title: 'Community Guidelines',
      timestamp: '1 hour ago',
      user: 'Admin User'
    },
    {
      action: 'Post Deleted',
      title: 'Outdated Notice',
      timestamp: '3 hours ago',
      user: 'Admin User'
    },
    {
      action: 'Post Created',
      title: 'Welcome Message',
      timestamp: '1 day ago',
      user: 'Admin User'
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
            {activityLogs.map((log, index) => (
              <div key={index} className="p-4 flex items-start space-x-4">
                <Activity className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">{log.title}</p>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{log.timestamp}</span>
                    <span>•</span>
                    <span>{log.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 