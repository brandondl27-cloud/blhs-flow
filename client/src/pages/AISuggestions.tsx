import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  CheckCircle2, 
  X, 
  TrendingUp, 
  Calendar, 
  Users, 
  BookOpen,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Check
} from "lucide-react";
import { Link } from "wouter";

interface AISuggestion {
  id: number;
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  accepted: boolean;
  createdAt: string;
}

export default function AISuggestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["/api/suggestions"],
    enabled: !!user,
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      console.log("Making API request to generate suggestions...");
      const response = await apiRequest("/api/suggestions/generate", "POST", {});
      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Mutation success:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: "New Suggestions Generated",
        description: "AI has analyzed your patterns and created personalized recommendations.",
      });
    },
    onError: (error) => {
      console.error("Generate suggestions error:", error);
      toast({
        title: "Generation Failed",
        description: `Unable to generate new suggestions: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: ({ id, accepted }: { id: number; accepted: boolean }) =>
      apiRequest(`/api/suggestions/${id}`, "PATCH", { accepted }),
    onSuccess: (_, { accepted }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: accepted ? "Suggestion Accepted" : "Suggestion Dismissed",
        description: accepted 
          ? "This suggestion will help improve future recommendations."
          : "This suggestion has been dismissed.",
      });
    },
  });

  const handleGenerateSuggestions = async () => {
    console.log("Generate suggestions clicked, user:", user);
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate suggestions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log("Starting mutation...");
      await generateSuggestionsMutation.mutateAsync();
      console.log("Mutation completed successfully");
    } catch (error) {
      console.error("Error in handleGenerateSuggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High Confidence";
    if (confidence >= 60) return "Medium Confidence";
    return "Low Confidence";
  };

  const getSuggestionIcon = (title: string) => {
    if (title.toLowerCase().includes('meeting') || title.toLowerCase().includes('schedule')) {
      return Calendar;
    }
    if (title.toLowerCase().includes('team') || title.toLowerCase().includes('collaborate')) {
      return Users;
    }
    if (title.toLowerCase().includes('student') || title.toLowerCase().includes('curriculum')) {
      return BookOpen;
    }
    if (title.toLowerCase().includes('improve') || title.toLowerCase().includes('optimize')) {
      return TrendingUp;
    }
    return Lightbulb;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                AI-Powered Suggestions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Intelligent recommendations tailored to your educational workflow
              </p>
            </div>
            <Button 
              onClick={handleGenerateSuggestions}
              disabled={isGenerating || generateSuggestionsMutation.isPending}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>Generate New Suggestions</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Suggestions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {suggestions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {suggestions.filter((s: AISuggestion) => s.accepted).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Confidence</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {suggestions.length > 0 
                      ? `${Math.round(suggestions.reduce((acc: number, s: AISuggestion) => acc + s.confidence, 0) / suggestions.length)}%`
                      : "0%"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {suggestions.filter((s: AISuggestion) => !s.accepted).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading suggestions...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No AI Suggestions Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Generate personalized recommendations based on your task patterns and educational workflow.
              </p>
              <Button onClick={handleGenerateSuggestions} disabled={isGenerating}>
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Your First Suggestions
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {suggestions.map((suggestion: AISuggestion) => {
              const SuggestionIcon = getSuggestionIcon(suggestion.title);
              const confidenceColor = getConfidenceColor(suggestion.confidence);
              
              return (
                <Card key={suggestion.id} className={`transition-all duration-200 hover:shadow-lg ${
                  suggestion.accepted ? 'border-green-200 bg-green-50/50 dark:bg-green-950/50' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <SuggestionIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          <div className="flex items-center space-x-3 mt-1">
                            <Badge variant="outline" className={confidenceColor}>
                              {getConfidenceLabel(suggestion.confidence)}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(suggestion.createdAt).toLocaleDateString()}
                            </span>
                            {suggestion.accepted && (
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!suggestion.accepted && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSuggestionMutation.mutate({ 
                              id: suggestion.id, 
                              accepted: false 
                            })}
                            disabled={updateSuggestionMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateSuggestionMutation.mutate({ 
                              id: suggestion.id, 
                              accepted: true 
                            })}
                            disabled={updateSuggestionMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {suggestion.description}
                    </CardDescription>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          AI Reasoning
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          {suggestion.reasoning}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Confidence Score
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {suggestion.confidence}%
                          </span>
                        </div>
                        <Progress value={suggestion.confidence} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Educational Context Info */}
        <Card className="mt-8 border-blue-200 bg-blue-50/50 dark:bg-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
              <BookOpen className="h-5 w-5" />
              <span>Educational AI Context</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Our AI suggestions are specifically designed for educational institutions. 
              The system analyzes your task patterns, role responsibilities, and educational workflows 
              to provide relevant recommendations that improve productivity and student outcomes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}