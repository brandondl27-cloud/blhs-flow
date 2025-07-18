import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useMobile } from "@/hooks/use-mobile";
import EmailAuthLanding from "@/pages/EmailAuthLanding.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import MobileDashboard from "@/pages/MobileDashboard.tsx";
import Tasks from "@/pages/Tasks.tsx";
import TaskDetail from "@/pages/TaskDetail.tsx";
import AISuggestions from "@/pages/AISuggestions.tsx";
import Team from "@/pages/Team.tsx";
import Analytics from "@/pages/Analytics.tsx";
import UserManagement from "@/pages/UserManagement.tsx";
import Settings from "@/pages/Settings.tsx";
import Reports from "@/pages/Reports.tsx";
import Calendar from "@/pages/Calendar.tsx";
import UserTesting from "@/pages/UserTesting.tsx";
import EmailSetup from "@/pages/EmailSetup.tsx";
import ManagementDashboard from "@/pages/ManagementDashboard.tsx";
import NotFound from "@/pages/not-found.tsx";
import NotificationCenter from "@/components/NotificationCenter";
import MobileNav from "@/components/MobileNav";

function Router() {
  const { isAuthenticated, isLoading } = useFirebaseAuth();
  const isMobile = useMobile();

  return (
    <>
      {/* Mobile Navigation */}
      {isAuthenticated && !isLoading && isMobile && <MobileNav />}
      
      {/* Notification Center - only show when authenticated */}
      {isAuthenticated && !isLoading && (
        <div className={`fixed top-4 right-4 z-50 ${isMobile ? 'top-16' : ''}`}>
          <NotificationCenter />
        </div>
      )}
      
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={EmailAuthLanding} />
        ) : (
          <>
            <Route path="/" component={isMobile ? MobileDashboard : Dashboard} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/tasks/:id" component={TaskDetail} />
            <Route path="/suggestions" component={AISuggestions} />
            <Route path="/team" component={Team} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/reports" component={Reports} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/management" component={ManagementDashboard} />
            <Route path="/admin/users" component={UserManagement} />
            <Route path="/admin/settings" component={Settings} />
            <Route path="/admin/testing" component={UserTesting} />
            <Route path="/admin/email" component={EmailSetup} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
