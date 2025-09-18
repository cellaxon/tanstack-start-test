import React, { useState } from 'react';
import { SimpleLineChart } from './simple-line-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  useSystemMetrics,
  useCurrentMetrics,
  useMetricsStats,
  formatBytes,
  formatSpeed,
  type TimeRange
} from '@/hooks/useSystemMetrics';
import { Cpu, MemoryStick, HardDrive, Network, TrendingUp, TrendingDown } from 'lucide-react';

export function SystemMetricsChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const metricsQuery = useSystemMetrics(timeRange);
  const currentQuery = useCurrentMetrics();
  const statsQuery = useMetricsStats(timeRange);

  const timeRangeOptions = [
    { value: '1m', label: 'Last 1 minute' },
    { value: '5m', label: 'Last 5 minutes' },
    { value: '1h', label: 'Last 1 hour' },
    { value: '1d', label: 'Last 24 hours' },
    { value: '1w', label: 'Last 7 days' },
    { value: '1M', label: 'Last 30 days' },
    { value: '1y', label: 'Last year' },
  ];

  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '1m' || timeRange === '5m') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } else if (timeRange === '1h') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '1d') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '1w') {
      return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}시`;
    } else if (timeRange === '1M') {
      return `${date.getMonth()+1}/${date.getDate()}`;
    } else {
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  };

  // Sort data by timestamp (oldest first for proper chart display)
  const sortedData = [...(metricsQuery.data || [])].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Metrics</h2>
        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentQuery.data?.cpu_usage?.toFixed(1) || 0}%
            </div>
            {statsQuery.data && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Avg: {statsQuery.data.avg_cpu.toFixed(1)}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Max: {statsQuery.data.max_cpu.toFixed(1)}%
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentQuery.data?.memory_usage?.toFixed(1) || 0}%
            </div>
            {currentQuery.data && (
              <p className="text-xs text-muted-foreground">
                {formatBytes(currentQuery.data.memory_total - currentQuery.data.memory_free)} /
                {formatBytes(currentQuery.data.memory_total)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-sm">{formatSpeed(currentQuery.data?.network_tx || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-blue-500" />
                <span className="text-sm">{formatSpeed(currentQuery.data?.network_rx || 0)}</span>
              </div>
            </div>
            {statsQuery.data && (
              <p className="text-xs text-muted-foreground mt-1">
                Total: ↑{formatBytes(statsQuery.data.total_network_tx)} ↓{formatBytes(statsQuery.data.total_network_rx)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentQuery.data?.disk_usage?.toFixed(1) || 0}%
            </div>
            {currentQuery.data && currentQuery.data.disk_total > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatBytes(currentQuery.data.disk_total * (currentQuery.data.disk_usage / 100))} /
                {formatBytes(currentQuery.data.disk_total)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedData && sortedData.length > 0 ? (
              <SimpleLineChart
                data={sortedData.map(m => ({
                  label: formatTimeLabel(m.timestamp),
                  value: Number(m.cpu_usage.toFixed(2)),
                }))}
                label="CPU Usage (%)"
                color="#3b82f6"
                height={250}
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {metricsQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedData && sortedData.length > 0 ? (
              <SimpleLineChart
                data={sortedData.map(m => ({
                  label: formatTimeLabel(m.timestamp),
                  value: Number(m.memory_usage.toFixed(2)),
                }))}
                label="Memory Usage (%)"
                color="#10b981"
                height={250}
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {metricsQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedData && sortedData.length > 0 ? (
              <div className="h-[250px]">
                <SimpleLineChart
                  data={sortedData.map(m => ({
                    label: formatTimeLabel(m.timestamp),
                    value: m.network_rx / 1024, // Convert to KB
                    value2: m.network_tx / 1024,
                  }))}
                  label="Network RX (KB)"
                  label2="Network TX (KB)"
                  color="#6366f1"
                  color2="#f59e0b"
                  height={250}
                />
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {metricsQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disk Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedData && sortedData.length > 0 ? (
              <SimpleLineChart
                data={sortedData.map(m => ({
                  label: formatTimeLabel(m.timestamp),
                  value: Number(m.disk_usage.toFixed(2)),
                }))}
                label="Disk Usage (%)"
                color="#f43f5e"
                height={250}
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {metricsQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}