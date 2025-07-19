import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  CheckSquare, 
  Lightbulb, 
  Users, 
  BarChart3,
  FileText,
  Calendar as CalendarIcon,
  Settings,
  UserCog,
  Menu,
  X,
  Target,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  adminOnly?: boolean;
  managementOnly?: boolean;
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tasks", label: "Tasks", icon: CheckSquare, badge: 3 },
    { path: "/suggestions", label: "AI Suggestions", icon: Lightbulb },
    { path: "/team", label: "Team", icon: Users },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/calendar", label: "Calendar", icon: CalendarIcon },
    { path: "/management", label: "Management", icon: Target, managementOnly: true },
    { path: "/admin/users", label: "User Management", icon: UserCog, adminOnly: true },
    { path: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
    { path: "/admin/email", label: "Email Setup", icon: Mail, adminOnly: true },
    { path: "/admin/testing", label: "User Testing", icon: Users, adminOnly: true },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return user && user.role === 'Administrator';
    }
    if (item.managementOnly) {
      return user && (user.role === 'Management' || user.role === 'Administrator');
    }
    return true;
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white dark:bg-gray-900 shadow-lg"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Navigation */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                BLHS Flow
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Educational Management
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-2">
            {filteredNavItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <div  {/* ✅ CORRECT: div instead of <a> */}
                    className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors cursor-pointer ${
                      active 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>  {/* ✅ CORRECT: closing div instead of </a> */}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a 
              href="/api/logout"
              className="flex items-center space-x-3 w-full p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <span className="font-medium">Sign Out</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="grid grid-cols-5 gap-1 p-2">
          {filteredNavItems.slice(0, 5).map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors cursor-pointer ${  // ✅ CORRECT: div with cursor-pointer
                  active 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <div className="relative">
                    <IconComponent className="h-5 w-5" />
                    {item.badge && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">
                    {item.label.split(' ')[0]}
                  </span>
                </div>  {/* ✅ CORRECT: closing div */}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
