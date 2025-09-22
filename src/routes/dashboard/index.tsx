import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { SystemMetricsChart } from "@/components/charts/system-metrics-chart";
import { Activity, Users, Clock, AlertCircle, Building2, BarChart3 } from "lucide-react";
import {
	useDashboardStats,
	useRequestVolume,
	useMethodsDistribution,
	useStatusDistribution,
	useResponseTimeTrend,
} from "@/hooks/useDashboardData";
import { useState } from "react";

// Banking monitoring imports
import { TrafficMonitoring } from "@/components/charts/TrafficMonitoring";
import { ErrorTracking } from "@/components/charts/ErrorTracking";
import { ResourceMetrics } from "@/components/charts/ResourceMetrics";
import { SecurityMonitoring } from "@/components/charts/SecurityMonitoring";
import { BusinessMetrics } from "@/components/charts/BusinessMetrics";
import { GeographicAnalysis } from "@/components/charts/GeographicAnalysis";
import { useWebSocket } from "@/hooks/useWebSocket";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const [activeTab, setActiveTab] = useState("overview");
	const [bankingSubTab, setBankingSubTab] = useState("traffic");

	// Fetch data from API for standard dashboard
	const statsQuery = useDashboardStats();
	const requestVolumeQuery = useRequestVolume();
	const methodsQuery = useMethodsDistribution();
	const statusQuery = useStatusDistribution();
	const responseTimeQuery = useResponseTimeTrend();

	// WebSocket connection for banking dashboard
	const { isConnected } = useWebSocket();

	// Map stats data
	const stats = statsQuery.data
		? [
				{
					title: "Total Requests",
					value: statsQuery.data.totalRequests?.formatted || "0",
					change: `${Number(statsQuery.data.totalRequests?.change || 0) > 0 ? "+" : ""}${statsQuery.data.totalRequests?.change || 0}%`,
					icon: Activity,
					color: "text-blue-600",
				},
				{
					title: "Active Clients",
					value: statsQuery.data.activeClients?.value?.toString() || "0",
					change: `+${statsQuery.data.activeClients?.change || 0}%`,
					icon: Users,
					color: "text-green-600",
				},
				{
					title: "Avg Response Time",
					value: statsQuery.data.avgResponseTime?.formatted || "0ms",
					change: `${statsQuery.data.avgResponseTime?.change || 0}%`,
					icon: Clock,
					color: "text-purple-600",
				},
				{
					title: "Error Rate",
					value: statsQuery.data.errorRate?.formatted || "0%",
					change: `${statsQuery.data.errorRate?.change || 0}%`,
					icon: AlertCircle,
					color: "text-red-600",
				},
			]
		: [];

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
				<p className="text-gray-600 mt-2">
					Monitor your API Gateway performance and usage metrics
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						Standard Monitoring
					</TabsTrigger>
					<TabsTrigger value="banking" className="flex items-center gap-2">
						<Building2 className="h-4 w-4" />
						Banking Gateway
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-0">
					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
						{stats.map((stat) => (
							<Card key={stat.title}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-gray-600">
										{stat.title}
									</CardTitle>
									<stat.icon className={`h-4 w-4 ${stat.color}`} />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stat.value}</div>
									<p className="text-xs text-gray-600 mt-1">
										<span
											className={
												stat.change.startsWith("+")
													? "text-green-600"
													: "text-red-600"
											}
										>
											{stat.change}
										</span>
										{" from last period"}
									</p>
								</CardContent>
							</Card>
						))}
					</div>

					{/* System Metrics Section */}
					<div className="mb-8">
						<SystemMetricsChart />
					</div>

					{/* Charts Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Request Volume (24 Hours)</CardTitle>
							</CardHeader>
							<CardContent>
								{requestVolumeQuery.data && requestVolumeQuery.data.length > 0 ? (
									<LineChart
										data={requestVolumeQuery.data}
										height={300}
										color="#3b82f6"
									/>
								) : (
									<div className="h-[300px] flex items-center justify-center text-muted-foreground">
										{requestVolumeQuery.isLoading
											? "Loading..."
											: "No data available"}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>API Methods Distribution</CardTitle>
							</CardHeader>
							<CardContent>
								{methodsQuery.data && methodsQuery.data.length > 0 ? (
									<BarChart data={methodsQuery.data} height={300} color="#10b981" />
								) : (
									<div className="h-[300px] flex items-center justify-center text-muted-foreground">
										{methodsQuery.isLoading ? "Loading..." : "No data available"}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Response Status Distribution</CardTitle>
							</CardHeader>
							<CardContent>
								{statusQuery.data && statusQuery.data.length > 0 ? (
									<PieChart data={statusQuery.data} height={350} />
								) : (
									<div className="h-[350px] flex items-center justify-center text-muted-foreground">
										{statusQuery.isLoading ? "Loading..." : "No data available"}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Response Time Trend</CardTitle>
							</CardHeader>
							<CardContent>
								{responseTimeQuery.data && responseTimeQuery.data.length > 0 ? (
									<LineChart
										data={responseTimeQuery.data}
										height={300}
										color="#8b5cf6"
									/>
								) : (
									<div className="h-[300px] flex items-center justify-center text-muted-foreground">
										{responseTimeQuery.isLoading
											? "Loading..."
											: "No data available"}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="banking" className="mt-0">
					<div className="mb-4">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold">은행권 API Gateway 모니터링</h2>
							<div className="flex items-center gap-2">
								<div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
								<span className="text-sm text-gray-600">
									{isConnected ? '실시간 연결됨' : '연결 끊김'}
								</span>
							</div>
						</div>
					</div>

					<Tabs value={bankingSubTab} onValueChange={setBankingSubTab} className="w-full">
						<TabsList className="grid w-full grid-cols-6 mb-4">
							<TabsTrigger value="traffic">트래픽</TabsTrigger>
							<TabsTrigger value="errors">에러/가용성</TabsTrigger>
							<TabsTrigger value="resources">리소스</TabsTrigger>
							<TabsTrigger value="security">보안</TabsTrigger>
							<TabsTrigger value="business">비즈니스/SLA</TabsTrigger>
							<TabsTrigger value="geographic">지리적 분석</TabsTrigger>
						</TabsList>

						<TabsContent value="traffic" className="mt-0">
							<TrafficMonitoring />
						</TabsContent>

						<TabsContent value="errors" className="mt-0">
							<ErrorTracking />
						</TabsContent>

						<TabsContent value="resources" className="mt-0">
							<ResourceMetrics />
						</TabsContent>

						<TabsContent value="security" className="mt-0">
							<SecurityMonitoring />
						</TabsContent>

						<TabsContent value="business" className="mt-0">
							<BusinessMetrics />
						</TabsContent>

						<TabsContent value="geographic" className="mt-0">
							<GeographicAnalysis />
						</TabsContent>
					</Tabs>
				</TabsContent>
			</Tabs>
		</div>
	);
}