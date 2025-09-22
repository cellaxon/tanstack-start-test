import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Settings</h1>
			<Card>
				<CardHeader>
					<CardTitle>Dashboard Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600">
						Settings and configurations will be displayed here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
