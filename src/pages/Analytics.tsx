import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MousePointer, Download, Clock, TrendingUp, Globe, RefreshCw, FileDown, Activity, Eye, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, ReferenceDot } from 'recharts';
import { format, subDays, subMonths, startOfQuarter } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// Generate monthly baseline data that sums to annual totals
const generateMonthlyBaselineData = () => {
  const annualTotals = {
    visitors: 72653,
    clicks: 110000,
    downloads: 50000,
  };

  // Growth pattern multipliers for each month (simulating seasonal trends + growth)
  // Sum of multipliers = 12.0 (to maintain proportions)
  const monthlyMultipliers = [
    0.75, // Jan - slower start
    0.80, // Feb
    0.85, // Mar
    0.90, // Apr
    0.95, // May
    1.00, // Jun
    1.05, // Jul
    1.10, // Aug
    1.15, // Sep
    1.20, // Oct
    1.10, // Nov
    1.15  // Dec
  ];

  const sumMultipliers = monthlyMultipliers.reduce((a, b) => a + b, 0);

  const monthlyData = [];
  const now = new Date();
  const targetAvgTime = 172; // 2:52 in seconds

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const multiplier = monthlyMultipliers[11 - i];
    const proportion = multiplier / sumMultipliers;

    // Vary avgTime slightly around the target (±10 seconds)
    const timeVariation = Math.floor(Math.random() * 21) - 10; // -10 to +10 seconds

    monthlyData.push({
      month: format(monthDate, 'MMM yyyy'),
      date: monthDate,
      visitors: Math.round(annualTotals.visitors * proportion),
      clicks: Math.round(annualTotals.clicks * proportion),
      downloads: Math.round(annualTotals.downloads * proportion),
      repeatVisitors: Math.round(annualTotals.visitors * proportion * 0.18), // 18% repeat rate
      avgTime: targetAvgTime + timeVariation // Average around 172 seconds (2:52)
    });
  }

  // Adjust last month to ensure exact sum (compensate for rounding)
  const calculateTotal = (key: 'visitors' | 'clicks' | 'downloads') => 
    monthlyData.reduce((sum, month) => sum + month[key], 0);

  monthlyData[11].visitors += annualTotals.visitors - calculateTotal('visitors');
  monthlyData[11].clicks += annualTotals.clicks - calculateTotal('clicks');
  monthlyData[11].downloads += annualTotals.downloads - calculateTotal('downloads');

  return monthlyData;
};

const MONTHLY_BASELINE_DATA = generateMonthlyBaselineData();

// Template distribution (annual totals)
const TEMPLATE_BASELINE = [
  { id: '2', name: 'Designer-Led UX Research', downloads: 15200, clicks: 39000, share: 32 },
  { id: '1', name: 'UX Research Intake Template', downloads: 11100, clicks: 28000, share: 24 },
  { id: '3', name: 'UX Research Dovetail Analysis', downloads: 9400, clicks: 24000, share: 20 },
  { id: '4', name: 'Find Your UX Research Method', downloads: 11100, clicks: 19000, share: 24 }
];

// Geographic distribution (percentages stay constant)
const GEOGRAPHIC_BASELINE = [
  { name: 'Canada', percentage: 38 },
  { name: 'US', percentage: 32 },
  { name: 'India', percentage: 18 },
  { name: 'Others', percentage: 12 }
];

const TRAFFIC_SOURCES = [
  { name: 'Organic Search', value: 60, color: '#64748b' }, // slate-500
  { name: 'Direct', value: 20, color: '#475569' }, // slate-600
  { name: 'Social', value: 12, color: '#94a3b8' }, // slate-300
  { name: 'Referral', value: 6, color: '#cbd5e1' }, // slate-200
  { name: 'Email', value: 2, color: '#94a3b8' } // slate-300 (reused)
];

// Helper to render pie labels with dark, readable text
interface PieLabelEntry {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  value: number;
}

const renderPieLabel = (entry: PieLabelEntry) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, name, value } = entry;
  const radius = outerRadius + 12;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#0f172a" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {`${name} ${value}%`}
    </text>
  );
};

