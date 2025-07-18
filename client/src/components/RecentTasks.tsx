import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Users, Book } from "lucide-react";
import { Link } from "wouter";

export default function RecentTasks() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks?limit=6"],
  });

  const getTaskIcon = (title: string) => {
    if (title.toLowerCase().includes('grade') || title.toLowerCase().includes('assessment')) {
      return ClipboardList;
    }
    if (title.toLowerCase().includes('meeting') || title.toLowerCase().includes('conference')) {
      return Users;
    }
    return Book;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'medium':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return 'No due date';
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Tasks
          </CardTitle>
          <Link href="/tasks">
            <span className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium cursor-pointer">
              View All
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task: any) => {
              const TaskIcon = getTaskIcon(task.title);
              const priorityColor = getPriorityColor(task.priority);
              const statusColor = getStatusColor(task.status);
              
              return (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TaskIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Created by you
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDueDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={priorityColor}>
                        {task.priority}
                      </Badge>
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClipboardList className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No recent tasks
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Create your first task to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
