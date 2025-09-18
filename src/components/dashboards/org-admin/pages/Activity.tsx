import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { 
  Activity as ActivityIcon, 
  User, 
  UserPlus, 
  Mail, 
  CheckCircle, 
  Clock, 
  Settings,
  Award,
  Calendar
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'user_joined' | 'invite_sent' | 'task_completed' | 'task_created' | 'settings_updated' | 'member_added';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  metadata?: Record<string, any>;
}

export const OrgActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock activity data - in real app, this would come from API
    const mockActivities: Activity[] = [
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
        type: 'task_created',
        title: 'New task created',
        description: 'Setup development environment task created',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        user: 'Bob Smith',
      },
      {
        id: '5',
        type: 'settings_updated',
        title: 'Organization settings updated',
        description: 'Branding and preferences updated',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Admin',
      },
      {
        id: '6',
        type: 'member_added',
        title: 'Member role updated',
        description: 'Sarah Wilson promoted to sub-admin',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Admin',
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'invite_sent':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'task_created':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'settings_updated':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'member_added':
        return <Award className="h-4 w-4 text-orange-600" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: Activity['type']) => {
    switch (type) {
      case 'user_joined':
        return <Badge variant="success">Member</Badge>;
      case 'invite_sent':
        return <Badge variant="info">Invite</Badge>;
      case 'task_completed':
        return <Badge variant="success">Task</Badge>;
      case 'task_created':
        return <Badge variant="info">Task</Badge>;
      case 'settings_updated':
        return <Badge variant="outline">Settings</Badge>;
      case 'member_added':
        return <Badge variant="warning">Role</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        <p className="text-gray-600">Recent organization activity</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ActivityIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">Activity will appear here as your team uses the platform</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          {getActivityBadge(activity.type)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{activity.user}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
