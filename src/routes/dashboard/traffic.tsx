import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'

export const Route = createFileRoute('/dashboard/traffic')({
  component: TrafficPage,
})

function TrafficPage() {
  const generateTimeSeriesData = () => {
    const data = []
    const now = new Date()
    for (let i = 48; i >= 0; i--) {
      data.push({
        date: new Date(now.getTime() - i * 30 * 60 * 1000),
        value: Math.floor(Math.random() * 1000) + 200
      })
    }
    return data
  }

  const endpointData = [
    { label: '/api/users', value: 8500 },
    { label: '/api/products', value: 6200 },
    { label: '/api/orders', value: 4800 },
    { label: '/api/auth', value: 3500 },
    { label: '/api/analytics', value: 2100 },
    { label: '/api/reports', value: 1800 }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">API Traffic Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Real-time Traffic (Last 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={generateTimeSeriesData()}
              height={300}
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints by Request Count</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={endpointData}
              height={300}
              color="#059669"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}