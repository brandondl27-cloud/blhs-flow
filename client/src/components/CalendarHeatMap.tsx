import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, TrendingUp, Clock, AlertTriangle } from "lucide-react";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  assignedTo: string[];
}

interface HeatMapDay {
  date: Date;
  taskCount: number;
  highPriorityCount: number;
  overdueTasks: number;
  tasks: Task[];
  intensity: number;
}

interface CalendarHeatMapProps {
  selectedMonth?: Date;
  showLegend?: boolean;
  className?: string;
}

export default function CalendarHeatMap({ 
  selectedMonth = new Date(), 
  showLegend = true, 
  className = "" 
}: CalendarHeatMapProps) {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const heatMapData = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    // Include a few days before and after for proper calendar display
    const calendarStart = subDays(monthStart, 7);
    const calendarEnd = addDays(monthEnd, 7);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return days.map(date => {
      const dayTasks = tasks.filter((task: Task) => {
        if (!task.dueDate) return false;
        return isSameDay(new Date(task.dueDate), date);
      });

      const taskCount = dayTasks.length;
      const highPriorityCount = dayTasks.filter((task: Task) => task.priority === 'high').length;
      const overdueTasks = dayTasks.filter((task: Task) => 
        task.status !== 'completed' && new Date(task.dueDate) < new Date()
      ).length;

      // Calculate intensity (0-4 scale)
      let intensity = 0;
      if (taskCount > 0) intensity = 1;
      if (taskCount >= 3) intensity = 2;
      if (taskCount >= 5) intensity = 3;
      if (taskCount >= 8 || highPriorityCount >= 3) intensity = 4;

      return {
        date,
        taskCount,
        highPriorityCount,
        overdueTasks,
        tasks: dayTasks,
        intensity
      };
    });
  }, [tasks, selectedMonth]);

  const stats = useMemo(() => {
    const currentMonthDays = heatMapData.filter(day => 
      day.date >= startOfMonth(selectedMonth) && day.date <= endOfMonth(selectedMonth)
    );

    const totalTasks = currentMonthDays.reduce((sum, day) => sum + day.taskCount, 0);
    const busiestDay = currentMonthDays.reduce((max, day) => 
      day.taskCount > max.taskCount ? day : max, 
      { taskCount: 0, date: new Date() }
    );
    const avgTasksPerDay = totalTasks / currentMonthDays.length;

    return {
      totalTasks,
      busiestDay,
      avgTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
      activeDays: currentMonthDays.filter(day => day.taskCount > 0).length
    };
  }, [heatMapData, selectedMonth]);

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800', // 0 - no tasks
      'bg-blue-200 dark:bg-blue-900', // 1 - light activity
      'bg-blue-400 dark:bg-blue-700', // 2 - moderate activity
      'bg-blue-600 dark:bg-blue-500', // 3 - high activity
      'bg-blue-800 dark:bg-blue-400'  // 4 - very high activity
    ];
    return colors[intensity] || colors[0];
  };

  const getIntensityLabel = (intensity: number) => {
    const labels = ['No tasks', 'Light', 'Moderate', 'High', 'Very High'];
    return labels[intensity] || labels[0];
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Task Density Heat Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading heat map...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Task Density Heat Map</span>
            </div>
            <Badge variant="outline">
              {format(selectedMonth, 'MMMM yyyy')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Month Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">Total Tasks</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {stats.totalTasks}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Avg/Day</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.avgTasksPerDay}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Active Days</span>
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {stats.activeDays}
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium">Busiest Day</span>
              </div>
              <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                {stats.busiestDay.taskCount > 0 ? (
                  <>
                    {format(stats.busiestDay.date, 'd')}
                    <span className="text-sm font-normal ml-1">
                      ({stats.busiestDay.taskCount} tasks)
                    </span>
                  </>
                ) : (
                  'None'
                )}
              </p>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {heatMapData.map((day, index) => {
                const isCurrentMonth = day.date >= startOfMonth(selectedMonth) && 
                                     day.date <= endOfMonth(selectedMonth);
                const isToday = isSameDay(day.date, new Date());

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          relative aspect-square rounded-md border transition-all duration-200 hover:scale-105
                          ${getIntensityColor(day.intensity)}
                          ${isCurrentMonth ? 'border-gray-200 dark:border-gray-700' : 'border-transparent opacity-40'}
                          ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                          cursor-pointer
                        `}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`
                            text-xs font-medium
                            ${day.intensity >= 3 ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
                            ${!isCurrentMonth ? 'text-gray-400' : ''}
                          `}>
                            {format(day.date, 'd')}
                          </span>
                        </div>
                        
                        {/* Indicators */}
                        {day.overdueTasks > 0 && (
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        )}
                        {day.highPriorityCount > 0 && (
                          <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-semibold">
                          {format(day.date, 'EEEE, MMMM d')}
                        </p>
                        
                        {day.taskCount > 0 ? (
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">{day.taskCount}</span> task{day.taskCount !== 1 ? 's' : ''}
                              {day.highPriorityCount > 0 && (
                                <span className="text-orange-400 ml-1">
                                  ({day.highPriorityCount} high priority)
                                </span>
                              )}
                            </p>
                            
                            {day.overdueTasks > 0 && (
                              <p className="text-red-400 text-sm">
                                {day.overdueTasks} overdue task{day.overdueTasks !== 1 ? 's' : ''}
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-400">
                              Activity: {getIntensityLabel(day.intensity)}
                            </p>
                            
                            {day.tasks.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium">Tasks:</p>
                                {day.tasks.slice(0, 3).map((task, i) => (
                                  <p key={i} className="text-xs text-gray-300 truncate">
                                    • {task.title}
                                  </p>
                                ))}
                                {day.tasks.length > 3 && (
                                  <p className="text-xs text-gray-400">
                                    +{day.tasks.length - 3} more...
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No tasks</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Less</span>
              <div className="flex items-center space-x-1">
                {[0, 1, 2, 3, 4].map(intensity => (
                  <div
                    key={intensity}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
                    title={getIntensityLabel(intensity)}
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">More</span>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}