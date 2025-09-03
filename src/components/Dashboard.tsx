import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Clock, DollarSign, Zap, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface RunHistory {
  run_id: string;
  status: string;
  created_at: string;
  lead_count: number | null;
  source: string;
  campaign_name: string | null;
}

export function Dashboard() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    hoursSaved: 0,
    moneySaved: 0,
  });
  const [runHistory, setRunHistory] = useState<RunHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data for 'mateusz' client from Supabase
  const fetchClientMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('Client Metrics')
        .select('num_personalized_leads,hours_saved,money_saved')
        .eq('client_name', 'mateusz')
        .maybeSingle();

      if (error) {
        console.error('Error fetching client metrics:', error);
        return;
      }

      if (data) {
        setStats({
          totalMessages: data.num_personalized_leads || 0,
          hoursSaved: data.hours_saved || 0,
          moneySaved: data.money_saved || 0,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  // Fetch run history from Supabase
  const fetchRunHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('AGA Runs progress')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching run history:', error);
        return;
      }

      if (data) {
        setRunHistory(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientMetrics();
    fetchRunHistory();
  }, [fetchClientMetrics, fetchRunHistory]);

  // Set up real-time subscription for run updates
  useEffect(() => {
    const channel = supabase
      .channel('run-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'AGA Runs progress'
        },
        (payload) => {
          console.log('Run update received:', payload);
          fetchRunHistory(); // Refetch all runs when any update occurs
          fetchClientMetrics(); // Also refetch metrics when runs update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRunHistory, fetchClientMetrics]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchClientMetrics(), fetchRunHistory()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchClientMetrics, fetchRunHistory]);


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-warning animate-pulse" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, runId: string) => {
    const variants = {
      completed: 'bg-success/20 text-success-foreground border-success/20',
      processing: 'bg-warning/20 text-warning-foreground border-warning/20',
      failed: 'bg-destructive/20 text-destructive-foreground border-destructive/20'
    };
    
    // Special case for "check instantly campaign" - make it a clickable link
    if (status.toLowerCase() === 'check instantly campaign') {
      return (
        <a
          href={`https://app.instantly.ai/app/campaign/${runId}/leads`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-foreground border border-primary/20 hover:bg-primary/30 transition-colors cursor-pointer"
        >
          Check Instantly Campaign
        </a>
      );
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <p 
                className="framer-text mb-2" 
                style={{
                  fontFamily: '"Clash Display", "Clash Display Placeholder", sans-serif',
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  fontWeight: 700,
                  color: 'var(--extracted-r6o4lv, rgb(171, 82, 197))'
                }}
              >
                13 AI
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track your AI-powered growth acceleration</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-gradient-surface border-border shadow-card metric-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Personalized Messages
              </CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Generated across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-card metric-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Hours Saved
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.hoursSaved.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Using AGA vs manual outreach
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-card metric-card-hover sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Money Saved
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">${stats.moneySaved.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Estimated cost savings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Run History */}
        <Card className="bg-gradient-surface border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5" />
              Run History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {runHistory.map((run) => (
                <div 
                  key={run.run_id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {getStatusIcon(run.status)}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-foreground text-sm sm:text-base">
                          {run.campaign_name || 'Unnamed Campaign'}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {run.lead_count ? run.lead_count.toLocaleString() : '0'} leads
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {formatTimeAgo(new Date(run.created_at))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    {getStatusBadge(run.status, run.run_id)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}