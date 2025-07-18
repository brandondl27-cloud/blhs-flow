import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus,
  Search,
  Shield,
  Settings,
  GraduationCap,
  Plus,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
  Briefcase,
  UserCheck,
  Eye,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: string;
  department: string | null;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  category: string;
  assignedTo: string[];
  createdById: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface UserAnalytics {
  userId: string;
  userName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  recentActivity: number;
}

export default function ManagementDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state for task assignment
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
    category: "",
    assignedTo: [] as string[]
  });

  // Check if user has management access
  if (!user || (user.role !== 'Management' && user.role !== 'Administrator')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need Management or Administrator privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ["/api/management/team"],
    enabled: !!user,
  });

  const { data: allTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["/api/management/tasks"],
    enabled: !!user,
  });

  const { data: userAnalytics = [], isLoading: loadingAnalytics } = useQuery({
    queryKey: ["/api/management/analytics"],
    enabled: !!user,
  });

  const assignTaskMutation = useMutation({
    mutationFn: (taskData: typeof taskForm) => 
      apiRequest("/api/tasks", "POST", {
        ...taskData,
        createdById: user.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/management/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/management/analytics"] });
      setIsAssignTaskOpen(false);
      resetTaskForm();
      toast({
        title: "Task Assigned",
        description: "Task has been successfully assigned to team members.",
      });
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: `Failed to assign task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      category: "",
      assignedTo: []
    });
  };

  // Filter team members
  const filteredMembers = teamMembers.filter((member: User) => {
    const matchesSearch = !searchTerm || 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.assignedTo.length === 0) {
      toast({
        title: "Assignment Required",
        description: "Please select at least one team member to assign the task to.",
        variant: "destructive",
      });
      return;
    }
    assignTaskMutation.mutate(taskForm);
  };

  const getUserDisplayName = (userId: string) => {
    const member = teamMembers.find((m: User) => m.id === userId);
    return member ? `${member.firstName} ${member.lastName}` : userId;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Administrator': return Shield;
      case 'Management': return Target;
      case 'Educator': return GraduationCap;
      case 'Support Staff': return Settings;
      default: return Users;
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  // Calculate overview statistics
  const overviewStats = {
    totalTeamMembers: teamMembers.length,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t: Task) => t.status === 'completed').length,
    overdueTasks: allTasks.filter((t: Task) => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length,
    averageCompletionRate: userAnalytics.length > 0 
      ? Math.round(userAnalytics.reduce((sum: number, u: UserAnalytics) => sum + u.completionRate, 0) / userAnalytics.length)
      : 0
  };

  // Prepare chart data
  const completionRateData = userAnalytics.map((analytics: UserAnalytics) => ({
    name: analytics.userName.split(' ')[0], // First name only for chart
    completionRate: analytics.completionRate,
    totalTasks: analytics.totalTasks
  }));

  const taskStatusData = [
    { name: 'Completed', value: overviewStats.completedTasks, color: '#10b981' },
    { name: 'In Progress', value: allTasks.filter((t: Task) => t.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Todo', value: allTasks.filter((t: Task) => t.status === 'todo').length, color: '#6b7280' },
    { name: 'Overdue', value: overviewStats.overdueTasks, color: '#ef4444' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Management Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Allocate tasks, monitor team performance, and analyze productivity metrics
              </p>
            </div>
            <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetTaskForm} className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Assign Task</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign New Task</DialogTitle>
                  <DialogDescription>
                    Create and assign a task to team members with detailed specifications
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignTask}>
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="Task title"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Task description and requirements"
                        value={taskForm.description}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select 
                        value={taskForm.priority} 
                        onValueChange={(value: any) => setTaskForm(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="Category"
                        value={taskForm.category}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Assign to team members:</p>
                      <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                        {teamMembers.filter((m: User) => m.role !== 'Administrator').map((member: User) => (
                          <label key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={taskForm.assignedTo.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTaskForm(prev => ({ 
                                    ...prev, 
                                    assignedTo: [...prev.assignedTo, member.id] 
                                  }));
                                } else {
                                  setTaskForm(prev => ({ 
                                    ...prev, 
                                    assignedTo: prev.assignedTo.filter(id => id !== member.id) 
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.profileImageUrl || ""} />
                              <AvatarFallback className="text-xs">
                                {getInitials(member.firstName, member.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.firstName} {member.lastName}</span>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAssignTaskOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={assignTaskMutation.isPending}
                    >
                      {assignTaskMutation.isPending ? 'Assigning...' : 'Assign Task'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overviewStats.totalTeamMembers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overviewStats.totalTasks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overviewStats.completedTasks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overviewStats.overdueTasks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Completion</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overviewStats.averageCompletionRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics Overview</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Team Performance</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Task Management</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Completion Rates</CardTitle>
                  <CardDescription>Individual performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={completionRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completionRate" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Status Distribution</CardTitle>
                  <CardDescription>Overall task completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Member Analytics</CardTitle>
                <CardDescription>Detailed performance metrics for each team member</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAnalytics.map((analytics: UserAnalytics) => {
                      const member = teamMembers.find((m: User) => m.id === analytics.userId);
                      if (!member) return null;
                      
                      const RoleIcon = getRoleIcon(member.role);
                      
                      return (
                        <div key={analytics.userId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={member.profileImageUrl || ""} />
                                <AvatarFallback>
                                  {getInitials(member.firstName, member.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {member.firstName} {member.lastName}
                                  </h4>
                                  <Badge variant="outline" className="flex items-center space-x-1">
                                    <RoleIcon className="h-3 w-3" />
                                    <span>{member.role}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {member.department || 'No department assigned'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-6 text-center">
                              <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {analytics.totalTasks}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-green-600">
                                  {analytics.completedTasks}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-yellow-600">
                                  {analytics.inProgressTasks}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-red-600">
                                  {analytics.overdueTasks}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Completion Rate
                              </span>
                              <span className="text-sm font-medium">
                                {analytics.completionRate}%
                              </span>
                            </div>
                            <Progress value={analytics.completionRate} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task Management Tab */}
          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Team Tasks</CardTitle>
                <CardDescription>Monitor and manage all assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTasks ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : allTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No tasks assigned yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start by assigning tasks to your team members.
                    </p>
                    <Button onClick={() => setIsAssignTaskOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allTasks.map((task: Task) => {
                      const assigneeNames = task.assignedTo
                        .map(userId => getUserDisplayName(userId))
                        .join(", ");
                      
                      const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
                      
                      return (
                        <div key={task.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {task.title}
                                </h4>
                                <Badge 
                                  variant={
                                    task.priority === 'high' ? 'destructive' :
                                    task.priority === 'medium' ? 'default' : 'secondary'
                                  }
                                >
                                  {task.priority}
                                </Badge>
                                <Badge 
                                  variant={
                                    task.status === 'completed' ? 'default' :
                                    task.status === 'in_progress' ? 'secondary' : 'outline'
                                  }
                                >
                                  {task.status.replace('_', ' ')}
                                </Badge>
                                {isOverdue && (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {task.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Assigned to: {assigneeNames}</span>
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                <span>Category: {task.category}</span>
                              </div>
                            </div>
                            
                            <div className="ml-4 text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Progress: {task.progress}%
                              </div>
                              <Progress value={task.progress} className="w-24 h-2" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}