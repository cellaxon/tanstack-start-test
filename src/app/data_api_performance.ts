// src/app/data_api_performance.ts
import type { ApiPerformance } from "./columns_api_performance";

export const apiPerformanceData: ApiPerformance[] = [
	{
		apiName: "User Service",
		endpoint: "/api/users",
		avgLatencyMs: 85,
		successRate: 99.8,
		totalCalls: 124500,
		errorRate: 0.2,
	},
	{
		apiName: "Payment Gateway",
		endpoint: "/api/payments",
		avgLatencyMs: 150,
		successRate: 98.2,
		totalCalls: 89000,
		errorRate: 1.8,
	},
	{
		apiName: "Product Catalog",
		endpoint: "/api/products",
		avgLatencyMs: 65,
		successRate: 100,
		totalCalls: 340000,
		errorRate: 0,
	},
	{
		apiName: "Notification Service",
		endpoint: "/api/notify",
		avgLatencyMs: 450,
		successRate: 85.5,
		totalCalls: 21000,
		errorRate: 14.5,
	},
	{
		apiName: "Analytics Dashboard",
		endpoint: "/api/analytics",
		avgLatencyMs: 280,
		successRate: 95.1,
		totalCalls: 5600,
		errorRate: 4.9,
	},
];
