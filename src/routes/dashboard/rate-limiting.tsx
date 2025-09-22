import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/rate-limiting")({
	component: RateLimitingPage,
});

function RateLimitingPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Rate Limiting</h1>
			<Card>
				<CardHeader>
					<CardTitle>Rate Limit Status</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600">
						Rate limiting configurations will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
