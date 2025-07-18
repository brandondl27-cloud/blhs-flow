import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function TaskProgressChart() {
  const [period, setPeriod] = useState("7");
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks", { limit: 50 }],
  });

  // Process data for chart
  const chartData = () => {
    if (!tasks) return [];
    
    const days = parseInt(period);
    const now = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayTasks = tasks.filter((task: any) => {
        const taskDate = new Date(task.updatedAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter((task: any) => task.status === 'completed').length;
      const inProgress = dayTasks.filter((task: any) => task.status === 'in_progress').length;
      const todo = dayTasks.filter((task: any) => task.status === 'todo').length;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        inProgress,
        todo,
        total: completed + inProgress + todo,
      });
    }
    
    return data;
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle>Task Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Task Progress Overview
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData()}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="text-gray-600 dark:text-gray-400"
                fontSize={12}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="hsl(142, 76%, 36%)"
                fill="hsl(142, 76%, 36%)"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="inProgress"
                stackId="1"
                stroke="hsl(221, 83%, 53%)"
                fill="hsl(221, 83%, 53%)"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="todo"
                stackId="1"
                stroke="hsl(25, 95%, 53%)"
                fill="hsl(25, 95%, 53%)"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
