import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Tasks() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage and track your tasks
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              
              <Button 
                className="flex items-center space-x-2"
                onClick={() => setShowTaskForm(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                  <TabsTrigger value="created">Created by Me</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                  <TaskList type="all" onEditTask={setSelectedTask} />
                </TabsContent>
                
                <TabsContent value="assigned" className="mt-6">
                  <TaskList type="assigned" onEditTask={setSelectedTask} />
                </TabsContent>
                
                <TabsContent value="created" className="mt-6">
                  <TaskList type="created" onEditTask={setSelectedTask} />
                </TabsContent>
                
                <TabsContent value="completed" className="mt-6">
                  <TaskList type="completed" onEditTask={setSelectedTask} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Task Form Modal */}
      {(showTaskForm || selectedTask) && (
        <TaskForm
          isOpen={showTaskForm || !!selectedTask}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
        />
      )}
    </div>
  );
}
