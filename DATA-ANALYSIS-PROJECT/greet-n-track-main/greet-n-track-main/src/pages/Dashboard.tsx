
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Clock, TrendingUp, Download, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, recentAttendance, chartData, loading, error, refreshData } = useDashboardData();
  
  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const pieData = [
    { name: "Successful", value: stats.successRate, color: "#10b981" },
    { name: "Failed", value: 100 - stats.successRate, color: "#ef4444" }
  ];

  const exportData = async () => {
    try {
      const csvContent = [
        'Name,Time,Confidence,Status',
        ...recentAttendance.map(record => 
          `${record.profiles?.name || 'Unknown'},${new Date(record.timestamp).toLocaleString()},${record.confidence_score?.toFixed(1) || 'N/A'}%,${record.status}`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">Registered in system</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Today</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.attendanceToday}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                {stats.totalUsers > 0 ? `${Math.round((stats.attendanceToday / stats.totalUsers) * 100)}% attendance rate` : 'No users registered'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgConfidence.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">Recognition accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.successRate.toFixed(1)}%</p>
                </div>
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
                </div>
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.totalAttempts} total attempts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Daily Attendance Trend</CardTitle>
                  <CardDescription className="dark:text-gray-300">Attendance count over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Recognition Success Rate</CardTitle>
                  <CardDescription className="dark:text-gray-300">Success vs Failed Recognition Attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Successful ({stats.successRate.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Failed ({(100 - stats.successRate).toFixed(1)}%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Confidence Score Analytics</CardTitle>
                <CardDescription className="dark:text-gray-300">Average recognition confidence over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                      formatter={(value) => [`${value}%`, 'Confidence']}
                    />
                    <Bar 
                      dataKey="confidence" 
                      fill="url(#confidenceGradient)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Recent Attendance</CardTitle>
                <CardDescription className="dark:text-gray-300">Latest facial recognition attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAttendance.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No attendance records found</p>
                    <p className="text-sm">Records will appear here after users mark attendance</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAttendance.map((record, index) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {record.profiles?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{record.profiles?.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(record.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
                            {record.confidence_score?.toFixed(1) || 'N/A'}%
                          </Badge>
                          <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
