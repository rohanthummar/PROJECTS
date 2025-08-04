
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  user_id: string;
  timestamp: string;
  confidence_score: number;
  status: string;
  profiles: {
    name: string;
    phone: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  attendanceToday: number;
  avgConfidence: number;
  successRate: number;
  totalAttempts: number;
  failedAttempts: number;
}

interface ChartData {
  date: string;
  attendance: number;
  confidence: number;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    attendanceToday: 0,
    avgConfidence: 0,
    successRate: 0,
    totalAttempts: 0,
    failedAttempts: 0
  });
  
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttendance, error: todayError } = await supabase
        .from('attendance')
        .select('*, profiles(name, phone)')
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`);
      
      if (todayError) throw todayError;

      // Fetch recent attendance (last 10 records)
      const { data: recentData, error: recentError } = await supabase
        .from('attendance')
        .select('*, profiles(name, phone)')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (recentError) throw recentError;

      // Fetch last 7 days of attendance for chart
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      
      const { data: weekData, error: weekError } = await supabase
        .from('attendance')
        .select('timestamp, confidence_score')
        .gte('timestamp', sevenDaysAgo.toISOString())
        .order('timestamp', { ascending: true });
      
      if (weekError) throw weekError;

      // Process chart data
      const dailyData = processWeeklyData(weekData || []);
      
      // Calculate statistics
      const attendanceToday = todayAttendance?.length || 0;
      const totalAttempts = weekData?.length || 0;
      const avgConfidence = weekData && weekData.length > 0 
        ? weekData.reduce((sum, record) => sum + (record.confidence_score || 0), 0) / weekData.length 
        : 0;
      
      // For demo purposes, assume 95% success rate
      const successRate = totalAttempts > 0 ? 95 : 0;
      const failedAttempts = Math.round(totalAttempts * 0.05);

      setStats({
        totalUsers: totalUsers || 0,
        attendanceToday,
        avgConfidence,
        successRate,
        totalAttempts,
        failedAttempts
      });
      
      setRecentAttendance(recentData || []);
      setChartData(dailyData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      
      toast({
        title: "Data Loading Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (data: any[]): ChartData[] => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = data.filter(record => 
        record.timestamp.startsWith(dateStr)
      );
      
      const attendance = dayData.length;
      const confidence = dayData.length > 0 
        ? dayData.reduce((sum, record) => sum + (record.confidence_score || 0), 0) / dayData.length 
        : 0;
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attendance,
        confidence: Math.round(confidence * 10) / 10
      });
    }
    
    return last7Days;
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentAttendance,
    chartData,
    loading,
    error,
    refreshData
  };
};
