import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/errors")({
	component: ErrorsPage,
});

function ErrorsPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Error Monitoring</h1>
			<Card>
				<CardHeader>
					<CardTitle>Error Rates and Tracking</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600">
						Error monitoring data will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
