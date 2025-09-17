import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Payment, columns } from "@/app/columns"
import { DataTable } from "@/components/DataTable"

// 샘플 데이터
const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "489e1d42",
    amount: 250,
    status: "success",
    email: "a@example.com",
  },
  {
    id: "489e1d42",
    amount: 150,
    status: "failed",
    email: "b@example.com",
  },
]

export const Route = createFileRoute('/dashboard/performance')({
  component: PerformancePage,
})

function PerformancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Performance Metrics</h1>
      
      <div className="grid grid-cols-1 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Performance metrics will be displayed here.</p>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend 2</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}