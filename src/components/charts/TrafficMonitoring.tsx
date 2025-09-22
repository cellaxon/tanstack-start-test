import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TrafficMonitoring() {
  const { trafficData, isConnected } = useWebSocket();

  // Format data for RPS/TPS chart
  const rpsTPSData = trafficData.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">실시간 트래픽 모니터링</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-sm text-gray-600">
            {isConnected ? '실시간 연결됨' : '연결 끊김'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* RPS/TPS Chart */}
        <Card>
          <CardHeader>
            <CardTitle>요청 처리량 (Throughput)</CardTitle>
            <CardDescription>초당 요청 수 (RPS) / 초당 트랜잭션 수 (TPS)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rpsTPSData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="RPS" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TPS" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>응답 시간 분포</CardTitle>
            <CardDescription>백분위수별 응답 시간 (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {responseTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trafficData.map(item => ({
                time: new Date(item.timestamp).toLocaleTimeString(),
                connections: item.activeConnections,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="connections" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Top API 엔드포인트</CardTitle>
            <CardDescription>가장 많이 호출되는 API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topEndpoints.map((endpoint: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{endpoint.endpoint}</div>
                    <div className="text-xs text-gray-600">
                      {endpoint.requests} 요청 • 평균 {endpoint.avgResponseTime}ms
                    </div>
                  </div>
                  <div className="w-32">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
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