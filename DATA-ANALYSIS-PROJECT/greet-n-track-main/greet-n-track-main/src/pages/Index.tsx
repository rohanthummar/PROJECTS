
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, UserPlus, BarChart3, Users, Clock, CheckCircle, LogIn, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [stats] = useState({
    totalUsers: 24,
    attendanceToday: 18,
    avgConfidence: 92.4,
    successRate: 95.8
  });

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const handleFeatureClick = (feature: 'register' | 'attendance') => {
    if (user) {
      navigate(`/${feature}`);
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">AttendEase</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {user && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              )}
              <Button 
                variant={user ? "outline" : "default"}
                onClick={handleAuthAction}
                className={user ? "hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" : ""}
              >
                {user ? (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Smart Attendance
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Track better. Mark smarter.
            {user && (
              <span className="block mt-2 text-blue-600 dark:text-blue-400">
                Welcome back, {user.user_metadata?.name || user.email}!
              </span>
            )}
          </p>
          <Badge variant="secondary" className="mb-8">
            <CheckCircle className="w-4 h-4 mr-2" />
            {stats.successRate}% Recognition Accuracy
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Registered Users</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.attendanceToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgConfidence}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-2xl">
                <UserPlus className="w-8 h-8 mr-3" />
                Register New User
              </CardTitle>
              <CardDescription className="text-blue-100">
                Upload your photo and register for facial recognition attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button 
                onClick={() => handleFeatureClick('register')}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                size="lg"
              >
                {user ? 'Start Registration' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-600 to-green-700 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-2xl">
                <Camera className="w-8 h-8 mr-3" />
                Mark Attendance
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Use facial recognition to mark your daily attendance instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button 
                onClick={() => handleFeatureClick('attendance')}
                className="w-full bg-white text-emerald-600 hover:bg-emerald-50 transition-colors"
                size="lg"
              >
                {user ? 'Scan Face' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose AttendEase?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-time Recognition</h3>
              <p className="text-gray-600 dark:text-gray-400">Advanced facial recognition technology with 95%+ accuracy rate</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Instant Notifications</h3>
              <p className="text-gray-600 dark:text-gray-400">Automatic SMS confirmations sent upon successful attendance</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and Excel-based attendance logging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
