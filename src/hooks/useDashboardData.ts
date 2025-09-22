import { useQuery } from "@tanstack/react-query";

// Dashboard Statistics
export interface DashboardStats {
	totalRequests: {
		value: number;
		formatted: string;
		change: string;
		unit: string;
	};
	activeClients: {
		value: number;
		formatted: string;
		change: string;
		unit: string;
	};
	avgResponseTime: {
		value: number;
		formatted: string;
		change: string;
		unit: string;
	};
	errorRate: {
		value: number;
		formatted: string;
		change: string;
		unit: string;
	};
}

export function useDashboardStats() {
	return useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/stats");
			if (!response.ok) throw new Error("Failed to fetch dashboard stats");
			return response.json() as Promise<DashboardStats>;
		},
		refetchInterval: 30000, // Refetch every 30 seconds
		staleTime: 15000,
	});
}

// Request Volume
export function useRequestVolume(hours: number = 24) {
	return useQuery({
		queryKey: ["request-volume", hours],
		queryFn: async () => {
			const response = await fetch(
				`/api/dashboard/request-volume?hours=${hours}`,
			);
			if (!response.ok) throw new Error("Failed to fetch request volume");
			const data = await response.json();
			return data.data.map((item: any) => ({
				date: new Date(item.timestamp),
				value: item.value,
			}));
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Methods Distribution
export function useMethodsDistribution() {
	return useQuery({
		queryKey: ["methods-distribution"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/methods-distribution");
			if (!response.ok) throw new Error("Failed to fetch methods distribution");
			const data = await response.json();
			return data.data.map((item: any) => ({
				label: item.method,
				value: item.count,
			}));
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Status Distribution
export function useStatusDistribution() {
	return useQuery({
		queryKey: ["status-distribution"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/status-distribution");
			if (!response.ok) throw new Error("Failed to fetch status distribution");
			const data = await response.json();
			return data.data.map((item: any) => ({
				label: item.label,
				value: item.count,
			}));
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Response Time Trend
export function useResponseTimeTrend(hours: number = 24) {
	return useQuery({
		queryKey: ["response-time", hours],
		queryFn: async () => {
			const response = await fetch(
				`/api/dashboard/response-time?hours=${hours}`,
			);
			if (!response.ok) throw new Error("Failed to fetch response time");
			const data = await response.json();
			return data.data.map((item: any) => ({
				date: new Date(item.timestamp),
				value: item.value,
			}));
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Top Endpoints
export function useTopEndpoints() {
	return useQuery({
		queryKey: ["top-endpoints"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/top-endpoints");
			if (!response.ok) throw new Error("Failed to fetch top endpoints");
			const data = await response.json();
			return data.data;
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Error Logs
export function useErrorLogs() {
	return useQuery({
		queryKey: ["error-logs"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/errors");
			if (!response.ok) throw new Error("Failed to fetch error logs");
			const data = await response.json();
			return data.data;
		},
		refetchInterval: 30000,
		staleTime: 15000,
	});
}

// Client Usage
export function useClientUsage() {
	return useQuery({
		queryKey: ["client-usage"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/client-usage");
			if (!response.ok) throw new Error("Failed to fetch client usage");
			const data = await response.json();
			return data.data;
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Rate Limits
export function useRateLimits() {
	return useQuery({
		queryKey: ["rate-limits"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/rate-limits");
			if (!response.ok) throw new Error("Failed to fetch rate limits");
			const data = await response.json();
			return data.data;
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Billing Metrics
export function useBillingMetrics() {
	return useQuery({
		queryKey: ["billing-metrics"],
		queryFn: async () => {
			const response = await fetch("/api/dashboard/billing");
			if (!response.ok) throw new Error("Failed to fetch billing metrics");
			const data = await response.json();
			return data;
		},
		refetchInterval: 300000, // Refetch every 5 minutes
		staleTime: 240000,
	});
}
