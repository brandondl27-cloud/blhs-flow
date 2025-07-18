import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Shield,
  Bell,
  Database,
  Mail,
  Globe,
  Clock,
  Users,
  Lock,
  Key,
  Server,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw
} from "lucide-react";

interface SystemSettings {
  general: {
    institutionName: string;
    institutionType: string;
    timezone: string;
    language: string;
    academicYear: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
    overdueAlerts: boolean;
    weeklyReports: boolean;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    sessionTimeout: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  integration: {
    emailProvider: string;
    smsProvider: string;
    calendarSync: boolean;
    singleSignOn: boolean;
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("general");
  const [isDirty, setIsDirty] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    enabled: !!user && user.role === 'Administrator',
  });

  // Mock settings data for demonstration
  const [localSettings, setLocalSettings] = useState<SystemSettings>({
    general: {
      institutionName: "Beacon Learning High School",
      institutionType: "High School",
      timezone: "America/New_York",
      language: "English",
      academicYear: "2024-2025"
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      overdueAlerts: true,
      weeklyReports: false
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      sessionTimeout: 24,
      twoFactorRequired: false,
      ipWhitelist: []
    },
    integration: {
      emailProvider: "smtp",
      smsProvider: "none",
      calendarSync: false,
      singleSignOn: false
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (settings: SystemSettings) =>
      apiRequest("/api/admin/settings", "PUT", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setIsDirty(false);
      toast({
        title: "Settings Saved",
        description: "System settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: `Failed to save settings: ${error.message}`,
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
              You need administrator privileges to access system settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const updateNestedSetting = (section: keyof SystemSettings, subsection: string, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection as keyof typeof prev[section]],
          [key]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(localSettings);
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integration", label: "Integration", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                System Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure system-wide settings for your educational institution
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!isDirty || saveSettingsMutation.isPending}
              className="flex items-center space-x-2"
            >
              {saveSettingsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5" />
                    <span>General Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Basic configuration for your educational institution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="institutionName">Institution Name</Label>
                      <Input
                        id="institutionName"
                        value={localSettings.general.institutionName}
                        onChange={(e) => updateSetting('general', 'institutionName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="institutionType">Institution Type</Label>
                      <Select 
                        value={localSettings.general.institutionType}
                        onValueChange={(value) => updateSetting('general', 'institutionType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Elementary School">Elementary School</SelectItem>
                          <SelectItem value="Middle School">Middle School</SelectItem>
                          <SelectItem value="High School">High School</SelectItem>
                          <SelectItem value="University">University</SelectItem>
                          <SelectItem value="Community College">Community College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={localSettings.general.timezone}
                        onValueChange={(value) => updateSetting('general', 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={localSettings.general.language}
                        onValueChange={(value) => updateSetting('general', 'language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={localSettings.general.academicYear}
                      onChange={(e) => updateSetting('general', 'academicYear', e.target.value)}
                      placeholder="e.g., 2024-2025"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure how and when users receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Send notifications via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={localSettings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Send browser push notifications
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={localSettings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="taskReminders">Task Reminders</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Remind users about upcoming task deadlines
                        </p>
                      </div>
                      <Switch
                        id="taskReminders"
                        checked={localSettings.notifications.taskReminders}
                        onCheckedChange={(checked) => updateSetting('notifications', 'taskReminders', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="overdueAlerts">Overdue Alerts</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Alert users about overdue tasks
                        </p>
                      </div>
                      <Switch
                        id="overdueAlerts"
                        checked={localSettings.notifications.overdueAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'overdueAlerts', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weeklyReports">Weekly Reports</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Send weekly productivity reports
                        </p>
                      </div>
                      <Switch
                        id="weeklyReports"
                        checked={localSettings.notifications.weeklyReports}
                        onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure security policies and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Password Policy</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="minLength">Minimum Password Length</Label>
                        <Input
                          id="minLength"
                          type="number"
                          min="6"
                          max="20"
                          value={localSettings.security.passwordPolicy.minLength}
                          onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                          <Switch
                            id="requireUppercase"
                            checked={localSettings.security.passwordPolicy.requireUppercase}
                            onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireUppercase', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="requireNumbers">Require Numbers</Label>
                          <Switch
                            id="requireNumbers"
                            checked={localSettings.security.passwordPolicy.requireNumbers}
                            onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireNumbers', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="requireSymbols">Require Special Characters</Label>
                          <Switch
                            id="requireSymbols"
                            checked={localSettings.security.passwordPolicy.requireSymbols}
                            onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireSymbols', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Session Management</h3>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="1"
                        max="168"
                        value={localSettings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Users will be logged out after this period of inactivity
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorRequired">Require Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Force all users to enable 2FA for enhanced security
                      </p>
                    </div>
                    <Switch
                      id="twoFactorRequired"
                      checked={localSettings.security.twoFactorRequired}
                      onCheckedChange={(checked) => updateSetting('security', 'twoFactorRequired', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "integration" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Integration Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure external service integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="emailProvider">Email Provider</Label>
                    <Select 
                      value={localSettings.integration.emailProvider}
                      onValueChange={(value) => updateSetting('integration', 'emailProvider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                        <SelectItem value="ses">Amazon SES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="smsProvider">SMS Provider</Label>
                    <Select 
                      value={localSettings.integration.smsProvider}
                      onValueChange={(value) => updateSetting('integration', 'smsProvider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                        <SelectItem value="aws-sns">AWS SNS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="calendarSync">Calendar Synchronization</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sync tasks with external calendar systems
                        </p>
                      </div>
                      <Switch
                        id="calendarSync"
                        checked={localSettings.integration.calendarSync}
                        onCheckedChange={(checked) => updateSetting('integration', 'calendarSync', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="singleSignOn">Single Sign-On (SSO)</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable integration with external identity providers
                        </p>
                      </div>
                      <Switch
                        id="singleSignOn"
                        checked={localSettings.integration.singleSignOn}
                        onCheckedChange={(checked) => updateSetting('integration', 'singleSignOn', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Save Notice */}
        {isDirty && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                You have unsaved changes
              </span>
              <Button size="sm" onClick={handleSave}>
                Save Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}