import { AuthService } from "./auth";

interface RequestConfig extends RequestInit {
	params?: Record<string, string | number | boolean>;
	skipAuth?: boolean;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || "";
	}

	private async request<T>(
		endpoint: string,
		config: RequestConfig = {},
	): Promise<T> {
		const { params, skipAuth = false, ...fetchConfig } = config;

		let url = `${this.baseUrl}${endpoint}`;
		if (params) {
			const searchParams = new URLSearchParams(
				Object.entries(params).map(([key, value]) => [key, String(value)]),
			);
			url += `?${searchParams.toString()}`;
		}

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...((fetchConfig.headers as Record<string, string>) || {}),
		};

		if (!skipAuth) {
			let accessToken = AuthService.getAccessToken();

			if (accessToken && AuthService.isTokenExpired()) {
				const newTokens = await AuthService.refreshAccessToken();
				if (newTokens) {
					accessToken = newTokens.access_token;
				} else {
					// Don't logout immediately, let the 401 handler deal with it
					accessToken = null;
				}
			}

			if (accessToken) {
				headers["Authorization"] = `Bearer ${accessToken}`;
			}
		}

		const response = await fetch(url, {
			...fetchConfig,
			headers,
		});

		if (response.status === 401) {
			const refreshResult = await AuthService.refreshAccessToken();
			if (refreshResult) {
				headers["Authorization"] = `Bearer ${refreshResult.access_token}`;
				const retryResponse = await fetch(url, {
					...fetchConfig,
					headers,
				});

				if (!retryResponse.ok) {
					throw new Error(`API Error: ${retryResponse.statusText}`);
				}

				return retryResponse.json();
			} else {
				// Only logout for certain endpoints, not for traces
				if (!endpoint.includes("/traces") && !endpoint.includes("/dashboard")) {
					AuthService.logout();
				}
				throw new Error("Authentication required");
			}
		}

		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`);
		}

		return response.json();
	}

	async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		console.log(`API GET: ${this.baseUrl}${endpoint}`);
		try {
			const result = await this.request<T>(endpoint, { ...config, method: "GET" });
			console.log(`API GET result for ${endpoint}:`, result);
			return result;
		} catch (error) {
			console.error(`API GET error for ${endpoint}:`, error);
			throw error;
		}
	}

	async post<T>(
		endpoint: string,
		data?: unknown,
		config?: RequestConfig,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...config,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T>(
		endpoint: string,
		data?: unknown,
		config?: RequestConfig,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...config,
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T>(
		endpoint: string,
		data?: unknown,
		config?: RequestConfig,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...config,
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		return this.request<T>(endpoint, { ...config, method: "DELETE" });
	}
}

export const apiClient = new ApiClient();
export { ApiClient };
