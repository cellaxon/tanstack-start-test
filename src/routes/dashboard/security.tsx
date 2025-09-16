import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/security')({
  component: SecurityPage,
})

function SecurityPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Security</h1>
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Security monitoring data will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}