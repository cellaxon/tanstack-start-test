import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Globe, Monitor, Smartphone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface GeographicData {
  timestamp: Date;
  regions: Array<{
    region: string;
    lat: number;
    lng: number;
    requests: number;
    latency: number;
    errorRate: string;
  }>;
}

interface ClientTypeData {
  timestamp: Date;
  distribution: Array<{
    type: string;
    percentage: number;
    requests: number;
  }>;
  userAgents: {
    browsers: { [key: string]: number };
    os: { [key: string]: number };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function GeographicAnalysis() {
  const [geoData, setGeoData] = useState<GeographicData | null>(null);
  const [clientData, setClientData] = useState<ClientTypeData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [geoResponse, clientResponse] = await Promise.all([
          apiClient.get('/api/banking/geographic'),
          apiClient.get('/api/banking/client-distribution'),
        ]);
        setGeoData(geoResponse.data);
        setClientData(clientResponse.data);
      } catch (error) {
        console.error('Failed to fetch geographic data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Sort regions by requests for the table
  const sortedRegions = geoData?.regions.sort((a, b) => b.requests - a.requests) || [];

  // Format browser data for chart
  const browserData = clientData?.userAgents.browsers
    ? Object.entries(clientData.userAgents.browsers).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  // Format OS data for chart
  const osData = clientData?.userAgents.os
    ? Object.entries(clientData.userAgents.os).map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
      }))
    : [];

  const getLatencyColor = (latency: number) => {
    if (latency < 30) return 'text-green-600';
    if (latency < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorRateColor = (rate: string) => {
    const rateNum = parseFloat(rate);
    if (rateNum < 1) return 'text-green-600';
    if (rateNum < 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">지리적 분포 및 클라이언트 분석</h2>

      {/* Geographic Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>지역별 요청 분포</CardTitle>
            <CardDescription>주요 도시별 API 요청 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Map visualization area - showing table instead */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-3">지역별 트래픽 현황</h3>
                <div className="space-y-2">
                  {sortedRegions.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{region.region}</div>
                          <div className="text-xs text-gray-600">
                            {region.requests.toLocaleString()} 요청
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getLatencyColor(region.latency)}`}>
                          {region.latency}ms
                        </div>
                        <div className={`text-xs ${getErrorRateColor(region.errorRate)}`}>
                          에러: {region.errorRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regional traffic chart */}
              <div>
                <h3 className="text-sm font-medium mb-3">지역별 요청 비율</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={sortedRegions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#3b82f6">
                      {sortedRegions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>클라이언트 유형별 분포</CardTitle>
            <CardDescription>접속 디바이스 및 플랫폼 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientData?.distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {(clientData?.distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {clientData?.distribution.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {client.type.includes('Mobile') ? (
                      <Smartphone className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Monitor className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm">{client.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{client.requests.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">{client.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>브라우저 분포</CardTitle>
            <CardDescription>웹 접속 브라우저 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={browserData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981">
                  {browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>지역별 성능 지표</CardTitle>
          <CardDescription>각 지역의 레이턴시 및 에러율 상세 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">지역</th>
                  <th className="text-right p-2">요청 수</th>
                  <th className="text-right p-2">비율</th>
                  <th className="text-right p-2">평균 레이턴시</th>
                  <th className="text-right p-2">에러율</th>
                  <th className="text-center p-2">상태</th>
                </tr>
              </thead>
              <tbody>
                {sortedRegions.map((region, index) => {
                  const totalRequests = sortedRegions.reduce((sum, r) => sum + r.requests, 0);
                  const percentage = ((region.requests / totalRequests) * 100).toFixed(1);
                  const status = region.latency < 30 && parseFloat(region.errorRate) < 1;

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{region.region}</td>
                      <td className="text-right p-2">{region.requests.toLocaleString()}</td>
                      <td className="text-right p-2">{percentage}%</td>
                      <td className={`text-right p-2 ${getLatencyColor(region.latency)}`}>
                        {region.latency}ms
                      </td>
                      <td className={`text-right p-2 ${getErrorRateColor(region.errorRate)}`}>
                        {region.errorRate}%
                      </td>
                      <td className="text-center p-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* OS Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>운영체제 분포</CardTitle>
          <CardDescription>클라이언트 운영체제 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={osData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {osData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}