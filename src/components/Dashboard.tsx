import { useState, useEffect } from 'react';
import { BarChart3, Clock, DollarSign, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  submissionData?: any;
}

interface RunHistory {
  id: string;
  status: 'completed' | 'processing' | 'failed';
  timestamp: Date;
  leadCount: number;
  source: string;
}

export function Dashboard({ submissionData }: DashboardProps) {
  const [stats, setStats] = useState({
    totalMessages: 12847,
    hoursSaved: 384,
    moneySaved: 19234,
  });

  const [runHistory, setRunHistory] = useState<RunHistory[]>([
    {
      id: '1',
      status: 'completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      leadCount: 1500,
      source: 'Apollo URL'
    },
    {
      id: '2',
      status: 'processing',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      leadCount: 800,
      source: 'CSV Upload'
    },
    {
      id: '3',
      status: 'completed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      leadCount: 2200,
      source: 'Apollo URL'
    },
    {
      id: '4',
      status: 'failed',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      leadCount: 500,
      source: 'CSV Upload'
    }
  ]);

  useEffect(() => {
    if (submissionData) {
      // Add new run to history
      const newRun: RunHistory = {
        id: Date.now().toString(),
        status: 'processing',
        timestamp: new Date(),
        leadCount: submissionData.leadCount || 0,
        source: submissionData.leadSource === 'apollo' ? 'Apollo URL' : 'CSV Upload'
      };
      
      setRunHistory(prev => [newRun, ...prev]);
      
      // Update stats (simulate incremental growth)
      setStats(prev => ({
        totalMessages: prev.totalMessages + (submissionData.leadCount || 0),
        hoursSaved: prev.hoursSaved + Math.floor((submissionData.leadCount || 0) / 10),
        moneySaved: prev.moneySaved + Math.floor((submissionData.leadCount || 0) * 2.5)
      }));
    }
  }, [submissionData]);

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

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-success/20 text-success-foreground border-success/20',
      processing: 'bg-warning/20 text-warning-foreground border-warning/20',
      failed: 'bg-destructive/20 text-destructive-foreground border-destructive/20'
    };
    
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p 
                className="framer-text mb-2" 
                style={{
                  fontFamily: '"Clash Display", "Clash Display Placeholder", sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--extracted-r6o4lv, rgb(171, 82, 197))'
                }}
              >
                13 AI
              </p>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">Track your AI-powered growth acceleration</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-surface border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Personalized Messages
              </CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Generated across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hours Saved
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.hoursSaved.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Using AGA vs manual outreach
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Money Saved
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${stats.moneySaved.toLocaleString()}</div>
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
            <div className="space-y-4">
              {runHistory.map((run) => (
                <div 
                  key={run.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(run.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {run.leadCount.toLocaleString()} leads
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{run.source}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimeAgo(run.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(run.status)}
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