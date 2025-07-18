import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  Users, 
  UserPlus,
  Search,
  Shield,
  Settings,
  GraduationCap,
  Mail,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Target
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: string;
  department: string | null;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state for new/edit user
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "Educator",
    department: ""
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === 'Administrator',
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: typeof formData) => 
      apiRequest("/api/admin/users", "POST", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddUserOpen(false);
      resetForm();
      toast({
        title: "User Created",
        description: "New user has been successfully created and invited.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: `Failed to create user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }: { id: string } & Partial<typeof formData>) =>
      apiRequest(`/api/admin/users/${id}`, "PATCH", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      resetForm();
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/admin/users/${userId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Removed",
        description: "User has been successfully removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Removal Failed",
        description: `Failed to remove user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/admin/users/${id}/status`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Status Updated",
        description: "User status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Status Update Failed",
        description: `Failed to update user status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Check if current user is admin
  if (!user || user.role !== 'Administrator') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need administrator privileges to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "Educator",
      department: ""
    });
  };

  const handleEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      email: userToEdit.email,
      firstName: userToEdit.firstName,
      lastName: userToEdit.lastName,
      role: userToEdit.role,
      department: userToEdit.department || ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, ...formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user: User) => {
      const matchesSearch = !searchTerm || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || (user.status || 'active') === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a: User, b: User) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = a.role.localeCompare(b.role);
          break;
        case "status":
          comparison = (a.status || 'active').localeCompare(b.status || 'active');
          break;
        case "created":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "lastActive":
          const aLastActive = a.lastActive || a.updatedAt;
          const bLastActive = b.lastActive || b.updatedAt;
          comparison = new Date(aLastActive).getTime() - new Date(bLastActive).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Administrator': return Shield;
      case 'Management': return Target;
      case 'Educator': return GraduationCap;
      case 'Support Staff': return Settings;
      default: return Users;
    }
  };

  const getStatusIcon = (status: string = 'active') => {
    switch (status) {
      case 'active': return CheckCircle2;
      case 'inactive': return Clock;
      case 'suspended': return AlertTriangle;
      default: return CheckCircle2;
    }
  };

  const getStatusColor = (status: string = 'active') => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-yellow-500';
      case 'suspended': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage user accounts, roles, and permissions for your educational institution
              </p>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser 
                      ? 'Update user information and role assignments.'
                      : 'Create a new user account and send an invitation email.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={!!editingUser}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                          <SelectItem value="Educator">Educator</SelectItem>
                          <SelectItem value="Support Staff">Support Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department (Optional)</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g., Mathematics, Administration"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddUserOpen(false);
                        setEditingUser(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    >
                      {editingUser ? 'Update User' : 'Create User'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Educator">Educator</SelectItem>
                    <SelectItem value="Support Staff">Support Staff</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="created">Join Date</SelectItem>
                    <SelectItem value="lastActive">Last Active</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex items-center space-x-1"
                >
                  {sortOrder === "asc" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>System Users ({filteredAndSortedUsers.length})</span>
            </CardTitle>
            <CardDescription>
              Manage all user accounts in your educational institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
            ) : filteredAndSortedUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No users found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search criteria."
                    : "Start by adding your first user to the system."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedUsers.map((userData: User) => {
                  const RoleIcon = getRoleIcon(userData.role);
                  const StatusIcon = getStatusIcon(userData.status);
                  
                  return (
                    <div key={userData.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userData.profileImageUrl || ""} />
                          <AvatarFallback>
                            {getInitials(userData.firstName, userData.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {userData.firstName} {userData.lastName}
                            </h4>
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(userData.status)}`} />
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {userData.email}
                            </span>
                          </div>
                          {userData.department && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {userData.department}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <RoleIcon className="h-3 w-3" />
                          <span>{userData.role}</span>
                        </Badge>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Joined {formatDate(userData.createdAt)}
                          </div>
                          {userData.lastActive && (
                            <div className="text-xs text-gray-500">
                              Last active: {formatDate(userData.lastActive)}
                            </div>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                handleEdit(userData);
                                setIsAddUserOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const newStatus = userData.status === 'active' ? 'suspended' : 'active';
                                toggleUserStatusMutation.mutate({ 
                                  id: userData.id, 
                                  status: newStatus 
                                });
                              }}
                            >
                              {userData.status === 'active' ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {userData.firstName} {userData.lastName} 
                                    and all associated data. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUserMutation.mutate(userData.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}