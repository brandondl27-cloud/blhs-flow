import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserCheck, 
  Database, 
  Play,
  CheckCircle,
  AlertCircle,
  User,
  Settings,
  RefreshCw
} from "lucide-react";

interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  profileImageUrl?: string;
}

export default function UserTesting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'Administrator';

  const { data: testUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/test/users"],
    enabled: isAdmin,
  });

  const createUsersMutation = useMutation({
    mutationFn: () => apiRequest("/api/test/create-users", "POST"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test users created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/test/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create test users",
        variant: "destructive",
      });
    },
  });

  const createDataMutation = useMutation({
    mutationFn: () => apiRequest("/api/test/create-data", "POST"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test data created successfully",
      });
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create test data",
        variant: "destructive",
      });
    },
  });

  const switchUserMutation = useMutation({
    mutationFn: (targetUserId: string) => 
      apiRequest("/api/test/switch-user", "POST", { targetUserId }),
    onSuccess: (data: any) => {
      toast({
        title: "User Switched",
        description: data.message,
      });
      setSelectedUser(data.user);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to switch user",
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only administrators can access the user testing interface.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const roleColors = {
    'Administrator': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Educator': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', 
    'Support Staff': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  const departmentIcons = {
    'Administration': Settings,
    'Mathematics': RefreshCw,
    'English': RefreshCw,
    'Science': RefreshCw,
    'IT Support': Settings,
    'Facilities': Settings
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Profile Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test different user roles and permissions to ensure the platform works correctly for all user types.
          </p>
        </div>

        {/* Setup Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Test Users Setup</span>
              </CardTitle>
              <CardDescription>
                Create test user profiles for different roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Creates 6 test users across different roles:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>1 Administrator (Sarah Johnson)</li>
                    <li>3 Educators (Math, English, Science)</li>
                    <li>2 Support Staff (IT, Facilities)</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => createUsersMutation.mutate()}
                  disabled={createUsersMutation.isPending}
                  className="w-full"
                >
                  {createUsersMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  Create Test Users
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Test Data Setup</span>
              </CardTitle>
              <CardDescription>
                Generate sample tasks and AI suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Creates realistic test data:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>8 sample tasks across roles</li>
                    <li>4 AI suggestions for different users</li>
                    <li>Role-appropriate content and priorities</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => createDataMutation.mutate()}
                  disabled={createDataMutation.isPending}
                  className="w-full"
                >
                  {createDataMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Create Test Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Users Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Available Test Users</span>
            </CardTitle>
            <CardDescription>
              Click on any user to simulate their experience in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading test users...</span>
              </div>
            ) : testUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test users found. Create test users to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testUsers.map((testUser: TestUser) => {
                  const DepartmentIcon = departmentIcons[testUser.department as keyof typeof departmentIcons] || User;
                  const isSelected = selectedUser?.id === testUser.id;
                  
                  return (
                    <div
                      key={testUser.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => switchUserMutation.mutate(testUser.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {testUser.firstName.charAt(0)}{testUser.lastName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {testUser.firstName} {testUser.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {testUser.email}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={roleColors[testUser.role as keyof typeof roleColors]}>
                              {testUser.role}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                              <DepartmentIcon className="h-3 w-3" />
                              <span>{testUser.department}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>Currently simulating this user</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Testing Steps:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>First, create test users using the "Create Test Users" button</li>
                  <li>Then, create test data using the "Create Test Data" button</li>
                  <li>Click on different user profiles to simulate their experience</li>
                  <li>Navigate through the platform to test role-based permissions</li>
                  <li>Verify that each role sees appropriate content and features</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What to Test:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Administrators:</strong> Should see all features including user management and system settings</li>
                  <li><strong>Educators:</strong> Should see academic-focused tasks, student progress, and teaching suggestions</li>
                  <li><strong>Support Staff:</strong> Should see operational tasks, maintenance items, and facility management</li>
                  <li><strong>Navigation:</strong> Verify mobile and desktop navigation works for all roles</li>
                  <li><strong>Permissions:</strong> Ensure users can only access features appropriate to their role</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}