import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "./card";

describe("Card Components", () => {
	describe("Card", () => {
		it("renders card with children", () => {
			render(<Card>Card content</Card>);
			expect(screen.getByText("Card content")).toBeInTheDocument();
		});

		it("applies default card classes", () => {
			const { container } = render(<Card>Content</Card>);
			const card = container.firstChild;
			expect(card).toHaveClass("rounded-xl");
			expect(card).toHaveClass("border");
			expect(card).toHaveClass("bg-card");
			expect(card).toHaveClass("shadow");
		});

		it("applies custom className", () => {
			const { container } = render(
				<Card className="custom-card">Content</Card>,
			);
			const card = container.firstChild;
			expect(card).toHaveClass("custom-card");
		});
	});

	describe("CardHeader", () => {
		it("renders header with content", () => {
			render(<CardHeader>Header content</CardHeader>);
			expect(screen.getByText("Header content")).toBeInTheDocument();
		});

		it("applies header classes", () => {
			const { container } = render(<CardHeader>Header</CardHeader>);
			const header = container.firstChild;
			expect(header).toHaveClass("flex");
			expect(header).toHaveClass("flex-col");
			expect(header).toHaveClass("p-6");
		});
	});

	describe("CardTitle", () => {
		it("renders title text", () => {
			render(<CardTitle>Card Title</CardTitle>);
			expect(screen.getByText("Card Title")).toBeInTheDocument();
		});

		it("renders as h3 element", () => {
			render(<CardTitle>Title</CardTitle>);
			const heading = screen.getByText("Title");
			expect(heading.tagName).toBe("H3");
		});

		it("applies title classes", () => {
			render(<CardTitle>Title</CardTitle>);
			const title = screen.getByText("Title");
			expect(title).toHaveClass("font-semibold");
			expect(title).toHaveClass("tracking-tight");
		});
	});

	describe("CardDescription", () => {
		it("renders description text", () => {
			render(<CardDescription>This is a description</CardDescription>);
			expect(screen.getByText("This is a description")).toBeInTheDocument();
		});

		it("renders as paragraph element", () => {
			render(<CardDescription>Description</CardDescription>);
			const paragraph = screen.getByText("Description");
			expect(paragraph.tagName).toBe("P");
		});

		it("applies description classes", () => {
			render(<CardDescription>Description</CardDescription>);
			const description = screen.getByText("Description");
			expect(description).toHaveClass("text-sm");
			expect(description).toHaveClass("text-muted-foreground");
		});
	});

	describe("CardContent", () => {
		it("renders content with children", () => {
			render(<CardContent>Main content here</CardContent>);
			expect(screen.getByText("Main content here")).toBeInTheDocument();
		});

		it("applies content padding classes", () => {
			const { container } = render(<CardContent>Content</CardContent>);
			const content = container.firstChild;
			expect(content).toHaveClass("p-6");
			expect(content).toHaveClass("pt-0");
		});
	});

	describe("CardFooter", () => {
		it("renders footer with children", () => {
			render(<CardFooter>Footer content</CardFooter>);
			expect(screen.getByText("Footer content")).toBeInTheDocument();
		});

		it("applies footer classes", () => {
			const { container } = render(<CardFooter>Footer</CardFooter>);
			const footer = container.firstChild;
			expect(footer).toHaveClass("flex");
			expect(footer).toHaveClass("items-center");
			expect(footer).toHaveClass("p-6");
			expect(footer).toHaveClass("pt-0");
		});
	});

	describe("Card Composition", () => {
		it("renders complete card with all subcomponents", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Test Card</CardTitle>
						<CardDescription>This is a test card</CardDescription>
					</CardHeader>
					<CardContent>
						<p>Card body content</p>
					</CardContent>
					<CardFooter>
						<button type="button">Action</button>
					</CardFooter>
				</Card>,
			);

			expect(screen.getByText("Test Card")).toBeInTheDocument();
			expect(screen.getByText("This is a test card")).toBeInTheDocument();
			expect(screen.getByText("Card body content")).toBeInTheDocument();
			expect(screen.getByText("Action")).toBeInTheDocument();
		});
	});
});
