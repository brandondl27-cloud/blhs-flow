import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Sparkles, 
  Calendar,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SampleDataControls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tasksCreated, setTasksCreated] = useState(false);

  const createSampleTasksMutation = useMutation({
    mutationFn: () => apiRequest("/api/create-sample-tasks", "POST"),
    onSuccess: (data: any) => {
      setTasksCreated(true);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      toast({
        title: "Sample Tasks Created",
        description: `${data.tasks} tasks added to demonstrate heat map functionality`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Sample Tasks",
        description: error.message || "Failed to create sample tasks",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <Sparkles className="h-5 w-5" />
          <span>Heat Map Demonstration</span>
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-400">
          Generate sample educational tasks to see the heat map in action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Multi-week task distribution</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Priority & status variety</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Educational context tasks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h4 className="font-semibold mb-2 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span>Sample Data Includes:</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">Week 1</Badge>
              <span>Light workload (2-3 tasks)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">Week 2</Badge>
              <span>Moderate activity (3-4 tasks)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">Week 3</Badge>
              <span>High density (5+ tasks/day)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">Mixed</Badge>
              <span>Overdue & completed items</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {tasksCreated ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Sample tasks ready! Check the heat map tabs above.
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to generate sample educational tasks
              </span>
            )}
          </div>
          
          <Button
            onClick={() => createSampleTasksMutation.mutate()}
            disabled={createSampleTasksMutation.isPending || tasksCreated}
            variant={tasksCreated ? "outline" : "default"}
          >
            {createSampleTasksMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : tasksCreated ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Tasks Created
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Sample Tasks
              </>
            )}
          </Button>
        </div>

        {tasksCreated && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                  Sample tasks created successfully!
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Switch to the "Task Heat Map" or "Analytics" tabs to see the visualization with realistic educational institution workflow data.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}