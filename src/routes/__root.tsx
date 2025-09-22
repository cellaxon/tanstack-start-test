import {
	createRootRouteWithContext,
	Outlet,
	useNavigate,
	useLocation,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootComponent,
	notFoundComponent: () => {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
					<p className="text-lg text-gray-600 mb-8">Page not found</p>
					<a href="/dashboard" className="text-blue-500 hover:text-blue-700">
						Go to Dashboard
					</a>
				</div>
			</div>
		);
	},
});

function RootComponent() {
	const navigate = useNavigate();
	const location = useLocation();
	const hasCheckedAuth = useRef(false);

	useEffect(() => {
		// Prevent infinite loops by checking only once per mount
		if (hasCheckedAuth.current) return;
		hasCheckedAuth.current = true;

		const user = localStorage.getItem("user");
		const isLoginPage = location.pathname === "/login";
		const isDashboardPage = location.pathname.startsWith("/dashboard");
		const isHomePage = location.pathname === "/";

		// Only redirect if necessary
		if (!user && !isLoginPage && (isDashboardPage || isHomePage)) {
			navigate({ to: "/login", replace: true });
		} else if (user && isLoginPage) {
			navigate({ to: "/dashboard", replace: true });
		} else if (user && isHomePage) {
			navigate({ to: "/dashboard", replace: true });
		}
	}, [location.pathname, navigate]); // Run only once on mount

	return <Outlet />;
}
