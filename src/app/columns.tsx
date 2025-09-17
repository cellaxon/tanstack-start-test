// src/app/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
// ArrowUpDown 아이콘 외에 ArrowDown, ArrowUp 아이콘을 추가로 import 합니다.
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          {/* 정렬 상태에 따라 아이콘을 조건부 렌더링합니다 */}
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]