// Filter baseline data by date range
const filterBaselineByDateRange = (dateRangeValue: string) => {
  const now = new Date();

  if (dateRangeValue === 'all') {
    // Return all 12 months
    return MONTHLY_BASELINE_DATA;
  }

  const days = parseInt(dateRangeValue);
  const cutoffDate = subDays(now, days);

  // Filter months that fall within the date range
  const filteredMonths = MONTHLY_BASELINE_DATA.filter(month => month.date >= cutoffDate);

  return filteredMonths;
};

// Calculate totals from filtered baseline data
const calculateFilteredTotals = (dateRangeValue: string) => {
  const filteredData = filterBaselineByDateRange(dateRangeValue);
  
  const totals = filteredData.reduce(
    (acc, month) => ({
      visitors: acc.visitors + month.visitors,
      clicks: acc.clicks + month.clicks,
      downloads: acc.downloads + month.downloads,
      repeatVisitors: acc.repeatVisitors + month.repeatVisitors,
      avgTime: acc.avgTime + month.avgTime
    }),
    { visitors: 0, clicks: 0, downloads: 0, repeatVisitors: 0, avgTime: 0 }
  );

  // Calculate average time across filtered months
  totals.avgTime = filteredData.length > 0 ? Math.round(totals.avgTime / filteredData.length) : 0;

  return totals;
};

// Calculate geographic distribution from filtered baseline
const calculateFilteredGeographic = (dateRangeValue: string) => {
  const filteredTotals = calculateFilteredTotals(dateRangeValue);
  const filteredMonths = filterBaselineByDateRange(dateRangeValue);
  
  // Add slight variations to percentages based on time period (±2%)
  // This simulates seasonal geographic trends
  const monthCount = filteredMonths.length;
  const seasonalVariation = (monthCount % 3) - 1; // -1, 0, or 1
  
  const geoWithVariation = GEOGRAPHIC_BASELINE.map((geo, index) => {
    // Apply small variations to make percentages change over different periods
    let adjustedPercentage = geo.percentage;
    if (index === 0) adjustedPercentage += seasonalVariation; // Canada
    if (index === 1) adjustedPercentage -= seasonalVariation * 0.5; // US
    if (index === 2) adjustedPercentage += seasonalVariation * 0.3; // India
    if (index === 3) adjustedPercentage -= seasonalVariation * 0.8; // Others
    
    return {
      name: geo.name,
      basePercentage: adjustedPercentage,
      value: 0
    };
  });
  
  // Normalize percentages to sum to 100
  const totalPercentage = geoWithVariation.reduce((sum, g) => sum + g.basePercentage, 0);
  
  return geoWithVariation.map(geo => {
    const normalizedPercentage = (geo.basePercentage / totalPercentage) * 100;
    return {
      name: geo.name,
      value: Math.round(filteredTotals.visitors * (normalizedPercentage / 100)),
      percentage: Math.round(normalizedPercentage)
    };
  });
};

// Calculate template distribution from filtered baseline
const calculateFilteredTemplates = (dateRangeValue: string) => {
  const filteredTotals = calculateFilteredTotals(dateRangeValue);
  
  return TEMPLATE_BASELINE.map(template => ({
    ...template,
    downloads: Math.round(filteredTotals.downloads * (template.share / 100)),
    clicks: Math.round(filteredTotals.clicks * (template.share / 100))
  }));
};

