import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AuthService } from "@/lib/auth";
import { useEffect } from "react";

// Types
export interface Trace {
	traceId: string;
	serviceName: string;
	operationName: string;
	startTime: number;
	duration: number;
	status: "success" | "error" | "warning";
	tags: Record<string, any>;
	spanCount?: number;
	errorCount?: number;
}

export interface TraceData {
	traceId: string;
	rootSpan: any;
	spans: any[];
	startTime: number;
	duration: number;
	serviceCount: number;
	spanCount: number;
	errorCount: number;
}

export interface TracesResponse {
	traces: Trace[];
	total: number;
	timestamp: Date;
}

// Hook to ensure authentication before making requests
export function useEnsureAuth() {
	useEffect(() => {
		const checkAuth = async () => {
			const token = AuthService.getAccessToken();
			if (!token || AuthService.isTokenExpired()) {
				// For demo, create a mock login with admin credentials
				try {
					const response = await fetch(
						`${import.meta.env.VITE_API_URL || "http://localhost:4001/api"}/auth/login`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								username: "admin",
								password: "admin123",
							}),
						},
					);

					if (response.ok) {
						const data = await response.json();
						AuthService.saveTokens({
							access_token: data.access_token,
							refresh_token: data.refresh_token,
							expires_in: data.expires_in,
							token_type: data.token_type,
						});
						// Save user info to localStorage for DashboardLayout
						if (data.user) {
							localStorage.setItem("user", JSON.stringify(data.user));
						}
					}
				} catch (err) {
					console.error("Auto-auth failed:", err);
				}
			}
		};
		checkAuth();
	}, []);
}

// Fetch all traces
export function useTraces(limit: number = 10) {
	useEnsureAuth(); // Ensure authentication before fetching

	return useQuery({
		queryKey: ["traces", limit],
		queryFn: async () => {
			return apiClient.get<TracesResponse>("/traces", {
				params: { limit },
			});
		},
		staleTime: 30000, // Consider data stale after 30 seconds
		gcTime: 300000, // Keep in cache for 5 minutes (formerly cacheTime)
		retry: (failureCount, error) => {
			// Don't retry on authentication errors
			if (error instanceof Error && error.message === "Authentication failed") {
				return false;
			}
			return failureCount < 3;
		},
		refetchInterval: 60000, // Refetch every minute
	});
}

// Fetch single trace details
export function useTraceDetails(traceId: string | null) {
	return useQuery({
		queryKey: ["trace", traceId],
		queryFn: async () => {
			if (!traceId) throw new Error("No trace ID provided");
			return apiClient.get<TraceData>(`/traces/${traceId}`);
		},
		enabled: !!traceId, // Only run query if traceId exists
		staleTime: 60000, // Consider data stale after 1 minute
		gcTime: 600000, // Keep in cache for 10 minutes
		retry: (failureCount, error) => {
			// Don't retry on authentication errors
			if (error instanceof Error && error.message === "Authentication failed") {
				return false;
			}
			return failureCount < 2;
		},
	});
}

// Search traces
export function useSearchTraces(searchTerm: string) {
	return useQuery({
		queryKey: ["traces", "search", searchTerm],
		queryFn: async () => {
			if (!searchTerm) return { traces: [], total: 0, timestamp: new Date() };

			return apiClient.get<TracesResponse>("/traces", {
				params: {
					search: searchTerm,
					limit: 20,
				},
			});
		},
		enabled: searchTerm.length > 0,
		staleTime: 30000,
		gcTime: 300000,
	});
}

// Refresh traces mutation
export function useRefreshTraces() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (limit: number = 10) => {
			return apiClient.get<TracesResponse>("/traces", {
				params: { limit },
			});
		},
		onSuccess: (data, variables) => {
			// Update the cache with fresh data
			queryClient.setQueryData(["traces", variables], data);
		},
		onError: (error) => {
			console.error("Failed to refresh traces:", error);
		},
	});
}

// Delete trace mutation (if API supports it)
export function useDeleteTrace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (traceId: string) => {
			return apiClient.delete(`/traces/${traceId}`);
		},
		onSuccess: () => {
			// Invalidate and refetch traces list
			queryClient.invalidateQueries({ queryKey: ["traces"] });
		},
	});
}

// Prefetch trace details (for hover/preview)
export function usePrefetchTrace() {
	const queryClient = useQueryClient();

	return (traceId: string) => {
		queryClient.prefetchQuery({
			queryKey: ["trace", traceId],
			queryFn: async () => {
				return apiClient.get<TraceData>(`/traces/${traceId}`);
			},
			staleTime: 60000,
		});
	};
}

// Get trace waterfall data
export function useTraceWaterfall(traceId: string | null) {
	return useQuery({
		queryKey: ["trace", traceId, "waterfall"],
		queryFn: async () => {
			if (!traceId) throw new Error("No trace ID provided");
			return apiClient.get(`/traces/${traceId}/waterfall`);
		},
		enabled: !!traceId,
		staleTime: 60000,
		gcTime: 600000,
	});
}
