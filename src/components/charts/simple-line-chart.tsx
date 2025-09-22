import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface SimpleLineChartProps {
	data: { label: string; value: number; value2?: number }[];
	label?: string;
	label2?: string;
	color?: string;
	color2?: string;
	height?: number;
	yMax?: number;
}

export function SimpleLineChart({
	data,
	label = "Value",
	label2,
	color = "#3b82f6",
	color2 = "#f59e0b",
	height = 300,
	yMax,
}: SimpleLineChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<any>(null);
	const chartRef = useRef<any>({});
	const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

	// Initialize tooltip once
	useEffect(() => {
		if (!tooltipRef.current) {
			tooltipRef.current = d3.select('body')
				.append('div')
				.attr('class', 'd3-simple-line-tooltip')
				.style('position', 'absolute')
				.style('background', 'rgba(0, 0, 0, 0.85)')
				.style('color', 'white')
				.style('padding', '10px 14px')
				.style('border-radius', '6px')
				.style('font-size', '12px')
				.style('pointer-events', 'none')
				.style('opacity', 0)
				.style('z-index', '10000')
				.style('white-space', 'nowrap')
				.style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.3)')
				.style('line-height', '1.5');
		}

		return () => {
			// Clean up tooltip on unmount
			if (tooltipRef.current) {
				tooltipRef.current.remove();
				tooltipRef.current = null;
			}
		};
	}, []);

	// Initialize and update chart
	useEffect(() => {
		if (!containerRef.current || !data.length) return;

		const container = containerRef.current;
		const width = container.clientWidth;
		const margin = { top: 20, right: 30, bottom: 60, left: 50 };
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Clear previous chart
		d3.select(container).selectAll("*").remove();

		const svg = d3
			.select(container)
			.append("svg")
			.attr("width", width)
			.attr("height", height);

		const g = svg
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Scales
		const xScale = d3
			.scalePoint()
			.domain(data.map((d) => d.label))
			.range([0, innerWidth])
			.padding(0.1);

		const maxValue =
			yMax || d3.max(data, (d) => Math.max(d.value, d.value2 || 0)) || 0;
		const yScale = d3
			.scaleLinear()
			.domain([0, yMax ? yMax : maxValue * 1.1])
			.range([innerHeight, 0]);

		// Grid lines
		g.append('g')
			.attr('class', 'grid grid-y')
			.call(d3.axisLeft(yScale)
				.tickSize(-innerWidth)
				.tickFormat(() => ''))
			.style('stroke-dasharray', '3,3')
			.style('opacity', 0.3);

		// X axis
		const xAxis = g.append("g")
			.attr('class', 'x-axis')
			.attr("transform", `translate(0,${innerHeight})`)
			.call(d3.axisBottom(xScale));

		xAxis.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-45)");

		// Y axis
		g.append("g")
			.attr('class', 'y-axis')
			.call(d3.axisLeft(yScale));

		// Line generator
		const line = d3
			.line<{ label: string; value: number }>()
			.x((d) => xScale(d.label) || 0)
			.y((d) => yScale(d.value))
			.curve(d3.curveMonotoneX);

		// Draw first line
		g.append("path")
			.datum(data)
			.attr('class', 'line line-1')
			.attr("fill", "none")
			.attr("stroke", color)
			.attr("stroke-width", 2)
			.attr("d", line);

		// Draw second line if data exists
		if (label2 && data.some((d) => d.value2 !== undefined)) {
			const line2 = d3
				.line<{ label: string; value: number; value2?: number }>()
				.x((d) => xScale(d.label) || 0)
				.y((d) => yScale(d.value2 || 0))
				.curve(d3.curveMonotoneX);

			g.append("path")
				.datum(data.filter((d) => d.value2 !== undefined))
				.attr('class', 'line line-2')
				.attr("fill", "none")
				.attr("stroke", color2)
				.attr("stroke-width", 2)
				.attr("d", line2);
		}

		// Add legend if we have two lines
		if (label2) {
			const legend = g
				.append("g")
				.attr('class', 'legend')
				.attr("font-family", "sans-serif")
				.attr("font-size", 10)
				.attr("text-anchor", "end")
				.selectAll("g")
				.data([label, label2])
				.enter()
				.append("g")
				.attr("transform", (_d, i) => `translate(0,${i * 20})`);

			legend
				.append("rect")
				.attr("x", innerWidth - 19)
				.attr("width", 19)
				.attr("height", 3)
				.attr("fill", (_d, i) => (i === 0 ? color : color2));

			legend
				.append("text")
				.attr("x", innerWidth - 24)
				.attr("y", 1.5)
				.attr("dy", "0.32em")
				.text((d) => d);
		}

		// Create crosshair group
		const crosshair = g.append('g')
			.attr('class', 'crosshair')
			.style('display', 'none');

		// Vertical line
		crosshair.append('line')
			.attr('class', 'crosshair-x')
			.attr('y1', 0)
			.attr('y2', innerHeight)
			.style('stroke', '#999')
			.style('stroke-width', 1)
			.style('stroke-dasharray', '3,3')
			.style('opacity', 0.7);

		// Horizontal line for first series
		crosshair.append('line')
			.attr('class', 'crosshair-y1')
			.attr('x1', 0)
			.attr('x2', innerWidth)
			.style('stroke', color)
			.style('stroke-width', 1)
			.style('stroke-dasharray', '3,3')
			.style('opacity', 0.7);

		// Horizontal line for second series (if exists)
		if (label2) {
			crosshair.append('line')
				.attr('class', 'crosshair-y2')
				.attr('x1', 0)
				.attr('x2', innerWidth)
				.style('stroke', color2)
				.style('stroke-width', 1)
				.style('stroke-dasharray', '3,3')
				.style('opacity', 0.7);
		}

		// Focus circles
		const focusCircle1 = g.append('circle')
			.attr('class', 'focus-circle-1')
			.attr('r', 4)
			.attr('fill', color)
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.style('display', 'none');

		const focusCircle2 = g.append('circle')
			.attr('class', 'focus-circle-2')
			.attr('r', 4)
			.attr('fill', color2)
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.style('display', 'none');

		// Store chart references
		chartRef.current = {
			g,
			xScale,
			yScale,
			crosshair,
			focusCircle1,
			focusCircle2,
			innerWidth,
			innerHeight
		};

		// Mouse tracking rectangle
		const mouseOverlay = g.append('rect')
			.attr('class', 'mouse-overlay')
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.style('fill', 'none')
			.style('pointer-events', 'all');

		// Mouse event handlers function
		const updateMouseHandlers = () => {
			mouseOverlay
				.on('mousemove', function(event) {
					if (!data || data.length === 0) return;

					const [mouseX, mouseY] = d3.pointer(event);

					// Store mouse position
					mousePositionRef.current = { x: mouseX, y: mouseY };

					// Find closest data point
					const xPositions = data.map((d) => xScale(d.label) || 0);
					let closestIndex = 0;
					let minDistance = Math.abs(xPositions[0] - mouseX);

					for (let i = 1; i < xPositions.length; i++) {
						const distance = Math.abs(xPositions[i] - mouseX);
						if (distance < minDistance) {
							minDistance = distance;
							closestIndex = i;
						}
					}

					const d = data[closestIndex];
					if (!d) return;

					const xPos = xScale(d.label) || 0;
					const yPos1 = yScale(d.value);
					const yPos2 = d.value2 !== undefined ? yScale(d.value2) : null;

					// Update crosshair
					crosshair.style('display', null);
					crosshair.select('.crosshair-x')
						.attr('x1', xPos)
						.attr('x2', xPos);

					crosshair.select('.crosshair-y1')
						.attr('y1', yPos1)
						.attr('y2', yPos1);

					if (yPos2 !== null && label2) {
						crosshair.select('.crosshair-y2')
							.attr('y1', yPos2)
							.attr('y2', yPos2);
					}

					// Update focus circles
					focusCircle1
						.style('display', null)
						.attr('cx', xPos)
						.attr('cy', yPos1);

					if (yPos2 !== null && label2) {
						focusCircle2
							.style('display', null)
							.attr('cx', xPos)
							.attr('cy', yPos2);
					} else {
						focusCircle2.style('display', 'none');
					}

					// Update tooltip
					if (tooltipRef.current) {
						tooltipRef.current.transition().duration(100).style('opacity', 0.95);

						let tooltipHtml = `<div style="font-weight: bold; margin-bottom: 5px;">${d.label}</div>`;
						tooltipHtml += `<div style="color: ${color}">● ${label}: ${d.value.toFixed(2)}</div>`;
						if (label2 && d.value2 !== undefined) {
							tooltipHtml += `<div style="color: ${color2}">● ${label2}: ${d.value2.toFixed(2)}</div>`;
						}

						tooltipRef.current
							.html(tooltipHtml)
							.style('left', `${(event as any).pageX + 15}px`)
							.style('top', `${(event as any).pageY - 35}px`);
					}
				})
				.on('mouseout', function() {
					// Clear mouse position
					mousePositionRef.current = null;

					// Hide crosshair and focus circles
					crosshair.style('display', 'none');
					focusCircle1.style('display', 'none');
					focusCircle2.style('display', 'none');

					// Hide tooltip
					if (tooltipRef.current) {
						tooltipRef.current.transition().duration(200).style('opacity', 0);
					}
				});
		};

		// Set up initial mouse handlers
		updateMouseHandlers();

		// Auto-update crosshair and tooltip if mouse is over the chart
		const checkAndUpdatePosition = () => {
			if (mousePositionRef.current && chartRef.current.g) {
				const { x: mouseX } = mousePositionRef.current;

				// Find closest data point
				const xPositions = data.map((d) => xScale(d.label) || 0);
				let closestIndex = 0;
				let minDistance = Math.abs(xPositions[0] - mouseX);

				for (let i = 1; i < xPositions.length; i++) {
					const distance = Math.abs(xPositions[i] - mouseX);
					if (distance < minDistance) {
						minDistance = distance;
						closestIndex = i;
					}
				}

				const d = data[closestIndex];
				if (d) {
					const xPos = xScale(d.label) || 0;
					const yPos1 = yScale(d.value);
					const yPos2 = d.value2 !== undefined ? yScale(d.value2) : null;

					// Update crosshair
					crosshair.style('display', null);
					crosshair.select('.crosshair-x')
						.attr('x1', xPos)
						.attr('x2', xPos);

					crosshair.select('.crosshair-y1')
						.attr('y1', yPos1)
						.attr('y2', yPos1);

					if (yPos2 !== null && label2) {
						crosshair.select('.crosshair-y2')
							.attr('y1', yPos2)
							.attr('y2', yPos2);
					}

					// Update focus circles
					focusCircle1
						.style('display', null)
						.attr('cx', xPos)
						.attr('cy', yPos1);

					if (yPos2 !== null && label2) {
						focusCircle2
							.style('display', null)
							.attr('cx', xPos)
							.attr('cy', yPos2);
					} else {
						focusCircle2.style('display', 'none');
					}

					// Update tooltip content only (position stays with mouse)
					if (tooltipRef.current) {
						let tooltipHtml = `<div style="font-weight: bold; margin-bottom: 5px;">${d.label}</div>`;
						tooltipHtml += `<div style="color: ${color}">● ${label}: ${d.value.toFixed(2)}</div>`;
						if (label2 && d.value2 !== undefined) {
							tooltipHtml += `<div style="color: ${color2}">● ${label2}: ${d.value2.toFixed(2)}</div>`;
						}
						tooltipRef.current.html(tooltipHtml);
					}
				}
			}
		};

		// Call position update after data changes
		checkAndUpdatePosition();

	}, [data, color, color2, height, label, label2, yMax]);

	return <div ref={containerRef} style={{ width: "100%", height }} />;
}