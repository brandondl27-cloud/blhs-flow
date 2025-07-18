import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarHeatMap from "@/components/CalendarHeatMap";
import TaskDensityAnalytics from "@/components/TaskDensityAnalytics";
import SampleDataControls from "@/components/SampleDataControls";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  type: 'meeting' | 'deadline' | 'event' | 'class';
  attendees?: string[];
  location?: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/calendar/events"],
    enabled: !!user,
  });

  // Sample calendar events for educational context
  const sampleEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Faculty Meeting",
      description: "Monthly departmental meeting to discuss curriculum updates",
      startTime: "09:00",
      endTime: "10:30",
      date: "2025-01-20",
      type: "meeting",
      attendees: ["Sarah Johnson", "Michael Chen", "Emma Davis"],
      location: "Conference Room A",
      priority: "high",
      color: "#3b82f6"
    },
    {
      id: "2",
      title: "Student Progress Review Due",
      description: "Submit quarterly progress reports for all students",
      startTime: "23:59",
      endTime: "23:59",
      date: "2025-01-22",
      type: "deadline",
      priority: "high",
      color: "#ef4444"
    },
    {
      id: "3",
      title: "Parent-Teacher Conference",
      description: "Individual meetings with parents to discuss student performance",
      startTime: "14:00",
      endTime: "17:00",
      date: "2025-01-23",
      type: "event",
      location: "Classroom 205",
      priority: "medium",
      color: "#10b981"
    },
    {
      id: "4",
      title: "Advanced Mathematics Class",
      description: "Regular class session",
      startTime: "10:00",
      endTime: "11:30",
      date: "2025-01-21",
      type: "class",
      location: "Room 304",
      priority: "medium",
      color: "#8b5cf6"
    },
    {
      id: "5",
      title: "Technology Integration Workshop",
      description: "Professional development session on new educational technology",
      startTime: "13:00",
      endTime: "16:00",
      date: "2025-01-24",
      type: "event",
      attendees: ["All Faculty"],
      location: "Computer Lab",
      priority: "medium",
      color: "#f59e0b"
    }
  ];

  const currentEvents = events.length > 0 ? events : sampleEvents;

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: string) => {
    return currentEvents.filter(event => event.date === date);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatEventDate = (dateString: string) => {
    return dateString; // Already in YYYY-MM-DD format
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return Users;
      case 'deadline': return AlertCircle;
      case 'event': return CalendarIcon;
      case 'class': return Clock;
      default: return CalendarIcon;
    }
  };

  const getEventTypeBadge = (type: CalendarEvent['type']) => {
    const variants = {
      'meeting': 'default',
      'deadline': 'destructive',
      'event': 'secondary',
      'class': 'outline'
    } as const;
    
    return variants[type] || 'default';
  };

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthDays = getMonthDays(currentDate);
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Calendar & Task Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your schedule, deadlines, and analyze task density patterns
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar View</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Task Heat Map</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>{formatDate(currentDate)}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="h-24 p-1"></div>;
                    }
                    
                    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = getEventsForDate(dateString);
                    const isToday = dateString === todayString;
                    
                    return (
                      <div 
                        key={index} 
                        className={`h-24 p-1 border border-gray-200 dark:border-gray-700 rounded ${
                          isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        } cursor-pointer transition-colors`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div 
                              key={event.id}
                              className="text-xs p-1 rounded truncate"
                              style={{ backgroundColor: event.color + '20', color: event.color }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <CardDescription>
                  Your next scheduled items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentEvents
                    .filter(event => new Date(event.date) >= today)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map(event => {
                      const EventIcon = getEventTypeIcon(event.type);
                      return (
                        <div key={event.id} className={`p-3 border-l-4 ${getPriorityColor(event.priority)} bg-gray-50 dark:bg-gray-800 rounded-r`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <EventIcon className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-sm">{event.title}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>{event.startTime} - {event.endTime}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              <div className="mt-2">
                                <Badge variant={getEventTypeBadge(event.type)} className="text-xs">
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Meetings</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Deadlines</span>
                  <span className="font-semibold text-red-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Classes</span>
                  <span className="font-semibold">6</span>
                </div>
              </CardContent>
            </Card>

            {/* Event Types Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-sm">Meetings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="text-sm">Deadlines</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="text-sm">Events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                  <span className="text-sm">Classes</span>
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>

          {/* Heat Map Tab */}
          <TabsContent value="heatmap" className="mt-6">
            <div className="space-y-6">
              <SampleDataControls />
              <CalendarHeatMap selectedMonth={currentDate} />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <SampleDataControls />
              <TaskDensityAnalytics selectedDate={currentDate} timeframe="month" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}