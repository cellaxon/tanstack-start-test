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
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
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

  }, [data, color, color2, height, label, label2, yMax]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}