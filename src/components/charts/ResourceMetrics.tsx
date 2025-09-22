import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Activity, Cpu, Database, HardDrive, Network, Server } from 'lucide-react';
import { D3RealtimeAreaChart } from './d3/D3RealtimeAreaChart';
import { D3RealtimeLineChart } from './d3/D3RealtimeLineChart';

export function ResourceMetrics() {
  const { resourceData } = useWebSocket();

  const latestResource = resourceData[resourceData.length - 1];

  // Format CPU usage over time
  const cpuData = resourceData.map(item => ({
    time: item.timestamp,
    usage: parseFloat(item.cpu.usage),
  }));

  // Format memory usage over time
  const memoryData = resourceData.map(item => ({
    time: item.timestamp,
    used: parseFloat(item.memory.used),
    percentage: parseFloat(item.memory.percentage),
  }));

  // Format connection pool data
  const connectionData = resourceData.map(item => ({
    time: item.timestamp,
    active: item.connectionPool.active,
    idle: item.connectionPool.idle,
    waiting: item.connectionPool.waiting,
  }));

  // Format network data
  const networkData = resourceData.map(item => ({
    time: item.timestamp,
    inbound: parseFloat(item.network.inbound),
    outbound: parseFloat(item.network.outbound),
  }));

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">

      {/* Resource Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(parseFloat(latestResource?.cpu.usage || '0'))}`}>
              {latestResource?.cpu.usage || '0'}%
            </div>
            <Progress
              value={parseFloat(latestResource?.cpu.usage || '0')}
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              {latestResource?.cpu.cores || 0} 코어
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">메모리</span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(parseFloat(latestResource?.memory.percentage || '0'))}`}>
              {latestResource?.memory.used || '0'} GB
            </div>
            <Progress
              value={parseFloat(latestResource?.memory.percentage || '0')}
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              {latestResource?.memory.total || 0} GB 중 사용
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">연결 풀</span>
            </div>
            <div className="text-2xl font-bold">
              {latestResource?.connectionPool.active || 0}
            </div>
            <Progress
              value={(latestResource?.connectionPool.active || 0) / (latestResource?.connectionPool.max || 100) * 100}
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              최대 {latestResource?.connectionPool.max || 100} 연결
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Network className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">네트워크</span>
            </div>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>In:</span>
                <span className="font-bold">{latestResource?.network.inbound || '0'} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Out:</span>
                <span className="font-bold">{latestResource?.network.outbound || '0'} Mbps</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* CPU Usage Trend */}
        <Card>
          <CardHeader>
            <CardTitle>CPU 사용률 추이</CardTitle>
            <CardDescription>시간대별 CPU 사용률</CardDescription>
          </CardHeader>
          <CardContent>
            <D3RealtimeAreaChart
              data={cpuData}
              width={500}
              height={300}
              xKey="time"
              yKeys={['usage']}
              colors={['#3b82f6']}
              maxDataPoints={50}
              transitionDuration={300}
            />
          </CardContent>
        </Card>

        {/* Memory Usage Trend */}
        <Card>
          <CardHeader>
            <CardTitle>메모리 사용량</CardTitle>
            <CardDescription>시간대별 메모리 사용량</CardDescription>
          </CardHeader>
          <CardContent>
            <D3RealtimeLineChart
              data={memoryData}
              width={500}
              height={300}
              xKey="time"
              yKey="used"
              color="#8b5cf6"
              maxDataPoints={50}
              transitionDuration={300}
            />
          </CardContent>
        </Card>

        {/* Connection Pool Status */}
        <Card>
          <CardHeader>
            <CardTitle>연결 풀 상태</CardTitle>
            <CardDescription>데이터베이스 연결 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <D3RealtimeAreaChart
              data={connectionData}
              width={500}
              height={300}
              xKey="time"
              yKeys={['active', 'idle', 'waiting']}
              colors={['#10b981', '#f59e0b', '#ef4444']}
              stacked={true}
              maxDataPoints={50}
              transitionDuration={300}
            />
          </CardContent>
        </Card>

        {/* Network Traffic */}
        <Card>
          <CardHeader>
            <CardTitle>네트워크 트래픽</CardTitle>
            <CardDescription>인바운드/아웃바운드 트래픽</CardDescription>
          </CardHeader>
          <CardContent>
            <D3RealtimeLineChart
              data={networkData}
              width={500}
              height={300}
              xKey="time"
              yKey="inbound"
              color="#06b6d4"
              maxDataPoints={50}
              transitionDuration={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Connection Pool Details */}
      <Card>
        <CardHeader>
          <CardTitle>연결 풀 상세 현황</CardTitle>
          <CardDescription>현재 연결 상태 분석</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium">활성 연결</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {latestResource?.connectionPool.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">유휴 연결</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {latestResource?.connectionPool.idle || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-red-600" />
                <span className="font-medium">대기 중</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {latestResource?.connectionPool.waiting || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}