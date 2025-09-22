import {
	useQuery,
	useMutation,
	useInfiniteQuery,
	type UseQueryOptions,
	type UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	order?: "asc" | "desc";
}

interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export function useApiQuery<T>(
	key: string | string[],
	endpoint: string,
	params?: Record<string, any>,
	options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
	const queryKey = Array.isArray(key) ? key : [key];

	return useQuery<T>({
		queryKey: params ? [...queryKey, params] : queryKey,
		queryFn: () => apiClient.get<T>(endpoint, { params }),
		...options,
	});
}

export function usePaginatedQuery<T>(
	key: string | string[],
	endpoint: string,
	params?: PaginationParams & Record<string, any>,
	options?: Omit<UseQueryOptions<PaginatedResponse<T>>, "queryKey" | "queryFn">,
) {
	const queryKey = Array.isArray(key) ? key : [key];

	return useQuery<PaginatedResponse<T>>({
		queryKey: [...queryKey, params],
		queryFn: () => apiClient.get<PaginatedResponse<T>>(endpoint, { params }),
		...options,
	});
}

export function useInfiniteApiQuery<T>(
	key: string | string[],
	endpoint: string,
	params?: Record<string, any>,
) {
	const queryKey = Array.isArray(key) ? key : [key];

	return useInfiniteQuery({
		queryKey: [...queryKey, params],
		queryFn: ({ pageParam = 1 }) =>
			apiClient.get<PaginatedResponse<T>>(endpoint, {
				params: { ...params, page: pageParam },
			}),
		getNextPageParam: (lastPage) =>
			lastPage.hasNext ? lastPage.page + 1 : undefined,
		getPreviousPageParam: (firstPage) =>
			firstPage.hasPrev ? firstPage.page - 1 : undefined,
		initialPageParam: 1,
	});
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
	endpoint: string,
	method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
	options?: UseMutationOptions<TData, Error, TVariables>,
) {
	return useMutation<TData, Error, TVariables>({
		mutationFn: async (data) => {
			switch (method) {
				case "DELETE":
					return apiClient.delete<TData>(endpoint);
				case "PUT":
					return apiClient.put<TData>(endpoint, data);
				case "PATCH":
					return apiClient.patch<TData>(endpoint, data);
				default:
					return apiClient.post<TData>(endpoint, data);
			}
		},
		...options,
	});
}

export function useResourceCRUD<T>(resourceName: string) {
	const baseEndpoint = `/api/${resourceName}`;

	return {
		useList: (params?: PaginationParams) =>
			usePaginatedQuery<T>(resourceName, baseEndpoint, params),

		useGet: (id: string | number) =>
			useApiQuery<T>([resourceName, String(id)], `${baseEndpoint}/${id}`),

		useCreate: (options?: UseMutationOptions<T, Error, Partial<T>>) =>
			useApiMutation<T, Partial<T>>(baseEndpoint, "POST", options),

		useUpdate: (
			id: string | number,
			options?: UseMutationOptions<T, Error, Partial<T>>,
		) => useApiMutation<T, Partial<T>>(`${baseEndpoint}/${id}`, "PUT", options),

		usePatch: (
			id: string | number,
			options?: UseMutationOptions<T, Error, Partial<T>>,
		) =>
			useApiMutation<T, Partial<T>>(`${baseEndpoint}/${id}`, "PATCH", options),

		useDelete: (
			id: string | number,
			options?: UseMutationOptions<void, Error, void>,
		) => useApiMutation<void, void>(`${baseEndpoint}/${id}`, "DELETE", options),
	};
}
