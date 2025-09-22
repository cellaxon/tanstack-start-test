import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface BarDataPoint {
	label: string;
	value: number;
}

interface BarChartProps {
	data: BarDataPoint[];
	height?: number;
	color?: string;
	title?: string;
}

export function BarChart({
	data,
	height = 300,
	color = "#10b981",
	title,
}: BarChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || !data.length) return;

		const container = containerRef.current;
		const width = container.clientWidth;
		const margin = { top: 20, right: 30, bottom: 60, left: 50 };
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		d3.select(container).selectAll("*").remove();

		const svg = d3
			.select(container)
			.append("svg")
			.attr("width", width)
			.attr("height", height);

		const g = svg
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const xScale = d3
			.scaleBand()
			.domain(data.map((d) => d.label))
			.range([0, innerWidth])
			.padding(0.1);

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value) as number])
			.range([innerHeight, 0]);

		g.append("g")
			.attr("transform", `translate(0,${innerHeight})`)
			.call(d3.axisBottom(xScale))
			.selectAll("text")
			.attr("transform", "rotate(-45)")
			.style("text-anchor", "end");

		g.append("g").call(d3.axisLeft(yScale));

		// Add bars first with animation
		g.selectAll(".bar")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", (d) => xScale(d.label) as number)
			.attr("width", xScale.bandwidth())
			.attr("y", innerHeight)
			.attr("height", 0)
			.attr("fill", color)
			.transition()
			.duration(800)
			.attr("y", (d) => yScale(d.value))
			.attr("height", (d) => innerHeight - yScale(d.value));

		// Add crosshair and tooltip
		const crosshairGroup = g.append("g").style("display", "none");

		// Vertical line
		const verticalLine = crosshairGroup
			.append("line")
			.attr("y1", 0)
			.attr("y2", innerHeight)
			.attr("stroke", "#999")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "3,3")
			.style("pointer-events", "none");

		// Horizontal line
		const horizontalLine = crosshairGroup
			.append("line")
			.attr("x1", 0)
			.attr("x2", innerWidth)
			.attr("stroke", "#999")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "3,3")
			.style("pointer-events", "none");

		// Tooltip
		const tooltip = g
			.append("g")
			.style("display", "none")
			.style("pointer-events", "none");

		const tooltipBg = tooltip
			.append("rect")
			.attr("fill", "rgba(0, 0, 0, 0.8)")
			.attr("rx", 4)
			.attr("ry", 4);

		const tooltipText = tooltip
			.append("text")
			.attr("fill", "white")
			.attr("font-size", "12px");

		// Create overlay for mouse events
		g.append("rect")
			.attr("width", innerWidth)
			.attr("height", innerHeight)
			.attr("fill", "none")
			.attr("pointer-events", "all")
			.on("mousemove", (event) => {
				const [mouseX, mouseY] = d3.pointer(event);

				// Find which bar we're hovering over
				let hoveredBar: BarDataPoint | null = null;
				let hoveredData: {
					x: number;
					y: number;
					label: string;
					value: number;
				} | null = null;

				for (const d of data) {
					const x = xScale(d.label) as number;
					const width = xScale.bandwidth();
					if (mouseX >= x && mouseX <= x + width) {
						hoveredBar = d;
						hoveredData = {
							x: x + width / 2,
							y: yScale(d.value),
							label: d.label,
							value: d.value,
						};
					}
				}

				if (!hoveredData) {
					crosshairGroup.style("display", "none");
					tooltip.style("display", "none");
					return;
				}

				// Type guard to ensure hoveredData is not null
				const currentHoveredData = hoveredData as {
					x: number;
					y: number;
					label: string;
					value: number;
				};

				// Update crosshair position
				verticalLine
					.attr("x1", currentHoveredData.x)
					.attr("x2", currentHoveredData.x);
				horizontalLine.attr("y1", mouseY).attr("y2", mouseY);

				// Highlight the hovered bar
				g.selectAll(".bar").attr("opacity", (d) =>
					(d as BarDataPoint) === hoveredBar ? 0.8 : 0.5,
				);

				// Update tooltip content
				const tooltipContent = [
					`항목: ${currentHoveredData.label}`,
					`값: ${currentHoveredData.value.toLocaleString()}`,
				];

				// Clear and add new text
				tooltipText.selectAll("*").remove();
				tooltipText
					.selectAll("tspan")
					.data(tooltipContent)
					.enter()
					.append("tspan")
					.attr("x", 0)
					.attr("dy", (_d, i) => (i === 0 ? 0 : "1.2em"))
					.text((d) => d);

				// Calculate tooltip dimensions
				const padding = 8;
				const lineHeight = 14;
				const maxTextWidth = Math.max(
					...tooltipContent.map((text) => text.length * 6),
				);
				const tooltipWidth = maxTextWidth + padding * 2;
				const tooltipHeight = tooltipContent.length * lineHeight + padding * 2;

				// Position tooltip
				let tooltipX = currentHoveredData.x + 10;
				let tooltipY = currentHoveredData.y - tooltipHeight / 2;

				if (tooltipX + tooltipWidth > innerWidth) {
					tooltipX = currentHoveredData.x - tooltipWidth - 10;
				}

				if (tooltipY < 0) {
					tooltipY = 0;
				} else if (tooltipY + tooltipHeight > innerHeight) {
					tooltipY = innerHeight - tooltipHeight;
				}

				// Update tooltip background
				tooltipBg
					.attr("x", -padding / 2)
					.attr("y", -padding - 2)
					.attr("width", tooltipWidth)
					.attr("height", tooltipHeight);

				// Update tooltip position
				tooltip.attr(
					"transform",
					`translate(${tooltipX}, ${tooltipY + padding})`,
				);
				tooltipText.attr("x", padding / 2).attr("y", padding);

				crosshairGroup.style("display", "block");
				tooltip.style("display", "block");
			})
			.on("mouseout", () => {
				// Reset bar opacity
				g.selectAll(".bar").attr("opacity", 1);
				crosshairGroup.style("display", "none");
				tooltip.style("display", "none");
			});
	}, [data, height, color]);

	return (
		<div>
			{title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
			<div ref={containerRef} style={{ width: "100%", height }} />
		</div>
	);
}
