import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

interface D3RealtimeAreaChartProps {
  data: any[];
  width?: number;
  height?: number;
  xKey?: string;
  yKeys?: string[];
  colors?: string[];
  stacked?: boolean;
  showGrid?: boolean;
  maxDataPoints?: number;
  transitionDuration?: number;
}

export function D3RealtimeAreaChart({
  data,
  width = 600,
  height = 300,
  xKey = 'time',
  yKeys = ['value'],
  colors = ['#10b981', '#f59e0b', '#ef4444'],
  stacked = false,
  showGrid = true,
  maxDataPoints = 50,
  transitionDuration = 500
}: D3RealtimeAreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>({});
  const previousDataRef = useRef<any[]>([]);

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

    // Add clip path for smooth transitions
    g.append('defs').append('clipPath')
      .attr('id', 'clip-area')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Add areas group
    const areasGroup = g.append('g')
      .attr('clip-path', 'url(#clip-area)');

    // Store references
    chartRef.current = {
      svg,
      g,
      xScale,
      yScale,
      xAxis,
      yAxis,
      xAxisGroup,
      yAxisGroup,
      areasGroup,
      innerWidth,
      innerHeight,
      gridX: chartRef.current.gridX,
      gridY: chartRef.current.gridY
    };

  }, [width, height, showGrid]);

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
      areasGroup,
      innerWidth,
      innerHeight,
      gridX,
      gridY
    } = chartRef.current;

    // Limit data points
    const limitedData = data.slice(-maxDataPoints);

    // Check if new data was added
    const hasNewData = limitedData.length > 0 &&
                      previousDataRef.current.length > 0 &&
                      limitedData[limitedData.length - 1] !== previousDataRef.current[previousDataRef.current.length - 1];

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
        const startTime = new Date(now.getTime() - 120000);
        xScale.domain([startTime, now]);
      }
    } else {
      const now = new Date();
      const startTime = new Date(now.getTime() - 120000);
      xScale.domain([startTime, now]);
    }

    if (stacked) {
      // For stacked area chart
      const stack = d3.stack()
        .keys(yKeys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stackedData = stack(limitedData);

      yScale.domain([
        0,
        d3.max(stackedData, layer => d3.max(layer, d => d[1])) as number
      ]).nice();

      // Update or create areas
      const areas = areasGroup.selectAll('.area')
        .data(stackedData, (d: any) => d.key);

      // Area generator
      const area = d3.area<any>()
        .x(d => xScale(new Date(d.data[xKey])))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      // Remove old areas
      areas.exit().remove();

      // Update existing areas without transition
      areas.attr('d', area);

      // Add new areas
      areas.enter()
        .append('path')
        .attr('class', 'area')
        .attr('fill', (d, i) => colors[i % colors.length])
        .attr('opacity', 0.7)
        .attr('d', area);

    } else {
      // For non-stacked area chart
      const maxValue = d3.max(limitedData, d => Math.max(...yKeys.map(key => d[key]))) as number;
      yScale.domain([0, maxValue * 1.1]).nice();

      yKeys.forEach((key, index) => {
        const areaId = `area-${key}`;
        let areaPath = areasGroup.select(`#${areaId}`);

        // Area generator
        const area = d3.area<any>()
          .x(d => xScale(new Date(d[xKey])))
          .y0(innerHeight)
          .y1(d => yScale(d[key]))
          .curve(d3.curveMonotoneX);

        if (areaPath.empty()) {
          // Create new area
          areaPath = areasGroup.append('path')
            .attr('id', areaId)
            .attr('class', 'area')
            .attr('fill', colors[index % colors.length])
            .attr('opacity', 0.3);

          // Also add line on top
          areasGroup.append('path')
            .attr('id', `line-${key}`)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', colors[index % colors.length])
            .attr('stroke-width', 2);
        }

        // Update area without transition
        areaPath
          .datum(limitedData)
          .attr('d', area);

        // Update line
        const line = d3.line<any>()
          .x(d => xScale(new Date(d[xKey])))
          .y(d => yScale(d[key]))
          .curve(d3.curveMonotoneX);

        const linePath = areasGroup.select(`#line-${key}`);

        // Update line without transition
        linePath
          .datum(limitedData)
          .attr('d', line);
      });
    }

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

    // Store current data for next update
    previousDataRef.current = [...limitedData];

  }, [data, xKey, yKeys, colors, stacked, maxDataPoints, transitionDuration]);

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