import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/clients')({
  component: ClientsPage,
})

function ClientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">API Clients</h1>
      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Client management interface will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}