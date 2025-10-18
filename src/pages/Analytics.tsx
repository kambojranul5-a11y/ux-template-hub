import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Download, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DownloadStats {
  totalDownloads: number;
  downloadsByTemplate: { templateId: string; templateTitle: string; count: number }[];
  recentDownloads: { templateId: string; downloadedAt: string }[];
}

const templateTitles: Record<string, string> = {
  "1": "User Interview Guide",
  "2": "Usability Testing Protocol",
  "3": "Persona Development Template",
  "4": "Journey Mapping Framework",
  "5": "Research Findings Report",
  "6": "Survey Design Template",
};

const Analytics = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DownloadStats>({
    totalDownloads: 0,
    downloadsByTemplate: [],
    recentDownloads: [],
  });
  const [loading, setLoading] = useState(true);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchDownloadStats = async () => {
      try {
        const { data, error } = await supabase
          .from('template_downloads')
          .select('template_id, downloaded_at')
          .order('downloaded_at', { ascending: false });

        if (error) throw error;

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
      } catch (error) {
        console.error('Error fetching download stats:', error);
      } finally {
        setLoading(false);
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
        () => {
          fetchDownloadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const maxDownloads = Math.max(...stats.downloadsByTemplate.map(t => t.count), 1);

  if (authLoading || (!isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section py-16 border-b-4 border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart className="h-12 w-12" />
              <h1 className="text-4xl sm:text-5xl font-bold">DOWNLOAD ANALYTICS</h1>
            </div>
            <p className="text-lg opacity-90">
              Track template downloads in real-time
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Overview Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="h-6 w-6" />
                  OVERVIEW
                </CardTitle>
                <CardDescription>Total downloads across all templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">
                  {loading ? "..." : stats.totalDownloads.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-2 uppercase text-sm">
                  Total Downloads
                </p>
              </CardContent>
            </Card>

            {/* Downloads by Template */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Download className="h-6 w-6" />
                  DOWNLOADS BY TEMPLATE
                </CardTitle>
                <CardDescription>See which templates are most popular</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : stats.downloadsByTemplate.length > 0 ? (
                  <div className="space-y-4">
                    {stats.downloadsByTemplate.map((template) => (
                      <div key={template.templateId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium uppercase text-sm">
                            {template.templateTitle}
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {template.count}
                          </span>
                        </div>
                        <div className="h-3 bg-muted border-2 border-border overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{
                              width: `${(template.count / maxDownloads) * 100}%`,
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

            {/* Recent Downloads */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl uppercase">Recent Activity</CardTitle>
                <CardDescription>Latest template downloads</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : stats.recentDownloads.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentDownloads.map((download, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border-2 border-border"
                      >
                        <span className="font-medium uppercase text-sm">
                          {templateTitles[download.templateId] || `Template ${download.templateId}`}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(download.downloadedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No downloads yet</p>
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
