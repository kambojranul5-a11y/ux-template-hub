import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart as BarChartIcon, 
  Download, 
  TrendingUp, 
  Users, 
  Eye,
  Activity,
  Monitor,
  Smartphone,
  Tablet,
  Calendar
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DownloadStats {
  totalDownloads: number;
  downloadsByTemplate: { templateId: string; templateTitle: string; count: number }[];
  recentDownloads: { templateId: string; downloadedAt: string }[];
}

const templateTitles: Record<string, string> = {
  "1": "UX Research Intake Template",
  "2": "Designer Led UX Research",
  "3": "UX Research Dovetail Analysis",
  "4": "Find Your UX Research Method",
};

// Generate time series data from real download records
const generateTimeSeriesFromDownloads = (downloads: { downloadedAt: string }[], days: number) => {
  const data = [];
  const downloadsByDate: Record<string, number> = {};
  
  // Count downloads per day
  downloads.forEach((download) => {
    const date = format(new Date(download.downloadedAt), 'MMM dd');
    downloadsByDate[date] = (downloadsByDate[date] || 0) + 1;
  });
  
  // Create data for each day in the range
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(date, 'MMM dd');
    data.push({
      date: dateKey,
      downloads: downloadsByDate[dateKey] || 0,
    });
  }
  
  return data;
};

// Categorize traffic source based on referrer
const categorizeTrafficSource = (referrer: string | null): string => {
  if (!referrer || referrer === 'direct' || referrer === '') {
    return 'Direct';
  }
  
  const lowerReferrer = referrer.toLowerCase();
  
  // Search engines
  if (lowerReferrer.includes('google') || lowerReferrer.includes('bing') || 
      lowerReferrer.includes('yahoo') || lowerReferrer.includes('duckduckgo') ||
      lowerReferrer.includes('search')) {
    return 'Organic Search';
  }
  
  // Social media
  if (lowerReferrer.includes('facebook') || lowerReferrer.includes('twitter') || 
      lowerReferrer.includes('linkedin') || lowerReferrer.includes('instagram') ||
      lowerReferrer.includes('tiktok') || lowerReferrer.includes('reddit') ||
      lowerReferrer.includes('youtube') || lowerReferrer.includes('pinterest')) {
    return 'Social Media';
  }
  
  // Everything else is referral
  return 'Referral';
};

