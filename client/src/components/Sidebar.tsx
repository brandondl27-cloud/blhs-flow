import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Lightbulb, 
  Users, 
  BarChart3,
  ShieldQuestion,
  Settings,
  GraduationCap,
  MoreVertical,
  LogOut,
  Target,
  FileText,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'AI Suggestions', href: '/suggestions', icon: Lightbulb },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

const managementNavigation = [
  { name: 'Management', href: '/management', icon: Target },
];

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: ShieldQuestion },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Email Setup', href: '/admin/email', icon: Settings },
  { name: 'User Testing', href: '/admin/testing', icon: GraduationCap },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-4 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">BLHS Flow</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Work Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <div
                className={`${
                  isActive(item.href)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer`}
              >
                <item.icon className={`${
                  isActive(item.href)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                } mr-3 h-5 w-5`} />
                {item.name}
              </div>
            </Link>
          ))}
          
          {/* Management Section */}
          {(user?.role === 'Management' || user?.role === 'Administrator') && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Management
              </p>
              {managementNavigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`${
                      isActive(item.href)
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer`}
                  >
                    <item.icon className={`${
                      isActive(item.href)
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    } mr-3 h-5 w-5`} />
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Admin Section */}
          {user?.role === 'Administrator' && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Administration
              </p>
              {adminNavigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`${
                      isActive(item.href)
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer`}
                  >
                    <item.icon className={`${
                      isActive(item.href)
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    } mr-3 h-5 w-5`} />
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img 
              className="w-10 h-10 rounded-full object-cover" 
              src={user?.profileImageUrl || "https://via.placeholder.com/40"} 
              alt="User profile" 
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </aside>
  );
}
