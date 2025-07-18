import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Tasks",
      value: stats?.totalTasks || 0,
      change: "+12%",
      changeType: "positive",
      icon: CheckSquare,
      color: "primary",
    },
    {
      title: "In Progress",
      value: stats?.inProgress || 0,
      subtitle: `${stats?.totalTasks ? Math.round((stats.inProgress / stats.totalTasks) * 100) : 0}% of total`,
      icon: Clock,
      color: "blue",
    },
    {
      title: "Completed",
      value: stats?.completed || 0,
      subtitle: `${stats?.totalTasks ? Math.round((stats.completed / stats.totalTasks) * 100) : 0}% success rate`,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Due Soon",
      value: stats?.dueSoon || 0,
      subtitle: "Requires attention",
      icon: AlertTriangle,
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: {
        bg: "bg-primary-100 dark:bg-primary-900/30",
        icon: "text-primary-600 dark:text-primary-400",
        text: "text-green-600 dark:text-green-400",
      },
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        icon: "text-blue-600 dark:text-blue-400",
        text: "text-blue-600 dark:text-blue-400",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900/30",
        icon: "text-green-600 dark:text-green-400",
        text: "text-green-600 dark:text-green-400",
      },
      orange: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        icon: "text-orange-600 dark:text-orange-400",
        text: "text-orange-600 dark:text-orange-400",
      },
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card) => {
        const colors = getColorClasses(card.color);
        const Icon = card.icon;
        
        return (
          <Card key={card.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  {card.change && (
                    <p className={`text-sm mt-1 ${colors.text}`}>
                      <i className="fas fa-arrow-up mr-1"></i>
                      {card.change}
                    </p>
                  )}
                  {card.subtitle && (
                    <p className={`text-sm mt-1 ${colors.text}`}>
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
