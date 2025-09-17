// src/app/columns_api_performance.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type ApiPerformance = {
  apiName: string
  endpoint: string
  avgLatencyMs: number // 평균 지연 시간 (밀리초)
  successRate: number // 성공률 (%)
  totalCalls: number // 총 호출 수
  errorRate: number // 오류율 (%)
}

export const apiPerformanceColumns: ColumnDef<ApiPerformance>[] = [
  {
    accessorKey: "apiName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          API Name
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
  },
  {
    accessorKey: "endpoint",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Endpoint
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
  },
  {
    accessorKey: "avgLatencyMs",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Avg. Latency (ms)
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => {
      const latency = row.getValue("avgLatencyMs") as number
      const status = latency < 100 ? "default" : latency < 300 ? "secondary" : "destructive"
      return <Badge variant={status}>{latency} ms</Badge>
    },
  },
  {
    accessorKey: "successRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Success Rate
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => {
      const rate = row.getValue("successRate") as number
      const variant = rate > 95 ? "default" : rate > 80 ? "secondary" : "destructive"
      return <Badge variant={variant}>{rate.toFixed(1)}%</Badge>
    },
  },
  {
    accessorKey: "totalCalls",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Calls
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
  },
];
