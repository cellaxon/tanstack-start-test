import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

interface SimpleLineChartProps {
  data: { label: string; value: number; value2?: number }[];
  label?: string;
  label2?: string;
  color?: string;
  color2?: string;
  height?: number;
  yMax?: number;  // Optional max value for Y axis
}

export function SimpleLineChart({
  data,
  label = 'Value',
  label2,
  color = '#3b82f6',
  color2 = '#f59e0b',
  height = 300,
  yMax,
}: SimpleLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };  // Increased bottom margin for time labels
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scalePoint()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const maxValue = yMax || d3.max(data, d => Math.max(d.value, d.value2 || 0)) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, yMax ? yMax : maxValue * 1.1])
      .range([innerHeight, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Line generator
    const line = d3.line<{ label: string; value: number }>()
      .x(d => xScale(d.label) || 0)
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw first line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Draw second line if data exists
    if (label2 && data.some(d => d.value2 !== undefined)) {
      const line2 = d3.line<{ label: string; value: number; value2?: number }>()
        .x(d => xScale(d.label) || 0)
        .y(d => yScale(d.value2 || 0))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data.filter(d => d.value2 !== undefined))
        .attr('fill', 'none')
        .attr('stroke', color2)
        .attr('stroke-width', 2)
        .attr('d', line2);
    }

    // Add legend if we have two lines
    if (label2) {
      const legend = g.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data([label, label2])
        .enter().append('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);

      legend.append('rect')
        .attr('x', innerWidth - 19)
        .attr('width', 19)
        .attr('height', 3)
        .attr('fill', (d, i) => i === 0 ? color : color2);

      legend.append('text')
        .attr('x', innerWidth - 24)
        .attr('y', 1.5)
        .attr('dy', '0.32em')
        .text(d => d);
    }

    // Add crosshair and tooltip
    const crosshairGroup = g.append('g')
      .style('display', 'none');

    // Vertical line
    const verticalLine = crosshairGroup.append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('pointer-events', 'none');

    // Horizontal line
    const horizontalLine = crosshairGroup.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('pointer-events', 'none');

    // Tooltip background
    const tooltipBg = crosshairGroup.append('rect')
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('rx', 4)
      .attr('ry', 4);

    // Tooltip text group
    const tooltipTextGroup = crosshairGroup.append('g');

    // Focus circles to highlight current points
    const focusCircle1 = crosshairGroup.append('circle')
      .attr('r', 4)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    const focusCircle2 = crosshairGroup.append('circle')
      .attr('r', 4)
      .attr('fill', color2)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('display', label2 ? 'block' : 'none');

    // Create overlay for mouse events
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mouseX, mouseY] = d3.pointer(event);

        // Find closest data point
        const xPositions = data.map(d => xScale(d.label) || 0);
        const closestIndex = xPositions.reduce((prev, curr, index) => {
          return Math.abs(curr - mouseX) < Math.abs(xPositions[prev] - mouseX) ? index : prev;
        }, 0);

        const closestData = data[closestIndex];
        const xPos = xScale(closestData.label) || 0;
        const yPos1 = yScale(closestData.value);
        const yPos2 = closestData.value2 !== undefined ? yScale(closestData.value2) : 0;

        // Update crosshair position
        verticalLine.attr('x1', xPos).attr('x2', xPos);
        horizontalLine.attr('y1', mouseY).attr('y2', mouseY);

        // Update focus circles position
        focusCircle1.attr('cx', xPos).attr('cy', yPos1);

        if (label2 && closestData.value2 !== undefined) {
          focusCircle2
            .attr('cx', xPos)
            .attr('cy', yPos2)
            .style('display', 'block');
        } else {
          focusCircle2.style('display', 'none');
        }

        // Prepare tooltip text
        const tooltipTexts = [
          closestData.label,
          `${label}: ${closestData.value.toFixed(2)}`
        ];

        if (label2 && closestData.value2 !== undefined) {
          tooltipTexts.push(`${label2}: ${closestData.value2.toFixed(2)}`);
        }

        // Clear previous text
        tooltipTextGroup.selectAll('*').remove();

        // Add tooltip text
        const textElements = tooltipTextGroup.selectAll('text')
          .data(tooltipTexts)
          .enter()
          .append('text')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('x', 0)
          .attr('y', (d, i) => i * 16)
          .text(d => d);

        // Calculate tooltip dimensions
        const padding = 8;
        const maxTextWidth = Math.max(...tooltipTexts.map(text => text.length * 6));
        const tooltipWidth = maxTextWidth + padding * 2;
        const tooltipHeight = tooltipTexts.length * 16 + padding;

        // Position tooltip (avoid edge overflow)
        let tooltipX = xPos + 10;
        let tooltipY = mouseY - tooltipHeight / 2;

        if (tooltipX + tooltipWidth > innerWidth) {
          tooltipX = xPos - tooltipWidth - 10;
        }

        if (tooltipY < 0) {
          tooltipY = 0;
        } else if (tooltipY + tooltipHeight > innerHeight) {
          tooltipY = innerHeight - tooltipHeight;
        }

        // Update tooltip background
        tooltipBg
          .attr('x', tooltipX - padding / 2)
          .attr('y', tooltipY - padding / 2)
          .attr('width', tooltipWidth)
          .attr('height', tooltipHeight);

        // Update tooltip text position
        tooltipTextGroup.attr('transform', `translate(${tooltipX + padding / 2}, ${tooltipY + padding / 2 + 10})`);

        crosshairGroup.style('display', 'block');
      })
      .on('mouseout', function() {
        crosshairGroup.style('display', 'none');
      });

  }, [data, color, color2, height, label, label2, yMax]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}