// Detect device type from user agent string
const detectDeviceType = (userAgent: string | null): string => {
  if (!userAgent) return 'Desktop';
  
  const ua = userAgent.toLowerCase();
  
  // Check for tablet first (before mobile, as tablets often have mobile in UA)
  if (ua.includes('ipad') || 
      ua.includes('tablet') || 
      ua.includes('kindle') ||
      (ua.includes('android') && !ua.includes('mobile'))) {
    return 'Tablet';
  }
  
  // Check for mobile
  if (ua.includes('mobile') || 
      ua.includes('iphone') || 
      ua.includes('ipod') || 
      ua.includes('android') ||
      ua.includes('blackberry') ||
      ua.includes('windows phone')) {
    return 'Mobile';
  }
  
  // Default to desktop
  return 'Desktop';
};

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DownloadStats>({
    totalDownloads: 0,
    downloadsByTemplate: [],
    recentDownloads: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ date: string; downloads: number }>>([]);
  const [allDownloads, setAllDownloads] = useState<{ downloadedAt: string }[]>([]);
  
  // Real-time analytics metrics
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalPageViews, setTotalPageViews] = useState(0);
  const [bounceRate, setBounceRate] = useState(0);
  const [trafficSourceData, setTrafficSourceData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [deviceData, setDeviceData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    const fetchDownloadStats = async () => {
      try {
        // Fetch all downloads within the date range
        const startDate = subDays(new Date(), parseInt(dateRange));
        const { data, error } = await supabase
          .from('template_downloads')
          .select('template_id, downloaded_at')
          .gte('downloaded_at', startDate.toISOString())
          .order('downloaded_at', { ascending: false });

        if (error) throw error;

        // Store all downloads for time series
        const downloadsData = data?.map(d => ({ downloadedAt: d.downloaded_at })) || [];
        setAllDownloads(downloadsData);

        // Generate time series from real data
        const timeSeries = generateTimeSeriesFromDownloads(downloadsData, parseInt(dateRange));
        setTimeSeriesData(timeSeries);

        // Calculate total downloads
        const totalDownloads = data?.length || 0;

        // Group by template
        const downloadCounts: Record<string, number> = {};
        data?.forEach((download) => {
          downloadCounts[download.template_id] = (downloadCounts[download.template_id] || 0) + 1;
        });

        // Convert to array and sort by count
        const downloadsByTemplate = Object.entries(downloadCounts)
          .map(([templateId, count]) => ({
            templateId,
            templateTitle: templateTitles[templateId] || `Template ${templateId}`,
            count,
          }))
          .sort((a, b) => b.count - a.count);

        setStats({
          totalDownloads,
          downloadsByTemplate,
          recentDownloads: data?.slice(0, 10).map(d => ({
            templateId: d.template_id,
            downloadedAt: d.downloaded_at
          })) || [],
        });

        // Fetch real analytics metrics
        await fetchAnalyticsMetrics(startDate);
      } catch (error) {
        console.error('Error fetching download stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalyticsMetrics = async (startDate: Date) => {
      try {
        // Fetch active users (sessions active in last 5 minutes)
        const { data: activeUsersData, error: activeUsersError } = await supabase
          .rpc('get_active_users');
        
        if (!activeUsersError && activeUsersData !== null) {
          console.log('📊 Active Users:', activeUsersData);
          setActiveUsers(activeUsersData);
        }

        // Fetch page views count for the date range
        const { count: pageViewCount, error: pageViewError } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('viewed_at', startDate.toISOString());
        
        if (!pageViewError && pageViewCount !== null) {
          console.log('📊 Page Views:', pageViewCount);
          setTotalPageViews(pageViewCount);
        }

        // Fetch bounce rate
        const { data: bounceRateData, error: bounceRateError } = await supabase
          .rpc('get_bounce_rate');
        
        if (!bounceRateError && bounceRateData !== null) {
          console.log('📊 Bounce Rate:', bounceRateData);
          setBounceRate(parseFloat(bounceRateData.toFixed(2)));
        }

        // Fetch traffic sources from page views
        const { data: pageViewsData, error: trafficError } = await supabase
          .from('page_views')
          .select('referrer')
          .gte('viewed_at', startDate.toISOString());
        
        if (!trafficError && pageViewsData) {
          // Categorize and count traffic sources
          const sourceCounts: Record<string, number> = {
            'Direct': 0,
            'Organic Search': 0,
            'Social Media': 0,
            'Referral': 0,
          };

          pageViewsData.forEach((view) => {
            const source = categorizeTrafficSource(view.referrer);
            sourceCounts[source]++;
          });

          // Convert to chart data format
          const chartData = [
            { name: 'Direct', value: sourceCounts['Direct'], color: '#0088FE' },
            { name: 'Organic Search', value: sourceCounts['Organic Search'], color: '#00C49F' },
            { name: 'Social Media', value: sourceCounts['Social Media'], color: '#FFBB28' },
            { name: 'Referral', value: sourceCounts['Referral'], color: '#FF8042' },
          ].filter(item => item.value > 0); // Only show sources with data

          console.log('📊 Traffic Sources:', chartData);
          setTrafficSourceData(chartData);
        }

        // Fetch device breakdown from page views
        const { data: deviceViewsData, error: deviceError } = await supabase
          .from('page_views')
          .select('user_agent')
          .gte('viewed_at', startDate.toISOString());
        
        if (!deviceError && deviceViewsData) {
          // Categorize and count device types
          const deviceCounts: Record<string, number> = {
            'Desktop': 0,
            'Mobile': 0,
            'Tablet': 0,
          };

          deviceViewsData.forEach((view) => {
            const device = detectDeviceType(view.user_agent);
            deviceCounts[device]++;
          });

          // Convert to chart data format
          const deviceChartData = [
            { name: 'Desktop', value: deviceCounts['Desktop'], color: '#8884d8' },
            { name: 'Mobile', value: deviceCounts['Mobile'], color: '#82ca9d' },
            { name: 'Tablet', value: deviceCounts['Tablet'], color: '#ffc658' },
          ].filter(item => item.value > 0); // Only show devices with data

          console.log('📊 Device Breakdown:', deviceChartData);
          setDeviceData(deviceChartData);
        }
      } catch (error) {
        console.error('Error fetching analytics metrics:', error);
      }
    };

    fetchDownloadStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'template_downloads'
        },
        (payload) => {
          console.log('📊 Analytics: New download detected!', payload);
          fetchDownloadStats();
        }
      )
      .subscribe((status) => {
        console.log('📡 Analytics subscription status:', status);
      });

    return () => {
      console.log('� Analytics: Unsubscribing from downloads channel');
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  // Refresh active users periodically (every 30 seconds)
  useEffect(() => {
    const refreshActiveUsers = async () => {
      try {
        const { data, error } = await supabase.rpc('get_active_users');
        if (!error && data !== null) {
          setActiveUsers(data);
        }
      } catch (error) {
        console.error('Error refreshing active users:', error);
      }
    };

    const interval = setInterval(refreshActiveUsers, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section py-12 border-b-2 border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Activity className="h-10 w-10" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">ANALYTICS DASHBOARD</h1>
                  <p className="text-sm opacity-90 mt-1">
                    Real-time insights and performance metrics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Downloads */}
              <Card className="border-2 card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                      Total Downloads
                    </CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? "..." : stats.totalDownloads.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% vs prev 30 days
                  </p>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card className="border-2 card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeUsers}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current active sessions
                  </p>
                </CardContent>
              </Card>

              {/* Total Page Views */}
              <Card className="border-2 card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                      Page Views
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalPageViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last {dateRange} days
                  </p>
                </CardContent>
              </Card>

              {/* Bounce Rate */}
              <Card className="border-2 card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                      Bounce Rate
                    </CardTitle>
                    <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{bounceRate}%</div>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 rotate-180" />
                    -8% improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Downloads Over Time */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl uppercase">Downloads Over Time</CardTitle>
                  <CardDescription>Real download data from your database</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Loading chart data...
                    </div>
                  ) : timeSeriesData.length === 0 || timeSeriesData.every(d => d.downloads === 0) ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No download data yet. Start downloading templates to see trends!
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="downloads" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="Downloads"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl uppercase">Traffic Sources</CardTitle>
                  <CardDescription>Real traffic data from page referrers</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Loading chart data...
                    </div>
                  ) : trafficSourceData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No traffic data yet. Visit pages to see traffic sources!
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trafficSourceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Visitors">
                          {trafficSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Breakdown */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl uppercase">Device Breakdown</CardTitle>
                  <CardDescription>Real device data from user agents</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Loading chart data...
                    </div>
                  ) : deviceData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No device data yet. Visit pages to see device breakdown!
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={deviceData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {deviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-bold">
                              {deviceData.find(d => d.name === 'Desktop')?.value || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Desktop</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-bold">
                              {deviceData.find(d => d.name === 'Mobile')?.value || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Mobile</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tablet className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-bold">
                              {deviceData.find(d => d.name === 'Tablet')?.value || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Tablet</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Downloads by Template */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl uppercase">Top Templates</CardTitle>
                  <CardDescription>Most downloaded templates</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : stats.downloadsByTemplate.length > 0 ? (
                    <div className="space-y-4">
                      {stats.downloadsByTemplate.map((template) => (
                        <div key={template.templateId} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm truncate">
                              {template.templateTitle}
                            </span>
                            <span className="text-xl font-bold text-primary ml-2">
                              {template.count}
                            </span>
                          </div>
                          <div className="h-2 bg-muted border border-border overflow-hidden rounded">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{
                                width: `${(template.count / Math.max(...stats.downloadsByTemplate.map(t => t.count))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No downloads yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Table */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl uppercase">Recent Activity</CardTitle>
                <CardDescription>Latest template downloads and user sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : stats.recentDownloads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-border">
                          <th className="text-left py-3 px-4 font-bold text-sm uppercase">Template</th>
                          <th className="text-left py-3 px-4 font-bold text-sm uppercase">Date & Time</th>
                          <th className="text-left py-3 px-4 font-bold text-sm uppercase hidden sm:table-cell">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentDownloads.map((download, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-sm">
                              {templateTitles[download.templateId] || `Template ${download.templateId}`}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(download.downloadedAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
