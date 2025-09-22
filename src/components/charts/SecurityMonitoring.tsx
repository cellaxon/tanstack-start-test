import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AlertTriangle, Lock, Shield, ShieldAlert, ShieldOff, UserX } from 'lucide-react';
import {
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

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function SecurityMonitoring() {
  const { securityData } = useWebSocket();

  const latestSecurity = securityData[securityData.length - 1];

  // Format rate limiting data for pie chart
  const rateLimitingData = latestSecurity ? [
    { name: '통과', value: latestSecurity.rateLimiting.passed, color: '#10b981' },
    { name: '제한', value: latestSecurity.rateLimiting.throttled, color: '#f59e0b' },
    { name: '차단', value: latestSecurity.rateLimiting.blocked, color: '#ef4444' },
  ] : [];

  // Format authentication data
  const authData = securityData.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    successful: item.authentication.successful,
    failed: item.authentication.failed,
    failureRate: parseFloat(item.authentication.failureRate),
  }));

  // Format suspicious activity data
  const suspiciousData = latestSecurity ? [
    { type: 'Brute Force', attempts: latestSecurity.suspiciousActivity.bruteForceAttempts },
    { type: 'SQL Injection', attempts: latestSecurity.suspiciousActivity.sqlInjectionAttempts },
    { type: 'XSS', attempts: latestSecurity.suspiciousActivity.xssAttempts },
  ] : [];

  const getThreatLevel = () => {
    if (!latestSecurity) return { level: 'Unknown', color: 'gray' };
    const totalSuspicious = Object.values(latestSecurity.suspiciousActivity).reduce((a: any, b: any) => a + b, 0) as number;
    if (totalSuspicious === 0) return { level: '안전', color: 'green' };
    if (totalSuspicious < 10) return { level: '주의', color: 'yellow' };
    if (totalSuspicious < 20) return { level: '경고', color: 'orange' };
    return { level: '위험', color: 'red' };
  };

  const threatLevel = getThreatLevel();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">보안 모니터링</h2>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className={`h-5 w-5 text-${threatLevel.color}-600`} />
              <span className="text-sm font-medium">보안 위협 수준</span>
            </div>
            <div className={`text-2xl font-bold text-${threatLevel.color}-600`}>
              {threatLevel.level}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              총 {Object.values(latestSecurity?.suspiciousActivity || {}).reduce((a: any, b: any) => a + b, 0)} 건의 의심 활동
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">인증 실패율</span>
            </div>
            <div className="text-2xl font-bold">
              {latestSecurity?.authentication.failureRate || '0'}%
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {latestSecurity?.authentication.failed || 0} / {(latestSecurity?.authentication.successful || 0) + (latestSecurity?.authentication.failed || 0)} 시도
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShieldOff className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">차단된 요청</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {latestSecurity?.rateLimiting.blocked || 0}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Rate Limiting 위반
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <UserX className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">차단된 IP</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {latestSecurity?.blockedIPs?.length || 0}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              활성 차단 목록
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Rate Limiting Status */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Limiting 현황</CardTitle>
            <CardDescription>요청 제한 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rateLimitingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rateLimitingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Authentication Failure Trend */}
        <Card>
          <CardHeader>
            <CardTitle>인증 실패율 추이</CardTitle>
            <CardDescription>시간대별 인증 시도 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={authData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="successful"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="성공"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="failed"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="실패"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="failureRate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="실패율(%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suspicious Activity */}
        <Card>
          <CardHeader>
            <CardTitle>의심스러운 활동</CardTitle>
            <CardDescription>보안 위협 탐지 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={suspiciousData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#ef4444">
                  {suspiciousData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Blocked IPs Table */}
        <Card>
          <CardHeader>
            <CardTitle>차단된 IP 목록</CardTitle>
            <CardDescription>최근 차단된 IP 주소</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latestSecurity?.blockedIPs?.map((blocked: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-mono text-sm font-medium">{blocked.ip}</div>
                      <div className="text-xs text-gray-600">
                        {blocked.attempts} 시도 • 최종: {new Date(blocked.lastAttempt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
                    차단 해제
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alert Summary */}
      <Card>
        <CardHeader>
          <CardTitle>보안 알림 요약</CardTitle>
          <CardDescription>실시간 보안 이벤트 모니터링</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Brute Force 시도</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {latestSecurity?.suspiciousActivity.bruteForceAttempts || 0}
              </p>
              <p className="text-xs text-yellow-700 mt-1">지난 5분간 탐지</p>
            </div>

            <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">SQL Injection 시도</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {latestSecurity?.suspiciousActivity.sqlInjectionAttempts || 0}
              </p>
              <p className="text-xs text-orange-700 mt-1">지난 5분간 탐지</p>
            </div>

            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">XSS 시도</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {latestSecurity?.suspiciousActivity.xssAttempts || 0}
              </p>
              <p className="text-xs text-red-700 mt-1">지난 5분간 탐지</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}