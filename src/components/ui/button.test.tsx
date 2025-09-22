import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button Component", () => {
	it("renders button with text", () => {
		render(<Button>Click me</Button>);
		expect(
			screen.getByRole("button", { name: "Click me" }),
		).toBeInTheDocument();
	});

	it("applies default variant and size classes", () => {
		render(<Button>Default Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-primary");
		expect(button).toHaveClass("h-9");
	});

	it("applies custom variant classes", () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-destructive");
	});

	it("applies custom size classes", () => {
		render(<Button size="sm">Small Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("h-8");
	});

	it("handles click events", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button).toHaveClass("disabled:opacity-50");
	});

	it("applies custom className", () => {
		render(<Button className="custom-class">Custom</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("custom-class");
	});

	it("renders as child component when asChild is true", () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>,
		);
		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/test");
	});

	it("combines variant and size props correctly", () => {
		render(
			<Button variant="outline" size="lg">
				Large Outline Button
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("border");
		expect(button).toHaveClass("bg-background");
		expect(button).toHaveClass("h-10");
	});

	it("renders icon button correctly", () => {
		render(
			<Button size="icon" aria-label="Settings">
				<svg><title>Icon</title>Icon</svg>
			</Button>,
		);
		const button = screen.getByRole("button", { name: "Settings" });
		expect(button).toHaveClass("size-9");
	});
});
