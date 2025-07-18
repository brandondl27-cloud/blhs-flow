import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Send,
  Settings,
  AlertTriangle,
  Info
} from "lucide-react";

export default function EmailSetup() {
  const { toast } = useToast();
  const [testEmailSent, setTestEmailSent] = useState(false);

  const { data: emailConfig, isLoading } = useQuery({
    queryKey: ["/api/email/config"],
  });

  const testEmailMutation = useMutation({
    mutationFn: () => apiRequest("/api/email/test", "POST"),
    onSuccess: (data: any) => {
      setTestEmailSent(true);
      toast({
        title: "Test Email Sent",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading email configuration...</span>
        </div>
      </div>
    );
  }

  const isConfigured = emailConfig?.configured;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Email Notification Setup
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure email notifications for task assignments and updates.
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Configuration Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isConfigured ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Email Configured
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email notifications are ready to send
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Email Not Configured
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email notifications will be skipped
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={isConfigured ? "default" : "secondary"}>
                {isConfigured ? "Active" : "Inactive"}
              </Badge>
              
              {isConfigured && (
                <Button
                  onClick={() => testEmailMutation.mutate()}
                  disabled={testEmailMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  {testEmailMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Email Notification Features</span>
          </CardTitle>
          <CardDescription>
            What happens when email notifications are enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Task Assignment Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatic emails sent when users are assigned new tasks
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Task Deadline Reminders</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email reminders for upcoming task deadlines
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Calendar Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatic calendar events created for task deadlines
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Professional Email Templates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Beautiful, branded emails with task details and quick actions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Setup Instructions</span>
          </CardTitle>
          <CardDescription>
            Follow these steps to enable email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfigured && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Email Configuration Required
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Configure your email provider to enable notifications. All other features work without email.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="prose dark:prose-invert max-w-none">
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
              {emailConfig?.instructions || "Loading instructions..."}
            </pre>
          </div>
          
          {testEmailSent && (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200">
                    Test Email Sent Successfully
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Check your email inbox to verify the notification was received.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}