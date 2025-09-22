import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiClient } from '@/lib/api-client';
import { CheckCircle, TrendingDown, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ApiUsageData {
  timestamp: Date;
  period: string;
  topEndpoints: Array<{
    endpoint: string;
    calls: number;
    avgTime: number;
    errorRate: number;
  }>;
  totalCalls: number;
}

const SLA_STATUS_COLORS = {
  healthy: '#10b981',
  degraded: '#f59e0b',
  critical: '#ef4444',
};

export function BusinessMetrics() {
  const { slaData } = useWebSocket();
  const [apiUsageData, setApiUsageData] = useState<ApiUsageData | null>(null);

  useEffect(() => {
    // Fetch API usage data
    const fetchApiUsage = async () => {
      try {
        const response = await apiClient.get('/api/banking/api-usage');
        setApiUsageData(response.data);
      } catch (error) {
        console.error('Failed to fetch API usage data:', error);
      }
    };

    fetchApiUsage();
    const interval = setInterval(fetchApiUsage, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <TrendingDown className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (availability: string, target: number) => {
    const avail = parseFloat(availability);
    if (avail >= target) return 'text-green-600';
    if (avail >= target - 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format API usage data for chart
  const apiUsageChartData = apiUsageData?.topEndpoints.map(endpoint => ({
    name: endpoint.endpoint.replace('/api/', ''),
    calls: endpoint.calls,
    avgTime: endpoint.avgTime,
    errorRate: endpoint.errorRate,
  })) || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">비즈니스 메트릭 및 SLA</h2>

      {/* SLA Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">전체 가용성</span>
              {getStatusIcon(slaData?.overall.status || 'unknown')}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(slaData?.overall.availability || '0', slaData?.overall.targetAvailability || 99.95)}`}>
              {slaData?.overall.availability || '0'}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              목표: {slaData?.overall.targetAvailability || 99.95}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">월간 요청</span>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {((slaData?.monthlyStats.totalRequests || 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-gray-600 mt-1">
              성공률: {(((slaData?.monthlyStats.successfulRequests || 0) / (slaData?.monthlyStats.totalRequests || 1)) * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">다운타임</span>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {slaData?.monthlyStats.totalDowntime || 0}분
            </div>
            <p className="text-xs text-gray-600 mt-1">
              이번 달 누적
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">인시던트</span>
            </div>
            <div className="text-2xl font-bold">
              {slaData?.monthlyStats.incidentCount || 0}건
            </div>
            <p className="text-xs text-gray-600 mt-1">
              이번 달 발생
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* API Usage Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>API 사용량 순위 (Top 10)</CardTitle>
            <CardDescription>24시간 기준 가장 많이 호출된 API</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={apiUsageChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6">
                  {apiUsageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#3b82f6' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service SLA Status */}
        <Card>
          <CardHeader>
            <CardTitle>서비스별 SLA 준수율</CardTitle>
            <CardDescription>각 서비스의 가용성 및 응답 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaData?.services?.map((service: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${service.status === 'healthy' ? 'green' : service.status === 'degraded' ? 'yellow' : 'red'}-500`} />
                      <span className="font-medium text-sm">{service.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${service.compliance ? 'text-green-600' : 'text-red-600'}`}>
                      {service.compliance ? 'SLA 준수' : 'SLA 위반'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">가용성:</span>
                      <span className={`ml-1 font-medium ${getStatusColor(service.availability, 99.5)}`}>
                        {service.availability}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">응답시간:</span>
                      <span className={`ml-1 font-medium ${service.avgResponseTime <= service.targetResponseTime ? 'text-green-600' : 'text-red-600'}`}>
                        {service.avgResponseTime}ms
                      </span>
                      <span className="text-gray-500"> / {service.targetResponseTime}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>API 성능 메트릭</CardTitle>
            <CardDescription>평균 응답 시간 및 에러율</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={apiUsageChartData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="평균 응답시간(ms)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="에러율(%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total API Calls Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>API 호출 분포</CardTitle>
            <CardDescription>전체 API 호출량 대비 비율</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apiUsageChartData.slice(0, 5).map((api, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{api.name}</span>
                    <span className="text-sm font-medium">
                      {((api.calls / (apiUsageData?.totalCalls || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(api.calls / (apiUsageData?.totalCalls || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>SLA 리포트 요약</CardTitle>
          <CardDescription>월간 SLA 준수 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">주요 지표</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 요청 수</span>
                  <span className="text-sm font-medium">
                    {(slaData?.monthlyStats.totalRequests || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">성공 요청</span>
                  <span className="text-sm font-medium">
                    {(slaData?.monthlyStats.successfulRequests || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">평균 가용성</span>
                  <span className="text-sm font-medium">
                    {slaData?.overall.availability || '0'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 다운타임</span>
                  <span className="text-sm font-medium">
                    {slaData?.monthlyStats.totalDowntime || 0}분
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">SLA 준수 상태</h3>
              <div className="space-y-2">
                {slaData?.services?.slice(0, 4).map((service: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{service.name}</span>
                    <div className="flex items-center gap-2">
                      {service.compliance ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${service.compliance ? 'text-green-600' : 'text-red-600'}`}>
                        {service.compliance ? '준수' : '위반'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}