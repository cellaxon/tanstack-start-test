import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
	component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const handleCallback = async () => {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			const state = params.get("state");
			const error = params.get("error");
			const errorDescription = params.get("error_description");

			if (error) {
				setError(errorDescription || "OAuth authentication failed");
				setLoading(false);
				return;
			}

			if (!code) {
				setError("No authorization code received");
				setLoading(false);
				return;
			}

			const provider = localStorage.getItem("oauth_provider") as
				| "google"
				| "github"
				| "microsoft";
			const savedState = localStorage.getItem("oauth_state");

			if (!provider) {
				setError("OAuth provider not found");
				setLoading(false);
				return;
			}

			if (state && state !== savedState) {
				setError("Invalid OAuth state");
				setLoading(false);
				return;
			}

			try {
				await AuthService.login(provider, code);
				localStorage.removeItem("oauth_provider");
				localStorage.removeItem("oauth_state");
				navigate({ to: "/dashboard" });
			} catch (err) {
				setError("Failed to complete OAuth login");
				console.error("OAuth callback error:", err);
				setLoading(false);
			}
		};

		handleCallback();
	}, [navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>OAuth Authentication</CardTitle>
				</CardHeader>
				<CardContent className="text-center">
					{loading && (
						<div className="space-y-4">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
							<p className="text-gray-600">Completing authentication...</p>
						</div>
					)}
					{error && (
						<div className="space-y-4">
							<p className="text-red-500">{error}</p>
							<a href="/login" className="text-blue-600 hover:underline">
								Return to login
							</a>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
