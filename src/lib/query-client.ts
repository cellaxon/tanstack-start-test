import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // 1 minute
			gcTime: 5 * 60 * 1000, // 5 minutes
			retry: (failureCount, error) => {
				if ((error as any)?.status === 401) return false;
				return failureCount < 3;
			},
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: (failureCount, error) => {
				if ((error as any)?.status === 401) return false;
				return failureCount < 2;
			},
		},
	},
});