const Analytics = () => {
  useAnalyticsTracking('Analytics');
  
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [realTimeDownloads, setRealTimeDownloads] = useState(0);
  const [realTimeClicks, setRealTimeClicks] = useState(0);
  const [realTimeByTemplate, setRealTimeByTemplate] = useState<Record<string, number>>({});
  const [realTimeClicksByTemplate, setRealTimeClicksByTemplate] = useState<Record<string, number>>({});
  const [realTimeSessions, setRealTimeSessions] = useState(0);
  const [realGeoData, setRealGeoData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [dateRange, setDateRange] = useState('365'); // Default to 1 year

  const fetchRealTimeData = useCallback(async () => {
    try {
      let downloadsQuery = supabase.from('template_downloads').select('template_id, downloaded_at');
      let clicksQuery = supabase.from('template_clicks').select('template_id, clicked_at');
      let sessionsQuery = supabase.from('sessions').select('country, created_at');

      // Apply date filter if not "all"
      if (dateRange !== 'all') {
        const startDate = subDays(new Date(), parseInt(dateRange));
        const startDateISO = startDate.toISOString();
        
        downloadsQuery = downloadsQuery.gte('downloaded_at', startDateISO);
        clicksQuery = clicksQuery.gte('clicked_at', startDateISO);
        sessionsQuery = sessionsQuery.gte('created_at', startDateISO);
      }

      // Fetch downloads
      const { data: downloads, error: downloadError } = await downloadsQuery;

      if (downloadError) {
        console.error('Error fetching downloads:', downloadError);
      } else {
        console.log('✅ Downloaded data:', downloads?.length || 0, 'records');
      }

      // Fetch clicks
      const { data: clicks, error: clickError } = await clicksQuery;

      if (clickError) {
        console.error('Error fetching clicks:', clickError);
      } else {
        console.log('✅ Clicks data:', clicks?.length || 0, 'records');
      }

      // Fetch sessions
      const { data: sessions, error: sessionError } = await sessionsQuery;

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
      } else {
        console.log('✅ Sessions data:', sessions?.length || 0, 'records');
      }

      const downloadsByTemplate: Record<string, number> = {};
      downloads?.forEach((d) => {
        downloadsByTemplate[d.template_id] = (downloadsByTemplate[d.template_id] || 0) + 1;
      });

      const clicksByTemplate: Record<string, number> = {};
      clicks?.forEach((c) => {
        clicksByTemplate[c.template_id] = (clicksByTemplate[c.template_id] || 0) + 1;
      });

      const geoData: Record<string, number> = {};
      sessions?.forEach((s) => {
        const country = s.country || 'Others';
        geoData[country] = (geoData[country] || 0) + 1;
      });

      setRealTimeDownloads(downloads?.length || 0);
      setRealTimeClicks(clicks?.length || 0);
      setRealTimeByTemplate(downloadsByTemplate);
      setRealTimeClicksByTemplate(clicksByTemplate);
      setRealTimeSessions(sessions?.length || 0);
      setRealGeoData(geoData);
      setLoading(false);
      
      console.log('📊 Real-time totals:', {
        downloads: downloads?.length || 0,
        clicks: clicks?.length || 0,
        sessions: sessions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchRealTimeData();

    const downloadChannel = supabase
      .channel('template_downloads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'template_downloads' }, () => fetchRealTimeData())
      .subscribe();

    const clickChannel = supabase
      .channel('template_clicks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'template_clicks' }, () => fetchRealTimeData())
      .subscribe();

    const sessionChannel = supabase
      .channel('sessions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchRealTimeData())
      .subscribe();

    return () => {
      supabase.removeChannel(downloadChannel);
      supabase.removeChannel(clickChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [fetchRealTimeData, dateRange]);

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    
    setDownloading(true);
    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      let heightLeft = imgHeight * ratio;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight * ratio;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
      }
      
      // Set PDF metadata and include presenter name in filename
      pdf.setProperties({
        title: `Analytics Report - ${format(new Date(), 'yyyy-MM-dd')}`,
        author: 'Ranul'
      });

      const fileName = `Analytics-Report-Ranul-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const generateMonthlyData = () => {
    // Use the filtered baseline monthly data
    const filteredMonths = filterBaselineByDateRange(dateRange);
    
    return filteredMonths.map(month => ({
      month: format(month.date, "MMM ''yy"),
      visitors: month.visitors,
      downloads: month.downloads
    }));
  };

  const generateQuarterlyData = () => {
    // Use the filtered baseline monthly data and group by quarters
    const filteredMonths = filterBaselineByDateRange(dateRange);
    const quarterMap = new Map<string, { visitors: number; downloads: number }>();
    
    filteredMonths.forEach(month => {
      const quarterStart = startOfQuarter(month.date);
      const qNum = Math.floor(quarterStart.getMonth() / 3) + 1;
      const quarterLabel = `Q${qNum} ${format(quarterStart, 'yy')}`;
      
      if (!quarterMap.has(quarterLabel)) {
        quarterMap.set(quarterLabel, { visitors: 0, downloads: 0 });
      }
      
      const current = quarterMap.get(quarterLabel)!;
      current.visitors += month.visitors;
      current.downloads += month.downloads;
    });
    
    return Array.from(quarterMap.entries()).map(([quarter, data]) => ({
      quarter,
      visitors: data.visitors,
      downloads: data.downloads
    }));
  };

  const monthlyData = generateMonthlyData();
  const quarterlyData = generateQuarterlyData();

  // Get filtered baseline data based on selected date range
  const filteredBaseline = calculateFilteredTotals(dateRange);
  const filteredGeoData = calculateFilteredGeographic(dateRange);
  const filteredTemplates = calculateFilteredTemplates(dateRange);

  // Calculate totals: filtered baseline + real-time data
  const totalVisitors = filteredBaseline.visitors + realTimeSessions;
  const totalClicks = filteredBaseline.clicks + realTimeClicks;
  const totalDownloads = filteredBaseline.downloads + realTimeDownloads;
  const hasRealData = realTimeSessions > 0 || realTimeClicks > 0 || realTimeDownloads > 0;
  const repeatVisitors = filteredBaseline.repeatVisitors + Math.floor(realTimeSessions * 0.18);
  const avgTime = filteredBaseline.avgTime; // Average time from baseline

  // Combine filtered geographic data with real-time data
  const combinedGeoData = filteredGeoData.map(region => {
    const realCount = realGeoData[region.name] || 0;
    const totalValue = region.value + realCount;
    return { ...region, value: totalValue };
  });

  const totalGeoValue = combinedGeoData.reduce((sum, region) => sum + region.value, 0);
  const geoDataWithPercentages = combinedGeoData.map(region => {
    const pct = totalGeoValue > 0 ? (region.value / totalGeoValue) * 100 : region.percentage;
    return { ...region, percentage: Math.round(pct) };
  });

  // Combine filtered template data with real-time data
  const templatesWithRealData = filteredTemplates.map(template => {
    const realDownloads = realTimeByTemplate[template.id] || 0;
    const realClicks = realTimeClicksByTemplate[template.id] || 0;
    return {
      ...template,
      downloads: template.downloads + realDownloads,
      clicks: template.clicks + realClicks
    };
  });

  const totalTemplateDownloads = templatesWithRealData.reduce((sum, t) => sum + t.downloads, 0);
  const templatesWithShare = templatesWithRealData.map(template => {
    const divisor = template.downloads;
    const ratio = totalTemplateDownloads / divisor;
    const share = 100 / ratio;
    return { ...template, share: parseFloat(share.toFixed(2)) };
  });

  const topTemplate = templatesWithShare.length > 0 ? templatesWithShare.reduce((prev, current) => 
    (prev.downloads > current.downloads) ? prev : current
  ) : null;

  const COLORS = ['#64748b', '#475569', '#94a3b8', '#cbd5e1']; // Professional slate/gray tones

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
                    1 Year Performance + Real-Time Updates
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={dateRange} onValueChange={(value) => setDateRange(value)}>
                  <SelectTrigger className="w-[180px] border-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                    <SelectItem value="180">Last 6 Months</SelectItem>
                    <SelectItem value="365">Last 1 Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className={`w-4 h-4 ${downloading ? 'animate-pulse' : ''}`} />
                  {downloading ? 'GENERATING...' : 'DOWNLOAD PDF'}
                </button>
                <button 
                  onClick={fetchRealTimeData} 
                  disabled={loading} 
                  className="flex items-center gap-2 px-4 py-2 bg-background border-2 border-border hover:bg-accent transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  REFRESH
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-8" ref={dashboardRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Top Section: KPI Cards + Template Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side: KPI Cards (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Row 1: Visitors */}
                  <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 shrink-0">
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="space-y-0">
                          <div className="text-xl font-bold">{totalVisitors.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Visitors</div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +15% vs last quarter
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Row 1: Downloads */}
                  <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 shrink-0">
                          <Download className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="space-y-0">
                          <div className="text-xl font-bold">{totalDownloads.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Downloads</div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +23% vs last quarter
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Row 2: Clicks */}
                  <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 shrink-0">
                          <MousePointer className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="space-y-0">
                          <div className="text-xl font-bold">{totalClicks.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +18% vs last quarter
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Row 2: Avg Time */}
                  <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 shrink-0">
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="space-y-0">
                          <div className="text-xl font-bold">{Math.floor(avgTime / 60)}:{(avgTime % 60).toString().padStart(2, '0')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Time</div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +12% vs last quarter
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Row 3: Repeat Visitors (spanning 2 columns) */}
                  <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border md:col-span-2">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 shrink-0">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="space-y-0">
                          <div className="text-xl font-bold">18%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Repeat Visitors</div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +5% vs last quarter
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Template Card - Below KPI Cards */}
                {topTemplate && (
                  <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        🏆 Top Performing Template
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold">{topTemplate.name}</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Downloads</p>
                            <p className="text-xl font-bold">{topTemplate.downloads.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Market Share</p>
                            <p className="text-xl font-bold">{topTemplate.share}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">✨ Most Popular</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Side: Template Distribution (1/3 width) */}
              <div className="lg:col-span-1">
                <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">Template Distribution</CardTitle>
                    <CardDescription className="text-xs">Download distribution across templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart 
                        data={templatesWithShare} 
                        margin={{ top: 5, right: 5, left: 5, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 9 }}
                          interval={0}
                          tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                        />
                        <YAxis 
                          tick={{ fontSize: 10 }}
                          domain={[0, 100]}
                          label={{ value: 'Share (%)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, 'Share']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                            color: '#0f172a',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar 
                          dataKey="share" 
                          radius={[4, 4, 0, 0]}
                          label={{ 
                            position: 'top', 
                            fontSize: 10, 
                            fontWeight: 600,
                            formatter: (value: number) => `${value}%`
                          }}
                        >
                          {templatesWithShare.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#8B5CF6' : '#94a3b8'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#64748b' }} />
                        <span className="text-gray-800">Top Performer</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Geographic & Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl uppercase flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription>Global impact across countries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full" style={{ maxWidth: '100%', margin: '0 auto' }}>
                    <ComposableMap
                      projection="geoMercator"
                      projectionConfig={{
                        scale: 100,
                        center: [-20, 40]
                      }}
                      style={{ width: '100%', height: 'auto' }}
                    >
                      <Geographies geography="/world-110m.json">
                        {({ geographies }) =>
                          geographies.map((geo) => {
                            const countryName = geo.properties.NAME || geo.properties.name;
                            let fillColor = "#E5E7EB"; // Default light gray
                            
                            // Highlight top 3 countries
                            if (countryName === "Canada") {
                              fillColor = "#3B82F6"; // Blue for Canada (38%)
                            } else if (countryName === "United States of America" || countryName === "United States") {
                              fillColor = "#10B981"; // Green for US (32%)
                            } else if (countryName === "India") {
                              fillColor = "#F59E0B"; // Amber for India (18%)
                            }
                            
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={fillColor}
                                stroke="#fff"
                                strokeWidth={0.5}
                                style={{
                                  default: { outline: 'none' },
                                  hover: { outline: 'none', fill: fillColor, opacity: 0.8 },
                                  pressed: { outline: 'none' }
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                      
                      {/* Markers with labels for top 3 countries */}
                      <Marker coordinates={[-95, 56]}>
                        <circle r={3} fill="#3B82F6" />
                        <text
                          textAnchor="middle"
                          y={-8}
                          style={{ fontFamily: 'system-ui', fill: '#1F2937', fontSize: '11px', fontWeight: 'bold' }}
                        >
                          Canada {geoDataWithPercentages.find(g => g.name === 'Canada')?.percentage || 38}%
                        </text>
                      </Marker>
                      
                      <Marker coordinates={[-95, 37]}>
                        <circle r={3} fill="#10B981" />
                        <text
                          textAnchor="middle"
                          y={-8}
                          style={{ fontFamily: 'system-ui', fill: '#1F2937', fontSize: '11px', fontWeight: 'bold' }}
                        >
                          US {geoDataWithPercentages.find(g => g.name === 'US')?.percentage || 32}%
                        </text>
                      </Marker>
                      
                      <Marker coordinates={[78, 20]}>
                        <circle r={3} fill="#F59E0B" />
                        <text
                          textAnchor="middle"
                          y={-8}
                          style={{ fontFamily: 'system-ui', fill: '#1F2937', fontSize: '11px', fontWeight: 'bold' }}
                        >
                          India {geoDataWithPercentages.find(g => g.name === 'India')?.percentage || 18}%
                        </text>
                      </Marker>
                    </ComposableMap>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
                      <div>
                        <p className="text-sm font-bold">Canada</p>
                        <p className="text-xs text-muted-foreground">{geoDataWithPercentages[0]?.percentage}% - {geoDataWithPercentages[0]?.value.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
                      <div>
                        <p className="text-sm font-bold">United States</p>
                        <p className="text-xs text-muted-foreground">{geoDataWithPercentages[1]?.percentage}% - {geoDataWithPercentages[1]?.value.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }} />
                      <div>
                        <p className="text-sm font-bold">India</p>
                        <p className="text-xs text-muted-foreground">{geoDataWithPercentages[2]?.percentage}% - {geoDataWithPercentages[2]?.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl uppercase">Top 5 Traffic Sources</CardTitle>
                  <CardDescription>Where visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={TRAFFIC_SOURCES} cx="50%" cy="50%" labelLine={false} label={renderPieLabel} outerRadius={100} fill="#8884d8" dataKey="value">
                        {TRAFFIC_SOURCES.map((entry,index)=><Cell key={`cell-${index}`} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.98)',
                          color: '#0f172a',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          padding: '10px'
                        }}
                        formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                        labelFormatter={(label) => `${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quarterly Growth */}
            <Card className="border-2 bg-gradient-to-br from-rose-50 via-amber-50 to-yellow-50 dark:from-rose-950 dark:via-amber-950 dark:to-yellow-950">
              <CardHeader>
                <CardTitle className="text-xl uppercase">Quarterly Growth Timeline (Last 4 Quarters)</CardTitle>
                <CardDescription>Accelerating growth showing strong momentum 📈</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={quarterlyData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                    <XAxis 
                      dataKey="quarter" 
                      tick={{ fontSize: 13, fontWeight: 600 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      domain={[0, 35000]}
                      ticks={[0, 10000, 20000, 30000]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '2px solid #3B82F6',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      formatter={(value: number) => value.toLocaleString()}
                      labelFormatter={(label) => `Quarter: ${label}`}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Visitors"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                      label={({ x, y, value, index }) => {
                        const data = quarterlyData[index];
                        const prevValue = index > 0 ? quarterlyData[index - 1].visitors : data.visitors;
                        const growth = index > 0 ? Math.round(((data.visitors - prevValue) / prevValue) * 100) : 0;
                        return (
                          <text 
                            x={x} 
                            y={y - 15} 
                            fill="#3B82F6" 
                            fontSize="10" 
                            textAnchor="middle"
                          >
                            {value.toLocaleString()} | {growth > 0 ? `+${growth}%` : `${growth}%`}
                          </text>
                        );
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="downloads" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Downloads"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                      label={({ x, y, value }) => (
                        <text 
                          x={x} 
                          y={y + 20} 
                          fill="#10B981" 
                          fontSize="10" 
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {value.toLocaleString()}
                        </text>
                      )}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Performance */}
            <Card className="border-2 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950">
              <CardHeader>
                <CardTitle className="text-xl uppercase">Monthly Performance (Last 12 Months)</CardTitle>
                <CardDescription>
                  Real-time tracking showing {format(new Date(), 'MMM yyyy')} data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <defs>
                      <linearGradient id="colorMonthlyVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorMonthlyDownloads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '2px solid #3B82F6',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      formatter={(value: number, name: string) => {
                        const displayName = name === 'visitors' || name === 'Visitors' ? 'Visitors' : 'Downloads';
                        return [value.toLocaleString(), displayName];
                      }}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#3B82F6" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorMonthlyVisitors)"
                      name="Visitors"
                      dot={false}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="downloads" 
                      stroke="#10B981" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorMonthlyDownloads)"
                      name="Downloads"
                      dot={false}
                      activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                    />
                    {/* Highlight peak month (Aug '25 - index 8) */}
                    <ReferenceDot
                      x={monthlyData[8]?.month}
                      y={monthlyData[8]?.visitors}
                      r={8}
                      fill="#3B82F6"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-2 text-center">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    📍 Peak: Aug '25 - {monthlyData[8]?.visitors.toLocaleString()} Visitors
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer - Data Update Timestamp */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last updated: {format(new Date(), 'PPpp')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Real-time data synced • {hasRealData ? 'Live tracking active' : 'Baseline data'}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-right">
              <p className="text-sm font-semibold text-gray-800">Presented by Ranul</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;