import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, MessageCircle, Paperclip, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function TeamActivity() {
  const [filter, setFilter] = useState("all");
  
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/activity?limit=10"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return CheckCircle;
      case 'task_comment':
        return MessageCircle;
      case 'task_attachment':
        return Paperclip;
      case 'task_created':
        return PlusCircle;
      default:
        return CheckCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'text-green-500';
      case 'task_comment':
        return 'text-blue-500';
      case 'task_attachment':
        return 'text-gray-500';
      case 'task_created':
        return 'text-primary-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Activity
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);
              
              return (
                <div key={`${activity.type}-${activity.id}-${activity.timestamp}`} className="flex items-start space-x-3">
                  <img 
                    className="w-8 h-8 rounded-full object-cover" 
                    src={activity.user?.profileImageUrl || "https://via.placeholder.com/32"} 
                    alt="Team member"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">
                        {activity.user?.firstName} {activity.user?.lastName}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 mx-1">
                        {activity.action}
                      </span>
                      <span className="font-medium">
                        "{activity.taskTitle}"
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ActivityIcon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No team activity
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Team activity will appear here as tasks are updated
            </p>
          </div>
        )}
        
        {activities && activities.length > 0 && (
          <button className="w-full mt-4 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
            View All Activity
          </button>
        )}
      </CardContent>
    </Card>
  );
}
