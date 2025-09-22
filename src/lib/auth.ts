interface TokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

interface UserProfile {
	id: string;
	email: string;
	name: string;
	avatar?: string;
}

class AuthService {
	private static TOKEN_KEY = "access_token";
	private static REFRESH_TOKEN_KEY = "refresh_token";
	private static TOKEN_EXPIRY_KEY = "token_expiry";

	private static getStorageItem(key: string): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(key);
	}

	private static setStorageItem(key: string, value: string): void {
		if (typeof window === "undefined") return;
		localStorage.setItem(key, value);
	}

	private static removeStorageItem(key: string): void {
		if (typeof window === "undefined") return;
		localStorage.removeItem(key);
	}

	static getAccessToken(): string | null {
		return this.getStorageItem(this.TOKEN_KEY);
	}

	static getRefreshToken(): string | null {
		return this.getStorageItem(this.REFRESH_TOKEN_KEY);
	}

	static isTokenExpired(): boolean {
		const expiry = this.getStorageItem(this.TOKEN_EXPIRY_KEY);
		if (!expiry) return true;
		return new Date().getTime() > parseInt(expiry);
	}

	static saveTokens(tokens: TokenResponse): void {
		this.setStorageItem(this.TOKEN_KEY, tokens.access_token);
		this.setStorageItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
		const expiry = new Date().getTime() + tokens.expires_in * 1000;
		this.setStorageItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
	}

	static clearTokens(): void {
		this.removeStorageItem(this.TOKEN_KEY);
		this.removeStorageItem(this.REFRESH_TOKEN_KEY);
		this.removeStorageItem(this.TOKEN_EXPIRY_KEY);
	}

	static async refreshAccessToken(): Promise<TokenResponse | null> {
		const refreshToken = this.getRefreshToken();
		if (!refreshToken) return null;

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL || ""}/auth/refresh`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ refresh_token: refreshToken }),
				},
			);

			if (!response.ok) {
				this.clearTokens();
				return null;
			}

			const tokens: TokenResponse = await response.json();
			this.saveTokens(tokens);
			return tokens;
		} catch (error) {
			console.error("Failed to refresh token:", error);
			this.clearTokens();
			return null;
		}
	}

	static async login(
		provider: "google" | "github" | "microsoft",
		code: string,
	): Promise<TokenResponse> {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL || ""}/auth/oauth/callback`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ provider, code }),
			},
		);

		if (!response.ok) {
			throw new Error("Login failed");
		}

		const tokens: TokenResponse = await response.json();
		this.saveTokens(tokens);
		return tokens;
	}

	static logout(): void {
		this.clearTokens();
		window.location.href = "/login";
	}

	static getOAuthUrl(provider: "google" | "github" | "microsoft"): string {
		const redirectUri = `${window.location.origin}/auth/callback`;
		const state = Math.random().toString(36).substring(7);

		localStorage.setItem("oauth_provider", provider);
		localStorage.setItem("oauth_state", state);

		const clientIds = {
			google: import.meta.env.VITE_GOOGLE_CLIENT_ID || "demo-google-client-id",
			github: import.meta.env.VITE_GITHUB_CLIENT_ID || "demo-github-client-id",
			microsoft:
				import.meta.env.VITE_MICROSOFT_CLIENT_ID || "demo-microsoft-client-id",
		};

		const urls = {
			google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientIds.google}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&state=${state}`,
			github: `https://github.com/login/oauth/authorize?client_id=${clientIds.github}&redirect_uri=${redirectUri}&scope=user:email&state=${state}`,
			microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientIds.microsoft}&redirect_uri=${redirectUri}&response_type=code&scope=openid profile email&state=${state}`,
		};

		return urls[provider];
	}
}

export { AuthService, type TokenResponse, type UserProfile };
