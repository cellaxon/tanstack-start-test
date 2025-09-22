import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';
import { D3RealtimeLineChart } from './d3/D3RealtimeLineChart';
import { D3RealtimeBarChart } from './d3/D3RealtimeBarChart';
import { D3RealtimeAreaChart } from './d3/D3RealtimeAreaChart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TrafficMonitoring() {
  const { trafficData, isConnected } = useWebSocket();

  // Format data for RPS/TPS chart
  const rpsTPSData = trafficData.map(item => ({
    time: item.timestamp,
    RPS: item.rps,
    TPS: item.tps,
  }));

  // Get latest response time distribution
  const latestTraffic = trafficData[trafficData.length - 1];
  const responseTimeData = latestTraffic ? [
    { name: 'P50', value: latestTraffic.responseTime.p50, label: `${latestTraffic.responseTime.p50}ms` },
    { name: 'P95', value: latestTraffic.responseTime.p95, label: `${latestTraffic.responseTime.p95}ms` },
    { name: 'P99', value: latestTraffic.responseTime.p99, label: `${latestTraffic.responseTime.p99}ms` },
  ] : [];

  // Get top endpoints data
  const topEndpoints = latestTraffic?.topEndpoints || [];

  return (
    <div className="space-y-4">

      <div className="grid gap-4 md:grid-cols-2">
        {/* RPS/TPS Chart */}
        <Card>
          <CardHeader>
            <CardTitle>요청 처리량 (Throughput)</CardTitle>
            <CardDescription>초당 요청 수 (RPS) / 초당 트랜잭션 수 (TPS)</CardDescription>
          </CardHeader>
          <CardContent>
            <D3RealtimeLineChart
              data={rpsTPSData}
              height={300}
              xKey="time"
              yKey="RPS"
              color="#8884d8"
              maxDataPoints={50}
              transitionDuration={0}
              showGrid={true}
              showDots={true}
              maintainYScale={true}
              minY={0}
            />
          </CardContent>
        </Card>

        {/* Response Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>응답 시간 분포</CardTitle>
            <CardDescription>백분위수별 응답 시간 (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <D3RealtimeBarChart
              data={responseTimeData}
              height={300}
              xKey="name"
              yKey="value"
              color={COLORS}
              maxDataPoints={10}
              transitionDuration={500}
              maintainYScale={true}
            />
          </CardContent>
        </Card>

        {/* Active Connections */}
        <Card>
          <CardHeader>
            <CardTitle>활성 연결 수</CardTitle>
            <CardDescription>현재 활성 연결 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {latestTraffic?.activeConnections || 0}
              </div>
              <p className="text-sm text-gray-600 mt-2">활성 연결</p>
            </div>
            <D3RealtimeAreaChart
              data={trafficData.map(item => ({
                time: item.timestamp,
                connections: item.activeConnections,
              }))}
              height={200}
              xKey="time"
              yKeys={['connections']}
              colors={['#8884d8']}
              maxDataPoints={50}
              transitionDuration={300}
              showDots={true}
            />
          </CardContent>
        </Card>

        {/* Top API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Top API 엔드포인트</CardTitle>
            <CardDescription>가장 많이 호출되는 API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEndpoints.map((endpoint: { endpoint: string; requests: number; avgResponseTime: number }) => (
                <div key={endpoint.endpoint} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{endpoint.endpoint}</div>
                    <div className="text-xs text-gray-600">
                      {endpoint.requests} 요청 • 평균 {endpoint.avgResponseTime}ms
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(endpoint.requests / (topEndpoints[0]?.requests || 1)) * 100}%` }}
                      />
                    </div>
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