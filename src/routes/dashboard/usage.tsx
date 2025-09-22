import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/usage")({
	component: UsagePage,
});

function UsagePage() {
	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Usage Analytics</h1>
			<Card>
				<CardHeader>
					<CardTitle>API Usage Patterns</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600">
						Usage analytics will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
