import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Users, BarChart3, Calendar, Brain, Shield, Mail, Lock, BookOpen, Settings } from "lucide-react";

export default function EmailAuthLanding() {
  const { signIn, signUp, isLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to BLHS Flow.",
      });
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await signUp(email, password, displayName);
      toast({
        title: "Account Created",
        description: "Welcome to BLHS Flow! You can now start managing your educational tasks.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Please try again with a different email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Task Management",
      description: "Organize and track educational tasks with advanced assignment and progress monitoring.",
      benefits: ["Multi-assignee support", "Progress tracking", "Due date management", "File attachments"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Enhance team coordination with role-based access and real-time collaboration tools.",
      benefits: ["Role-based permissions", "Team statistics", "User management", "Real-time updates"]
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get intelligent task suggestions and productivity insights tailored to educational workflows.",
      benefits: ["Smart recommendations", "Performance analysis", "Workflow optimization", "Educational context"]
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Seamlessly manage schedules with integrated calendar and automated event creation.",
      benefits: ["Event management", "Task deadlines", "Heat map visualization", "Email notifications"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive analytics dashboard with custom reports and data visualization.",
      benefits: ["Performance metrics", "Custom reports", "Data visualization", "Progress tracking"]
    },
    {
      icon: Settings,
      title: "Administrative Tools",
      description: "Complete administrative control with user management and system configuration.",
      benefits: ["User account management", "Security settings", "System configuration", "Access control"]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading BLHS Flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BLHS Flow</h1>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Educational Work Management Platform
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Hero & Features */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Streamline Your Educational
                <span className="text-blue-600 block">Work Management</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                BLHS Flow is a comprehensive platform designed specifically for educational institutions 
                to manage tasks, enhance collaboration, and boost productivity with AI-powered insights.
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <feature.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-3">
                      {feature.description}
                    </CardDescription>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Authentication */}
          <div className="lg:sticky lg:top-8">
            <Card className="w-full max-w-md mx-auto shadow-2xl bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to BLHS Flow</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signin-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signin-password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          name="displayName"
                          type="text"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            className="pl-10"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-confirm"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            className="pl-10"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Security Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Secured with Firebase Authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}