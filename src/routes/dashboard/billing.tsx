import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/billing")({
	component: BillingPage,
});

function BillingPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Billing</h1>
			<Card>
				<CardHeader>
					<CardTitle>Usage Costs</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600">
						Billing information will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
