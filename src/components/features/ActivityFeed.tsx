import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  User, 
  UserPlus, 
  Mail, 
  CheckCircle, 
  Clock, 
  Building,
  Settings,
  Award,
  Calendar
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'user_joined' | 'invite_sent' | 'task_completed' | 'org_created' | 'settings_updated';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  metadata?: Record<string, any>;
}

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Mock activity data
    setActivities([
      {
        id: '1',
        type: 'user_joined',
        title: 'New team member joined',
        description: 'John Doe has joined the organization',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'John Doe',
      },
      {
        id: '2',
        type: 'invite_sent',
        title: 'Invitation sent',
        description: 'Invitation sent to jane@example.com',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: 'Admin',
      },
      {
        id: '3',
        type: 'task_completed',
        title: 'Task completed',
        description: 'Project documentation review completed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user: 'Alice Johnson',
      },
      {
        id: '4',
        type: 'settings_updated',
        title: 'Organization settings updated',
        description: 'Branding and preferences updated',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Admin',
      },
    ]);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'invite_sent':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'org_created':
        return <Building className="h-4 w-4 text-purple-600" />;
      case 'settings_updated':
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    by {activity.user}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};