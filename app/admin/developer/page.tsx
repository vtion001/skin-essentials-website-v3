'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { fetchSystemHealth, fetchSystemLogs, triggerTestError, simulateClientError, testSlack, simulateActivity } from '@/app/actions/developer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Server, Database, AlertTriangle, RefreshCw, Terminal, Search, CheckCircle, XCircle, Bug, Zap, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function DeveloperHub() {
  const [isPending, startTransition] = useTransition();
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [logType, setLogType] = useState<'error' | 'audit' | 'activity'>('error');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [healthData, logsData] = await Promise.all([
        fetchSystemHealth(),
        fetchSystemLogs(logType, search)
      ]);
      
      startTransition(() => {
        setHealth(healthData);
        setLogs(logsData.data || []);
        setLastUpdated(new Date().toLocaleTimeString());
      });
    } catch (e) {
      toast.error('Failed to update system status');
    } finally {
      setLoading(false);
    }
  }, [logType, search]);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString()); // Set initial client-side date
    loadData();
    // Auto-refresh every 30s
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleTestError = async () => {
    toast.promise(triggerTestError(), {
      loading: 'Triggering test error...',
      success: 'Error triggered! Check logs.',
      error: 'Failed to trigger error'
    });
    // Wait a bit for the log to write
    setTimeout(loadData, 2000);
  };

  const handleSimulateClient = async () => {
    toast.promise(simulateClientError(), {
      loading: 'Simulating client error...',
      success: 'Client error reported! Check logs.',
      error: 'Failed to simulate client error'
    });
    setTimeout(loadData, 2000);
  };

  const handleTestSlack = async () => {
    toast.promise(testSlack(), {
      loading: 'Sending Slack test...',
      success: 'Check your Slack channel!',
      error: 'Failed to send Slack alert'
    });
  };

  const handleSimulateActivity = async () => {
    toast.promise(simulateActivity(), {
      loading: 'Simulating user activity...',
      success: 'Activity logged! Switch to "Live Activity" tab.',
      error: 'Failed to simulate activity'
    });
    setTimeout(loadData, 1000);
  };

  const StatusDot = ({ status }: { status: string }) => (
    <div className={`w-3 h-3 rounded-full ${status === 'healthy' || status === 'SUCCESS' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Terminal className="w-8 h-8 text-purple-600" />
            Developer Operations Center
          </h1>
          <p className="text-slate-500 mt-2">Centralized monitoring and issue tracking for Skin Essentials.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleTestSlack}>
            <Terminal className="w-4 h-4 mr-2" />
            Test Slack
          </Button>
          <Button variant="secondary" onClick={handleSimulateActivity}>
            <Zap className="w-4 h-4 mr-2" />
            Simulate Activity
          </Button>
          <Button variant="secondary" onClick={handleSimulateClient}>
            <Activity className="w-4 h-4 mr-2" />
            Simulate Client
          </Button>
          <Button variant="destructive" onClick={handleTestError}>
            <Bug className="w-4 h-4 mr-2" />
            Trigger Test Error
          </Button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">System Status</CardTitle>
            <Activity className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {health ? (
                <>
                  <StatusDot status={health.status} />
                  {health.status === 'healthy' ? 'Operational' : 'Degraded'}
                </>
              ) : 'Checking...'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Uptime: {health?.system?.uptime ? Math.round(health.system.uptime / 60) + 'm' : '--'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Database</CardTitle>
            <Database className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {health?.services?.database?.status === 'healthy' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {health?.services?.database?.latency || '--'} latency
            </div>
            <p className="text-xs text-slate-500 mt-1">Connection Pool: Active</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Resources</CardTitle>
            <Server className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.system?.memory?.rss || '--'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Memory Usage (RSS)</p>
          </CardContent>
        </Card>
      </div>

                  {/* Main Content Tabs */}

                  <Tabs value={logType} onValueChange={(v: any) => {

                    startTransition(() => {

                      setLogType(v);

                    });

                  }} className="w-full">

              <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">

                <TabsTrigger value="logs">Error Logs</TabsTrigger>

                <TabsTrigger value="activity">Live Activity</TabsTrigger>

                <TabsTrigger value="audit">Audit Trail</TabsTrigger>

              </TabsList>

      

              <div className="flex items-center gap-4 my-4">

                <div className="relative flex-1 max-w-sm">

                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />

                  <Input

                    placeholder="Search logs..."

                    className="pl-9"

                    value={search}

                    onChange={(e) => setSearch(e.target.value)}

                    onKeyDown={(e) => e.key === 'Enter' && loadData()}

                  />

                </div>

                <div className="text-xs text-slate-400">

                  Last updated: {lastUpdated || '...'}

                </div>

              </div>

      

              <TabsContent value="logs" className="space-y-4">

                <Card>

                  <CardHeader>

                    <CardTitle>Application Logs</CardTitle>

                    <CardDescription>Real-time error tracking and runtime events.</CardDescription>

                  </CardHeader>

                  <CardContent>

                    <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-950 p-4 font-mono text-sm text-slate-300">

                      {logs.length === 0 ? (

                        <div className="text-slate-500 text-center py-20">No logs found matching your criteria.</div>

                      ) : (

                        logs.map((log) => (

                          <div key={log.id} className="mb-4 border-b border-slate-800 pb-2 last:border-0 hover:bg-slate-900/50 p-2 rounded transition-colors group">

                            <div className="flex items-center gap-3 mb-1">

                              <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${

                                log.level === 'ERROR' ? 'bg-red-900/50 text-red-400' : 

                                log.level === 'WARN' ? 'bg-yellow-900/50 text-yellow-400' :

                                'bg-blue-900/50 text-blue-400'

                              }`}>

                                {log.level}

                              </span>

                              <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</span>

                              <span className="text-slate-400 font-semibold">[{log.source}]</span>

                            </div>

                            <div className="pl-2 border-l-2 border-slate-800">

                              <p className="text-slate-100 whitespace-pre-wrap break-all">{log.message}</p>

                              {log.metadata?.stack && (

                                <details className="mt-2">

                                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300">Show Stack Trace</summary>

                                  <pre className="mt-2 text-[10px] text-red-300/70 overflow-x-auto p-2 bg-slate-900 rounded">

                                    {log.metadata.stack}

                                  </pre>

                                </details>

                              )}

                            </div>

                          </div>

                        ))

                      )}

                    </ScrollArea>

                  </CardContent>

                </Card>

              </TabsContent>

      

              <TabsContent value="activity" className="space-y-4">

                <Card>

                  <CardHeader>

                    <CardTitle>User Activity Pulse</CardTitle>

                    <CardDescription>Real-time feed of non-sensitive user interactions and navigation.</CardDescription>

                  </CardHeader>

                  <CardContent>

                    <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-950 p-4 font-mono text-sm text-slate-300">

                      {logs.length === 0 ? (

                        <div className="text-slate-500 text-center py-20">No activity recorded yet. Try the simulate button above!</div>

                      ) : (

                        logs.map((log) => (

                          <div key={log.id} className="mb-4 border-b border-slate-800 pb-2 last:border-0 hover:bg-slate-900/50 p-2 rounded transition-colors group">

                            <div className="flex items-center gap-3 mb-1">

                              <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-green-900/50 text-green-400">

                                {log.level}

                              </span>

                              <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</span>

                              <span className="text-slate-400 font-semibold">[{log.source}]</span>

                            </div>

                            <div className="pl-2 border-l-2 border-slate-800">

                              <p className="text-slate-100 uppercase tracking-tighter text-xs font-bold">{log.message}</p>

                              {log.metadata?.details && (

                                <pre className="mt-2 text-[10px] text-blue-300/70 overflow-x-auto p-2 bg-slate-900 rounded">

                                  {JSON.stringify(log.metadata.details, null, 2)}

                                </pre>

                              )}

                            </div>

                          </div>

                        ))

                      )}

                    </ScrollArea>

                  </CardContent>

                </Card>

              </TabsContent>

      

              <TabsContent value="audit" className="space-y-4">

                 <Card>

                  <CardHeader>

                    <CardTitle>Compliance Audit Trail</CardTitle>

                    <CardDescription>Secure log of system access, record deletions, and PHI modifications.</CardDescription>

                  </CardHeader>

                  <CardContent>

                    <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-950 p-4 font-mono text-sm text-slate-300">

                      {logs.length === 0 ? (

                        <div className="text-slate-500 text-center py-20">No audit logs found.</div>

                      ) : (

                        logs.map((log) => (

                          <div key={log.id} className="mb-4 border-b border-slate-800 pb-2 last:border-0 hover:bg-slate-900/50 p-2 rounded transition-colors group">

                            <div className="flex items-center gap-3 mb-1">

                              <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${

                                log.level === 'SUCCESS' ? 'bg-blue-900/50 text-blue-400' : 'bg-red-900/50 text-red-400'

                              }`}>

                                {log.level}

                              </span>

                              <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</span>

                              <span className="text-slate-400 font-semibold">[{log.source}]</span>

                            </div>

                            <div className="pl-2 border-l-2 border-slate-800">

                              <p className="text-slate-100">{log.message}</p>

                              <div className="mt-2 flex gap-4 text-[10px] text-slate-500">

                                <span>User: {log.metadata?.user_id || 'System'}</span>

                                <span>IP: {log.metadata?.ip || 'N/A'}</span>

                              </div>

                            </div>

                          </div>

                        ))

                      )}

                    </ScrollArea>

                  </CardContent>

                </Card>

              </TabsContent>
      </Tabs>
    </div>
  );
}
