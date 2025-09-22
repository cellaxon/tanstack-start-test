import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

interface D3RealtimeLineChartProps {
  data: any[];
  width?: number;
  height?: number;
  xKey?: string;
  yKey?: string;
  color?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showDots?: boolean;
  maxDataPoints?: number;
  transitionDuration?: number;
  maintainYScale?: boolean;
  minY?: number;
}

export function D3RealtimeLineChart({
  data,
  width = 600,
  height = 300,
  xKey = 'time',
  yKey = 'value',
  color = '#3b82f6',
  strokeWidth = 2,
  showGrid = true,
  showDots = false,
  maxDataPoints = 50,
  transitionDuration = 500,
  maintainYScale = false,
  minY = undefined
}: D3RealtimeLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>({});
  const previousDataRef = useRef<any[]>([]);
  const maxYValueRef = useRef<number>(0);

  // Initialize chart once
  useEffect(() => {
    if (!svgRef.current) return;

    const containerWidth = containerRef.current?.clientWidth || width;
    const actualWidth = Math.min(containerWidth, width);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerWidth = actualWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', actualWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .range([innerHeight, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%H:%M:%S') as any);

    const yAxis = d3.axisLeft(yScale);

    // Add grid
    if (showGrid) {
      const gridX = g.append('g')
        .attr('class', 'grid grid-x')
        .attr('transform', `translate(0,${innerHeight})`)
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      const gridY = g.append('g')
        .attr('class', 'grid grid-y')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      chartRef.current.gridX = gridX;
      chartRef.current.gridY = gridY;
    }

    // Add axes
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`);

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis');

    // Create line generator
    const line = d3.line<any>()
      .x(d => xScale(new Date(d[xKey])))
      .y(d => yScale(d[yKey]))
      .curve(d3.curveMonotoneX);

    // Add clip path for smooth transitions
    g.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Add line path
    const pathGroup = g.append('g')
      .attr('clip-path', 'url(#clip)');

    const path = pathGroup.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', strokeWidth);

    // Add dots group if needed
    let dotsGroup: any = null;
    if (showDots) {
      dotsGroup = pathGroup.append('g')
        .attr('class', 'dots');
    }

    // Store references
    chartRef.current = {
      ...chartRef.current,
      svg,
      g,
      xScale,
      yScale,
      xAxis,
      yAxis,
      xAxisGroup,
      yAxisGroup,
      line,
      path,
      dotsGroup,
      innerWidth,
      innerHeight
    };

  }, [width, height, color, strokeWidth, showGrid, showDots]);

  // Update chart with new data
  const updateChart = useCallback(() => {
    if (!chartRef.current.svg || !data || data.length === 0) return;

    const {
      xScale,
      yScale,
      xAxis,
      yAxis,
      xAxisGroup,
      yAxisGroup,
      line,
      path,
      dotsGroup,
      innerWidth,
      innerHeight,
      gridX,
      gridY
    } = chartRef.current;

    // Limit data points
    const limitedData = data.slice(-maxDataPoints);

    // Set up x-axis domain based on actual data range
    if (limitedData.length > 0) {
      const times = limitedData.map(d => {
        const time = d[xKey];
        return time instanceof Date ? time : new Date(time);
      }).filter(d => !isNaN(d.getTime()));

      if (times.length > 0) {
        const dataExtent = d3.extent(times) as [Date, Date];
        // Use exact data range without buffer
        xScale.domain(dataExtent);
      } else {
        const now = new Date();
        const startTime = new Date(now.getTime() - 120000); // Default 2 minutes window
        xScale.domain([startTime, now]);
      }
    } else {
      const now = new Date();
      const startTime = new Date(now.getTime() - 120000);
      xScale.domain([startTime, now]);
    }

    // Update y scale with maintained maximum if requested
    const currentMaxY = d3.max(limitedData, d => d[yKey]) as number || 0;

    // Maintain the maximum Y value if requested
    if (maintainYScale) {
      maxYValueRef.current = Math.max(maxYValueRef.current, currentMaxY);
    } else {
      maxYValueRef.current = currentMaxY;
    }

    const minYValue = minY !== undefined ? minY : (d3.min(limitedData, d => d[yKey]) * 0.9 || 0);
    const maxYValue = maxYValueRef.current * 1.1;

    yScale.domain([minYValue, maxYValue]).nice();

    // Update axes without transition
    xAxisGroup.call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
    yAxisGroup.call(yAxis);

    // Update grid
    if (gridX) {
      gridX.call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => ''));
    }

    if (gridY) {
      gridY.call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => ''));
    }

    // Update path without transition
    path
      .datum(limitedData)
      .attr('d', line);

    // Store current data for next update
    previousDataRef.current = [...limitedData];

    // Update dots if enabled
    if (dotsGroup && showDots) {
      const dots = dotsGroup.selectAll('.dot')
        .data(limitedData, (d: any) => d[xKey]);

      // Remove old dots
      dots.exit().remove();

      // Update existing dots
      dots
        .attr('cx', (d: any) => xScale(new Date(d[xKey])))
        .attr('cy', (d: any) => yScale(d[yKey]));

      // Add new dots
      dots.enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 3)
        .attr('fill', color)
        .attr('cx', (d: any) => xScale(new Date(d[xKey])))
        .attr('cy', (d: any) => yScale(d[yKey]));
    }

  }, [data, xKey, yKey, maxDataPoints, transitionDuration, showDots, color, maintainYScale, minY]);

  // Update chart when data changes
  useEffect(() => {
    updateChart();
  }, [updateChart]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}