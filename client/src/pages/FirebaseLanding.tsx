import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, Users, Calendar, BarChart3, Brain, Settings } from 'lucide-react';

export default function FirebaseLanding() {
  const { signInWithGoogle, isLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome to BLHS Flow!",
        description: "You have successfully signed in.",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BLHS Flow</h1>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            Firebase Edition
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Comprehensive Work Management for 
            <span className="text-blue-600 dark:text-blue-400"> Educational Institutions</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            BLHS Flow empowers educational teams with advanced task management, AI-powered insights, 
            real-time collaboration, and comprehensive analytics—all designed specifically for schools and educational environments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={handleSignIn}
              disabled={isSigningIn}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In with Google'
              )}
            </Button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Secure authentication • No registration required
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">4 Roles</div>
              <div className="text-gray-600 dark:text-gray-300">Administrator, Management, Educator, Support Staff</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Real-time</div>
              <div className="text-gray-600 dark:text-gray-300">Collaboration & Notifications</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">AI-Powered</div>
              <div className="text-gray-600 dark:text-gray-300">Task Suggestions & Analytics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Educational Task Management
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From basic task assignment to advanced analytics, BLHS Flow provides comprehensive tools 
            designed specifically for educational institution workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Educational Workflow?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join educational institutions already using BLHS Flow to streamline their task management, 
            enhance team collaboration, and improve productivity with AI-powered insights.
          </p>
          
          <Button 
            onClick={handleSignIn}
            disabled={isSigningIn}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Signing In...
              </>
            ) : (
              'Get Started Now'
            )}
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Powered by Firebase • Secure & Scalable • No Credit Card Required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 BLHS Flow. Educational Task Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}