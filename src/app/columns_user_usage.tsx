// src/app/columns_user_usage.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type UserUsage = {
	apiKey: string;
	clientName: string;
	lastActive: string; // 마지막 활동 날짜
	callCountToday: number; // 오늘 호출 수
	callCountTotal: number; // 총 호출 수
	status: "active" | "inactive" | "suspended";
};

export const userUsageColumns: ColumnDef<UserUsage>[] = [
	{
		accessorKey: "clientName",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Client Name
					{{
						asc: <ArrowUp className="ml-2 h-4 w-4" />,
						desc: <ArrowDown className="ml-2 h-4 w-4" />,
					}[column.getIsSorted() as string] ?? (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	},
	{
		accessorKey: "apiKey",
		header: "API Key",
		cell: ({ row }) => {
			const apiKey = row.getValue("apiKey") as string;
			// API Key의 일부만 보여주어 보안 유지
			return <div>{apiKey.substring(0, 8)}...</div>;
		},
	},
	{
		accessorKey: "callCountToday",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Calls Today
					{{
						asc: <ArrowUp className="ml-2 h-4 w-4" />,
						desc: <ArrowDown className="ml-2 h-4 w-4" />,
					}[column.getIsSorted() as string] ?? (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	},
	{
		accessorKey: "callCountTotal",
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
					}[column.getIsSorted() as string] ?? (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Status
					{{
						asc: <ArrowUp className="ml-2 h-4 w-4" />,
						desc: <ArrowDown className="ml-2 h-4 w-4" />,
					}[column.getIsSorted() as string] ?? (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			let variant: "default" | "destructive" | "secondary" = "default";
			if (status === "inactive") variant = "secondary";
			if (status === "suspended") variant = "destructive";
			return (
				<Badge variant={variant} className="capitalize">
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "lastActive",
		header: "Last Active",
	},
];
