import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const Route = createFileRoute("/dashboard")({
	component: DashboardLayoutWrapper,
});

function DashboardLayoutWrapper() {
	return <DashboardLayout />;
}
