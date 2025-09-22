import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
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

const STATUS_COLORS = {
  '2xx': '#10b981',
  '3xx': '#3b82f6',
  '4xx': '#f59e0b',
  '5xx': '#ef4444',
};

export function ErrorTracking() {
  const { errorData } = useWebSocket();

  const latestError = errorData[errorData.length - 1];

  // Format error rate over time
  const errorRateData = errorData.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    errorRate: parseFloat(item.errorRate),
    totalErrors: item.totalErrors,
  }));

  // Format status code distribution for pie chart
  const statusCodeData = latestError ? Object.entries(latestError.statusCodes).map(([code, count]) => ({
    name: code,
    value: count as number,
    color: STATUS_COLORS[code as keyof typeof STATUS_COLORS],
  })) : [];

  // Calculate total requests
  const totalRequests = statusCodeData.reduce((sum, item) => sum + item.value, 0);

  // Format errors by endpoint
  const errorsByEndpoint = latestError?.errorsByEndpoint || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">가용성 및 에러 추적</h2>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 에러율</p>
                <p className="text-2xl font-bold">
                  {latestError?.errorRate || '0.00'}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${parseFloat(latestError?.errorRate || '0') > 2 ? 'bg-red-100' : 'bg-green-100'}`}>
                {parseFloat(latestError?.errorRate || '0') > 2 ? (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">5xx 에러</p>
                <p className="text-2xl font-bold text-red-600">
                  {latestError?.statusCodes['5xx'] || 0}
                </p>
              </div>
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">가용성</p>
                <p className="text-2xl font-bold text-green-600">
                  {((1 - parseFloat(latestError?.errorRate || '0') / 100) * 100).toFixed(2)}%
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 요청</p>
                <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Error Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>에러율 추이</CardTitle>
            <CardDescription>시간대별 에러율 변화</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* HTTP Status Code Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>HTTP 상태 코드 분포</CardTitle>
            <CardDescription>응답 코드별 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusCodeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusCodeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total Errors Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>에러 발생 건수</CardTitle>
            <CardDescription>시간대별 에러 발생 건수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalErrors" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Errors by Endpoint */}
        <Card>
          <CardHeader>
            <CardTitle>엔드포인트별 에러</CardTitle>
            <CardDescription>API별 에러 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorsByEndpoint.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.endpoint}</div>
                    <div className="text-xs text-gray-600">에러 타입: {item.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{item.errors}</div>
                    <div className="text-xs text-gray-600">에러</div>
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