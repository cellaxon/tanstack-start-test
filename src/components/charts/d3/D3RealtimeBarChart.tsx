import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

interface D3RealtimeBarChartProps {
  data: any[];
  width?: number;
  height?: number;
  xKey?: string;
  yKey?: string;
  color?: string | string[];
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  maxDataPoints?: number;
  transitionDuration?: number;
  maintainYScale?: boolean;
  yLabel?: string;
  formatValue?: (value: number) => string;
}

export function D3RealtimeBarChart({
  data,
  width = 600,
  height = 300,
  xKey = 'name',
  yKey = 'value',
  color = '#3b82f6',
  layout = 'vertical',
  showGrid = true,
  maxDataPoints = 20,
  transitionDuration = 500,
  maintainYScale = false,
  yLabel,
  formatValue = (v) => v.toFixed(2)
}: D3RealtimeBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>({});
  const maxYValueRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const tooltipRef = useRef<any>(null);

  // Initialize chart once
  useEffect(() => {
    if (!svgRef.current) return;

    const containerWidth = containerRef.current?.clientWidth || 600;
    const actualWidth = Math.min(containerWidth, width);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = {
      top: 20,
      right: 30,
      bottom: 80,
      left: layout === 'horizontal' ? 150 : 60
    };
    const innerWidth = actualWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', actualWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid groups
    if (showGrid) {
      const gridX = g.append('g')
        .attr('class', 'grid grid-x')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      const gridY = g.append('g')
        .attr('class', 'grid grid-y')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      chartRef.current.gridX = gridX;
      chartRef.current.gridY = gridY;
    }

    // Add axes groups
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis');

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis');

    // Add bars group
    const barsGroup = g.append('g')
      .attr('class', 'bars');

    // Y axis label
    if (yLabel && layout === 'vertical') {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (innerHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(yLabel);
    }

    // Tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body').append('div')
        .attr('class', 'chart-tooltip-realtime-bar')
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
        .style('z-index', '1000');
    }

    // Store references
    chartRef.current = {
      ...chartRef.current,
      svg,
      g,
      xAxisGroup,
      yAxisGroup,
      barsGroup,
      innerWidth,
      innerHeight
    };

  }, [width, height, layout, showGrid, yLabel]);

  // Update chart with new data
  const updateChart = useCallback(() => {
    if (!chartRef.current.svg) return;

    console.log('D3RealtimeBarChart data:', data);

    // Handle empty data
    if (!data || data.length === 0) {
      console.log('D3RealtimeBarChart: No data to display');
      chartRef.current.barsGroup?.selectAll('.bar').remove();
      return;
    }

    const {
      g,
      xAxisGroup,
      yAxisGroup,
      barsGroup,
      innerWidth,
      innerHeight,
      gridX,
      gridY
    } = chartRef.current;

    // Limit data points
    const limitedData = data.slice(-maxDataPoints);

    if (layout === 'vertical') {
      // Vertical bar chart
      const xScale = d3.scaleBand()
        .domain(limitedData.map(d => d[xKey]))
        .range([0, innerWidth])
        .padding(0.1);

      // Calculate Y scale domain
      const currentMaxY = d3.max(limitedData, d => d[yKey]) as number || 0;

      // Maintain the maximum Y value if requested
      if (maintainYScale) {
        maxYValueRef.current = Math.max(maxYValueRef.current, currentMaxY);
      } else {
        maxYValueRef.current = currentMaxY;
      }

      const yScale = d3.scaleLinear()
        .domain([0, maxYValueRef.current * 1.1]) // Add 10% padding
        .nice()
        .range([innerHeight, 0]);

      // Update axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      xAxisGroup
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      yAxisGroup.call(yAxis);

      // Update grid
      if (gridY) {
        gridY.call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => ''));
      }

      // Update bars with data join
      const bars = barsGroup.selectAll('.bar')
        .data(limitedData, (d: any) => d[xKey]);

      // Exit - remove old bars with transition
      bars.exit()
        .transition()
        .duration(transitionDuration / 2)
        .attr('y', innerHeight)
        .attr('height', 0)
        .style('opacity', 0.3)
        .remove();

      // Update - transition existing bars
      bars
        .transition()
        .duration(transitionDuration)
        .attr('x', d => xScale(d[xKey]) as number)
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d[yKey]))
        .attr('height', d => innerHeight - yScale(d[yKey]))
        .attr('fill', (d, i) => Array.isArray(color) ? color[i % color.length] : color);

      // Enter - add new bars with transition
      const newBars = bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d[xKey]) as number)
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', (d, i) => Array.isArray(color) ? color[i % color.length] : color)
        .style('opacity', 0.8)
        .style('cursor', 'pointer');

      newBars
        .transition()
        .duration(transitionDuration)
        .attr('y', d => yScale(d[yKey]))
        .attr('height', d => innerHeight - yScale(d[yKey]))
        .style('opacity', 1);

      // Add mouse events to all bars
      barsGroup.selectAll('.bar')
        .on('mouseover', function(event, d: any) {
          // Highlight the bar
          d3.select(this)
            .transition()
            .duration(100)
            .style('opacity', 1)
            .attr('filter', 'brightness(1.2)');

          // Show tooltip
          if (tooltipRef.current) {
            const value = formatValue(d[yKey]);
            const label = d[xKey];

            tooltipRef.current.transition().duration(100).style('opacity', 0.95);
            tooltipRef.current.html(`
              <div style="font-weight: bold; margin-bottom: 5px;">${label}</div>
              <div style="color: ${Array.isArray(color) ? color[0] : color}">● ${yLabel || yKey}: ${value}</div>
            `)
              .style('left', (event.pageX + 15) + 'px')
              .style('top', (event.pageY - 35) + 'px');
          }
        })
        .on('mouseout', function() {
          // Remove highlight
          d3.select(this)
            .transition()
            .duration(100)
            .style('opacity', 1)
            .attr('filter', 'none');

          // Hide tooltip
          if (tooltipRef.current) {
            tooltipRef.current.transition().duration(200).style('opacity', 0);
          }
        });

    } else {
      // Horizontal bar chart
      // Calculate X scale domain for horizontal layout
      const currentMaxX = d3.max(limitedData, d => d[yKey]) as number || 0;

      // Maintain the maximum X value if requested
      if (maintainYScale) {
        maxYValueRef.current = Math.max(maxYValueRef.current, currentMaxX);
      } else {
        maxYValueRef.current = currentMaxX;
      }

      const xScale = d3.scaleLinear()
        .domain([0, maxYValueRef.current * 1.1]) // Add 10% padding
        .nice()
        .range([0, innerWidth]);

      const yScale = d3.scaleBand()
        .domain(limitedData.map(d => d[xKey]))
        .range([0, innerHeight])
        .padding(0.1);

      // Update axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      xAxisGroup
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);

      yAxisGroup.call(yAxis);

      // Update grid
      if (gridX) {
        gridX
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat(() => ''));
      }

      // Update bars with data join
      const bars = barsGroup.selectAll('.bar')
        .data(limitedData, (d: any) => d[xKey]);

      // Exit - remove old bars with transition
      bars.exit()
        .transition()
        .duration(transitionDuration / 2)
        .attr('width', 0)
        .style('opacity', 0.3)
        .remove();

      // Update - transition existing bars
      bars
        .transition()
        .duration(transitionDuration)
        .attr('y', d => yScale(d[xKey]) as number)
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', d => xScale(d[yKey]))
        .attr('fill', (d, i) => Array.isArray(color) ? color[i % color.length] : color);

      // Enter - add new bars with transition
      const newBars = bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d[xKey]) as number)
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('fill', (d, i) => Array.isArray(color) ? color[i % color.length] : color)
        .style('opacity', 0.8)
        .style('cursor', 'pointer');

      newBars
        .transition()
        .duration(transitionDuration)
        .attr('width', d => xScale(d[yKey]))
        .style('opacity', 1);

      // Add mouse events to all bars
      barsGroup.selectAll('.bar')
        .on('mouseover', function(event, d: any) {
          // Highlight the bar
          d3.select(this)
            .transition()
            .duration(100)
            .style('opacity', 1)
            .attr('filter', 'brightness(1.2)');

          // Show tooltip
          if (tooltipRef.current) {
            const value = formatValue(d[yKey]);
            const label = d[xKey];

            tooltipRef.current.transition().duration(100).style('opacity', 0.95);
            tooltipRef.current.html(`
              <div style="font-weight: bold; margin-bottom: 5px;">${label}</div>
              <div style="color: ${Array.isArray(color) ? color[0] : color}">● ${yLabel || yKey}: ${value}</div>
            `)
              .style('left', (event.pageX + 15) + 'px')
              .style('top', (event.pageY - 35) + 'px');
          }
        })
        .on('mouseout', function() {
          // Remove highlight
          d3.select(this)
            .transition()
            .duration(100)
            .style('opacity', 1)
            .attr('filter', 'none');

          // Hide tooltip
          if (tooltipRef.current) {
            tooltipRef.current.transition().duration(200).style('opacity', 0);
          }
        });
    }

  }, [data, xKey, yKey, color, layout, maxDataPoints, transitionDuration, maintainYScale, yLabel, formatValue]);

  // Update chart when data changes
  useEffect(() => {
    updateChart();
  }, [updateChart]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (!svgRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth || 600;
      const actualWidth = Math.min(containerWidth, width);

      const svg = d3.select(svgRef.current);
      svg.attr('width', actualWidth);

      const margin = {
        top: 20,
        right: 30,
        bottom: 80,
        left: layout === 'horizontal' ? 150 : 60
      };
      const innerWidth = actualWidth - margin.left - margin.right;

      if (chartRef.current.g) {
        chartRef.current.innerWidth = innerWidth;

        // Update grid width if exists
        if (chartRef.current.gridY) {
          chartRef.current.gridY.call(d3.axisLeft(d3.scaleLinear())
            .tickSize(-innerWidth)
            .tickFormat(() => ''));
        }

        // Trigger chart update
        updateChart();
      }
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [width, layout, updateChart]);

  // Cleanup tooltip on unmount
  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}