import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { SystemMetricsChart } from '@/components/charts/system-metrics-chart'
import { Activity, Users, Clock, AlertCircle } from 'lucide-react'
import {
  useDashboardStats,
  useRequestVolume,
  useMethodsDistribution,
  useStatusDistribution,
  useResponseTimeTrend
} from '@/hooks/useDashboardData'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  // Fetch data from API
  const statsQuery = useDashboardStats();
  const requestVolumeQuery = useRequestVolume();
  const methodsQuery = useMethodsDistribution();
  const statusQuery = useStatusDistribution();
  const responseTimeQuery = useResponseTimeTrend();

  // Map stats data
  const stats = statsQuery.data ? [
    {
      title: 'Total Requests',
      value: statsQuery.data.totalRequests.formatted,
      change: `${Number(statsQuery.data.totalRequests.change) > 0 ? '+' : ''}${statsQuery.data.totalRequests.change}%`,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Active Clients',
      value: statsQuery.data.activeClients.value.toString(),
      change: `+${statsQuery.data.activeClients.change}%`,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Avg Response Time',
      value: statsQuery.data.avgResponseTime.formatted,
      change: `${statsQuery.data.avgResponseTime.change}%`,
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Error Rate',
      value: statsQuery.data.errorRate.formatted,
      change: `${statsQuery.data.errorRate.change}%`,
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ] : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor your API Gateway performance and usage metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                {' from last period'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Metrics Section */}
      <div className="mb-8">
        <SystemMetricsChart />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Volume (24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            {requestVolumeQuery.data && requestVolumeQuery.data.length > 0 ? (
              <LineChart
                data={requestVolumeQuery.data}
                height={300}
                color="#3b82f6"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {requestVolumeQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {methodsQuery.data && methodsQuery.data.length > 0 ? (
              <BarChart
                data={methodsQuery.data}
                height={300}
                color="#10b981"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {methodsQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusQuery.data && statusQuery.data.length > 0 ? (
              <PieChart
                data={statusQuery.data}
                height={350}
              />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                {statusQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {responseTimeQuery.data && responseTimeQuery.data.length > 0 ? (
              <LineChart
                data={responseTimeQuery.data}
                height={300}
                color="#8b5cf6"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {responseTimeQuery.isLoading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}