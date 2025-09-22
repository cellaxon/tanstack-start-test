import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export type TimeRange = "1m" | "5m" | "1h" | "1d" | "1w" | "1M" | "1y";

interface SystemMetric {
	timestamp: string;
	cpu_usage: number;
	memory_usage: number;
	memory_total: number;
	memory_free: number;
	swap_usage?: number;
	swap_total?: number;
	swap_free?: number;
	process_cpu: number;
	process_memory: number;
	network_rx: number;
	network_tx: number;
	disk_usage: number;
	disk_total: number;
}

interface MetricsResponse {
	success: boolean;
	data: SystemMetric[];
	duration: string;
	timestamp: string;
}

interface StatsResponse {
	success: boolean;
	data: {
		avg_cpu: number;
		max_cpu: number;
		min_cpu: number;
		avg_memory: number;
		max_memory: number;
		min_memory: number;
		total_network_rx: number;
		total_network_tx: number;
	};
	duration: string;
	samples: number;
	timestamp: string;
}

export function useSystemMetrics(timeRange: TimeRange = "1h") {
	return useQuery({
		queryKey: ["system-metrics", timeRange],
		queryFn: async () => {
			return await apiClient.get(`/metrics/system`, {
				params: { duration: timeRange },
			});
		},
		refetchInterval: timeRange === "1m" || timeRange === "5m" ? 10000 : 30000, // 10s for short ranges, 30s for others
		staleTime: 5000, // Consider data stale after 5 seconds
	});
}

export function useCurrentMetrics() {
	return useQuery({
		queryKey: ["current-metrics"],
		queryFn: async () => {
			return await apiClient.get("/metrics/current");
		},
		refetchInterval: 5000, // Refetch every 5 seconds for real-time data
		staleTime: 2000,
	});
}

export function useMetricsStats(timeRange: TimeRange = "1h") {
	return useQuery({
		queryKey: ["metrics-stats", timeRange],
		queryFn: async () => {
			return await apiClient.get("/metrics/stats", {
				params: { duration: timeRange },
			});
		},
		refetchInterval: 60000,
		staleTime: 30000,
	});
}

// Helper function to format bytes
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Helper function to format network speed
export function formatSpeed(bytesPerSecond: number): string {
	return formatBytes(bytesPerSecond) + "/s";
}
