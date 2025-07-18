import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Filter,
  Printer,
  Mail,
  Activity
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface ReportData {
  id: string;
  name: string;
  type: 'productivity' | 'attendance' | 'performance' | 'compliance';
  generatedAt: string;
  period: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportType, setReportType] = useState("productivity");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

  // Sample report data
  const sampleReports: ReportData[] = [
    {
      id: "1",
      name: "Monthly Productivity Report",
      type: "productivity",
      generatedAt: "2025-01-15T10:30:00Z",
      period: "January 2025",
      status: "completed",
      downloadUrl: "/reports/productivity-jan-2025.pdf"
    },
    {
      id: "2", 
      name: "Staff Performance Analysis",
      type: "performance",
      generatedAt: "2025-01-10T14:15:00Z",
      period: "Q4 2024",
      status: "completed",
      downloadUrl: "/reports/performance-q4-2024.pdf"
    },
    {
      id: "3",
      name: "Attendance Summary Report",
      type: "attendance", 
      generatedAt: "2025-01-18T09:00:00Z",
      period: "Last 30 Days",
      status: "processing"
    }
  ];

  // Sample productivity data for charts
  const productivityData = [
    { month: "Sep", tasks: 145, completed: 132, efficiency: 91 },
    { month: "Oct", tasks: 168, completed: 151, efficiency: 90 },
    { month: "Nov", tasks: 159, completed: 142, efficiency: 89 },
    { month: "Dec", tasks: 187, completed: 169, efficiency: 90 },
    { month: "Jan", tasks: 203, completed: 189, efficiency: 93 }
  ];

  const departmentData = [
    { name: "Academic Affairs", value: 35, tasks: 156 },
    { name: "Student Services", value: 28, tasks: 124 },
    { name: "Administration", value: 25, tasks: 112 },
    { name: "IT Services", value: 12, tasks: 54 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const getStatusBadge = (status: ReportData['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>;
    }
  };

  const getTypeIcon = (type: ReportData['type']) => {
    switch (type) {
      case 'productivity': return TrendingUp;
      case 'attendance': return Users;
      case 'performance': return BarChart3;
      case 'compliance': return CheckCircle2;
      default: return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateReport = () => {
    // In production, this would trigger report generation
    console.log('Generating report:', { reportType, selectedPeriod, selectedDepartment });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive reports and analyze institutional performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Generate Report</span>
                </CardTitle>
                <CardDescription>
                  Create custom reports for your institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="productivity">Productivity Report</SelectItem>
                      <SelectItem value="attendance">Attendance Report</SelectItem>
                      <SelectItem value="performance">Performance Analysis</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">Time Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="academic">Academic Affairs</SelectItem>
                      <SelectItem value="student">Student Services</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                      <SelectItem value="it">IT Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={generateReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tasks Completed</span>
                  </div>
                  <span className="font-semibold">189</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="font-semibold">14</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Overdue</span>
                  </div>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Efficiency</span>
                  </div>
                  <span className="font-semibold">93%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productivity Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Productivity Trends</CardTitle>
                <CardDescription>
                  Task completion and efficiency over the past 5 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Completed Tasks"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Efficiency %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Distribution by Department</CardTitle>
                  <CardDescription>
                    Current workload across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>
                    Generated reports and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sampleReports.map((report) => {
                      const IconComponent = getTypeIcon(report.type);
                      return (
                        <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-sm">{report.name}</p>
                              <p className="text-xs text-gray-500">{report.period}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(report.status)}
                            {report.downloadUrl && (
                              <Button size="sm" variant="ghost">
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Report History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Report History</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              View and download previously generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleReports.map((report) => {
                const IconComponent = getTypeIcon(report.type);
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {report.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Generated: {formatDate(report.generatedAt)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Period: {report.period}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(report.status)}
                      {report.downloadUrl && (
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}