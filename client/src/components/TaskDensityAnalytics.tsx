import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Users, AlertCircle } from "lucide-react";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  assignedTo: string[];
  createdAt: string;
}

interface TaskDensityAnalyticsProps {
  selectedDate?: Date;
  timeframe?: 'week' | 'month';
}

export default function TaskDensityAnalytics({ 
  selectedDate = new Date(), 
  timeframe = 'week' 
}: TaskDensityAnalyticsProps) {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const start = timeframe === 'week' 
      ? startOfWeek(selectedDate) 
      : startOfMonth(selectedDate);
    const end = timeframe === 'week' 
      ? endOfWeek(selectedDate) 
      : endOfMonth(selectedDate);

    const days = eachDayOfInterval({ start, end });
    
    // Daily task distribution
    const dailyData = days.map(date => {
      const dayTasks = tasks.filter((task: Task) => {
        if (!task.dueDate) return false;
        return isSameDay(new Date(task.dueDate), date);
      });

      return {
        date: format(date, timeframe === 'week' ? 'EEE' : 'd'),
        fullDate: date,
        tasks: dayTasks.length,
        highPriority: dayTasks.filter((task: Task) => task.priority === 'high').length,
        completed: dayTasks.filter((task: Task) => task.status === 'completed').length,
        overdue: dayTasks.filter((task: Task) => 
          task.status !== 'completed' && new Date(task.dueDate) < now
        ).length
      };
    });

    // Priority distribution
    const priorityData = [
      { 
        name: 'High', 
        value: tasks.filter((task: Task) => task.priority === 'high').length,
        color: '#ef4444'
      },
      { 
        name: 'Medium', 
        value: tasks.filter((task: Task) => task.priority === 'medium').length,
        color: '#f97316'
      },
      { 
        name: 'Low', 
        value: tasks.filter((task: Task) => task.priority === 'low').length,
        color: '#22c55e'
      }
    ];

    // Status distribution
    const statusData = [
      {
        name: 'To Do',
        value: tasks.filter((task: Task) => task.status === 'todo').length,
        color: '#6b7280'
      },
      {
        name: 'In Progress',
        value: tasks.filter((task: Task) => task.status === 'in_progress').length,
        color: '#3b82f6'
      },
      {
        name: 'Completed',
        value: tasks.filter((task: Task) => task.status === 'completed').length,
        color: '#10b981'
      }
    ];

    // Workload analysis
    const totalTasks = dailyData.reduce((sum, day) => sum + day.tasks, 0);
    const avgTasksPerDay = totalTasks / dailyData.length;
    const peakDay = dailyData.reduce((max, day) => day.tasks > max.tasks ? day : max);
    const workloadBalance = Math.max(...dailyData.map(d => d.tasks)) - Math.min(...dailyData.map(d => d.tasks));

    return {
      dailyData,
      priorityData,
      statusData,
      totalTasks,
      avgTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
      peakDay,
      workloadBalance,
      completionRate: totalTasks > 0 ? 
        Math.round((tasks.filter((t: Task) => t.status === 'completed').length / tasks.length) * 100) : 0
    };
  }, [tasks, selectedDate, timeframe]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Task Distribution */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Daily Task Distribution</span>
            <Badge variant="outline">
              {timeframe === 'week' ? 'This Week' : format(selectedDate, 'MMMM yyyy')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => {
                  const day = analytics.dailyData.find(d => d.date === label);
                  return day ? format(day.fullDate, 'EEEE, MMMM d') : label;
                }}
                formatter={(value: number, name: string) => {
                  const names: Record<string, string> = {
                    tasks: 'Total Tasks',
                    highPriority: 'High Priority',
                    completed: 'Completed',
                    overdue: 'Overdue'
                  };
                  return [value, names[name] || name];
                }}
              />
              <Bar dataKey="tasks" fill="#3b82f6" name="tasks" />
              <Bar dataKey="highPriority" fill="#ef4444" name="highPriority" />
              <Bar dataKey="completed" fill="#10b981" name="completed" />
              <Bar dataKey="overdue" fill="#f97316" name="overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Priority Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analytics.priorityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
              >
                {analytics.priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {analytics.priorityData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Status Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analytics.statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
              >
                {analytics.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {analytics.statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workload Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Workload Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.totalTasks}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Day</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analytics.avgTasksPerDay}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Peak Day</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {analytics.peakDay.tasks > 0 ? analytics.peakDay.tasks : '0'}
              </p>
              {analytics.peakDay.tasks > 0 && (
                <p className="text-xs text-gray-500">
                  {analytics.peakDay.date}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <div className="flex items-center space-x-2">
                <Progress value={analytics.completionRate} className="flex-1" />
                <span className="text-sm font-medium">{analytics.completionRate}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Workload Balance</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The difference between your busiest and lightest day is{' '}
              <span className="font-medium">{analytics.workloadBalance} tasks</span>.
              {analytics.workloadBalance > 5 && (
                <span className="text-orange-600 dark:text-orange-400 ml-1">
                  Consider redistributing tasks for better balance.
                </span>
              )}
              {analytics.workloadBalance <= 2 && analytics.totalTasks > 0 && (
                <span className="text-green-600 dark:text-green-400 ml-1">
                  Great job maintaining balanced workload!
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}