import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Activity, Users, Clock, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  // Generate sample data
  const generateTimeSeriesData = () => {
    const data = []
    const now = new Date()
    for (let i = 24; i >= 0; i--) {
      data.push({
        date: new Date(now.getTime() - i * 60 * 60 * 1000),
        value: Math.floor(Math.random() * 500) + 100
      })
    }
    return data
  }

  const barChartData = [
    { label: 'GET', value: 4500 },
    { label: 'POST', value: 2300 },
    { label: 'PUT', value: 1200 },
    { label: 'DELETE', value: 800 },
    { label: 'PATCH', value: 400 }
  ]

  const pieChartData = [
    { label: 'Success', value: 8500 },
    { label: '4xx Errors', value: 1200 },
    { label: '5xx Errors', value: 300 }
  ]

  const stats = [
    {
      title: 'Total Requests',
      value: '1.2M',
      change: '+12.3%',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Active Clients',
      value: '342',
      change: '+5.2%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Avg Response Time',
      value: '124ms',
      change: '-8.1%',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Error Rate',
      value: '0.8%',
      change: '-2.3%',
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ]

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Volume (24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={generateTimeSeriesData()}
              width={500}
              height={300}
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={barChartData}
              width={500}
              height={300}
              color="#10b981"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={pieChartData}
              width={500}
              height={350}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={generateTimeSeriesData().map(d => ({ ...d, value: Math.random() * 200 + 50 }))}
              width={500}
              height={300}
              color="#8b5cf6"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}