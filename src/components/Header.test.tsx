import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "./Header";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

describe("Header Component", () => {
	it("renders header element", () => {
		render(<Header />);
		const header = screen.getByRole("banner");
		expect(header).toBeInTheDocument();
	});

	it("renders navigation element", () => {
		render(<Header />);
		const nav = screen.getByRole("navigation");
		expect(nav).toBeInTheDocument();
	});

	it("renders all navigation links", () => {
		render(<Header />);

		const expectedLinks = [
			{ text: "Home", href: "/" },
			{ text: "Start - Server Functions", href: "/demo/start/server-funcs" },
			{ text: "Start - API Request", href: "/demo/start/api-request" },
			{ text: "TanStack Query", href: "/demo/tanstack-query" },
			{ text: "TanStack Table", href: "/demo/table" },
			{ text: "Store", href: "/demo/store" },
			{ text: "Simple Form", href: "/demo/form/simple" },
			{ text: "Address Form", href: "/demo/form/address" },
		];

		for (const { text, href } of expectedLinks) {
			const link = screen.getByRole("link", { name: text });
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute("href", href);
		}
	});

	it("applies correct CSS classes to header", () => {
		const { container } = render(<Header />);
		const header = container.querySelector("header");
		expect(header).toHaveClass("p-2");
		expect(header).toHaveClass("flex");
		expect(header).toHaveClass("gap-2");
		expect(header).toHaveClass("bg-white");
		expect(header).toHaveClass("text-black");
		expect(header).toHaveClass("justify-between");
	});

	it("applies correct CSS classes to navigation", () => {
		const { container } = render(<Header />);
		const nav = container.querySelector("nav");
		expect(nav).toHaveClass("flex");
		expect(nav).toHaveClass("flex-row");
	});

	it("applies correct CSS classes to link containers", () => {
		const { container } = render(<Header />);
		const linkContainers = container.querySelectorAll("nav > div");

		for (const div of linkContainers) {
			expect(div).toHaveClass("px-2");
			expect(div).toHaveClass("font-bold");
		}
	});

	it("has correct number of navigation items", () => {
		render(<Header />);
		const links = screen.getAllByRole("link");
		expect(links).toHaveLength(8);
	});
});
