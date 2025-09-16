import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/performance')({
  component: PerformancePage,
})

function PerformancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Performance Metrics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Response Time Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Performance metrics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}