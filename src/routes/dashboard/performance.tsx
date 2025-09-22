import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { apiPerformanceColumns } from "@/app/columns_api_performance";
import { apiPerformanceData } from "@/app/data_api_performance";
import { userUsageColumns } from "@/app/columns_user_usage";
import { userUsageData } from "@/app/data_user_usage";
import { DataTable } from "@/components/DataTable";
import { NetworkPath } from "@/components/NetworkPath";

export const Route = createFileRoute("/dashboard/performance")({
	component: PerformancePage,
});

function PerformancePage() {
	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Performance Metrics</h1>

			<div className="mb-8">
				<NetworkPath />
			</div>

			<div className="grid grid-cols-1 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>API Performance</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={apiPerformanceColumns}
							data={apiPerformanceData}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>User Usage</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={userUsageColumns} data={userUsageData} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
