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
  yLabel?: string;
  formatValue?: (value: number) => string;
}

export function D3RealtimeLineChart({
  data,
  width = 9999,
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
  minY = undefined,
  yLabel,
  formatValue = (v) => v.toFixed(2)
}: D3RealtimeLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>({});
  const previousDataRef = useRef<any[]>([]);
  const maxYValueRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const tooltipRef = useRef<any>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize chart once
  useEffect(() => {
    if (!svgRef.current) return;

    const containerWidth = containerRef.current?.clientWidth || 600;
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

    // Scales
    const xScale = d3.scaleTime()
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .range([innerHeight, 0]);

    // Grid
    const xGrid = g.append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0,${innerHeight})`);

    const yGrid = g.append('g')
      .attr('class', 'grid y-grid');

    // Axes
    const xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`);

    const yAxis = g.append('g')
      .attr('class', 'y-axis');

    // Y axis label
    if (yLabel) {
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

    // Line generator
    const line = d3.line<any>()
      .x(d => xScale(new Date(d[xKey])))
      .y(d => yScale(d[yKey]))
      .curve(d3.curveMonotoneX);

    // Path
    const path = g.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', strokeWidth);

    // Dots container
    const dotsContainer = g.append('g')
      .attr('class', 'dots-container');

    // Crosshair group
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

    // Horizontal line
    crosshair.append('line')
      .attr('class', 'crosshair-y')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .style('stroke', '#999')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.7);

    // Focus circle
    const focusCircle = g.append('circle')
      .attr('class', 'focus-circle')
      .attr('r', 5)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('display', 'none');

    // Tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body').append('div')
        .attr('class', 'chart-tooltip-realtime')
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

    // Invisible rect for mouse events
    const mouseRect = g.append('rect')
      .attr('class', 'mouse-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    // Store references
    chartRef.current = {
      svg,
      g,
      xScale,
      yScale,
      xAxis,
      yAxis,
      xGrid,
      yGrid,
      line,
      path,
      dotsContainer,
      innerWidth,
      innerHeight,
      actualWidth,
      crosshair,
      focusCircle,
      mouseRect
    };

    // Set up resize observer
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          if (newWidth > 0) {
            const newActualWidth = Math.min(newWidth, width);
            const newInnerWidth = newActualWidth - margin.left - margin.right;

            // Update dimensions
            svg.attr('width', newActualWidth);
            xScale.range([0, newInnerWidth]);

            // Update grid and axes
            if (showGrid) {
              xGrid.call(d3.axisBottom(xScale)
                .tickSize(-innerHeight)
                .tickFormat(() => ''))
                .style('stroke-dasharray', '3,3')
                .style('opacity', 0.3);
            }

            xAxis.call(d3.axisBottom(xScale)
              .tickFormat(d3.timeFormat('%H:%M:%S') as any));

            // Update mouse overlay
            mouseRect.attr('width', newInnerWidth);
            crosshair.select('.crosshair-y')
              .attr('x2', newInnerWidth);

            // Store new dimensions
            chartRef.current.innerWidth = newInnerWidth;
            chartRef.current.actualWidth = newActualWidth;
          }
        }
      });
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      // Don't remove tooltip as it might be shared
    };
  }, [width, height, xKey, yKey, color, strokeWidth, showGrid, yLabel]);

  // Update data function
  const updateChart = useCallback(() => {
    if (!chartRef.current.g || !data || data.length === 0) return;

    const {
      xScale,
      yScale,
      xAxis,
      yAxis,
      xGrid,
      yGrid,
      line,
      path,
      dotsContainer,
      innerWidth,
      innerHeight,
      crosshair,
      focusCircle,
      mouseRect
    } = chartRef.current;

    // Limit data points
    const limitedData = data.slice(-maxDataPoints);

    // Update scales
    const xExtent = d3.extent(limitedData, d => new Date(d[xKey])) as [Date, Date];
    xScale.domain(xExtent);

    // Calculate Y domain
    let yMin = minY !== undefined ? minY : 0;
    let yMax = d3.max(limitedData, d => d[yKey]) as number;

    if (maintainYScale) {
      maxYValueRef.current = Math.max(maxYValueRef.current, yMax);
      yMax = maxYValueRef.current;
    }

    yScale.domain([yMin, yMax * 1.1]); // Add 10% padding to top

    // Update axes with transition
    xAxis
      .transition()
      .duration(transitionDuration)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%H:%M:%S') as any));

    yAxis
      .transition()
      .duration(transitionDuration)
      .call(d3.axisLeft(yScale));

    // Update grid
    if (showGrid) {
      xGrid
        .transition()
        .duration(transitionDuration)
        .call(d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => ''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      yGrid
        .transition()
        .duration(transitionDuration)
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => ''))
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    }

    // Update line with transition
    path
      .datum(limitedData)
      .transition()
      .duration(transitionDuration)
      .attr('d', line);

    // Update dots
    if (showDots) {
      const dots = dotsContainer.selectAll('.dot')
        .data(limitedData, (d: any) => d[xKey]);

      dots.enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 3)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .attr('cx', d => xScale(new Date(d[xKey])))
        .attr('cy', d => yScale(d[yKey]))
        .style('opacity', 1);

      dots
        .transition()
        .duration(transitionDuration)
        .attr('cx', d => xScale(new Date(d[xKey])))
        .attr('cy', d => yScale(d[yKey]));

      dots.exit()
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
    }

    // Update mouse interactions
    const bisector = d3.bisector((d: any) => new Date(d[xKey])).left;

    const updateMouseHandlers = () => {
      mouseRect
        .on('mousemove', function(event) {
          if (limitedData.length === 0) return;

          const [mouseX, mouseY] = d3.pointer(event);

          // Store mouse position
          mousePositionRef.current = { x: mouseX, y: mouseY };

          const x0 = xScale.invert(mouseX);
          const index = bisector(limitedData, x0, 1);
          const d0 = limitedData[index - 1];
          const d1 = limitedData[index];

          if (!d0 && !d1) return;
          let d: any;
          if (!d0) d = d1;
          else if (!d1) d = d0;
          else {
            d = x0.getTime() - new Date(d0[xKey]).getTime() > new Date(d1[xKey]).getTime() - x0.getTime() ? d1 : d0;
          }

          if (d) {
            const xPos = xScale(new Date(d[xKey]));
            const yPos = yScale(d[yKey]);

            // Update crosshair
            crosshair.style('display', null);
            crosshair.select('.crosshair-x')
              .attr('x1', xPos)
              .attr('x2', xPos);
            crosshair.select('.crosshair-y')
              .attr('y1', yPos)
              .attr('y2', yPos);

            // Update focus circle
            focusCircle
              .style('display', null)
              .attr('cx', xPos)
              .attr('cy', yPos);

            // Update tooltip
            const timeStr = new Date(d[xKey]).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            if (tooltipRef.current) {
              tooltipRef.current.transition().duration(100).style('opacity', 0.95);
              tooltipRef.current.html(`
                <div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>
                <div style="color: ${color}">● ${yLabel || yKey}: ${formatValue(d[yKey])}</div>
              `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 35) + 'px');
            }
          }
        })
        .on('mouseout', () => {
          // Clear mouse position
          mousePositionRef.current = null;

          crosshair.style('display', 'none');
          focusCircle.style('display', 'none');
          if (tooltipRef.current) {
            tooltipRef.current.transition().duration(200).style('opacity', 0);
          }
        });
    };

    // Set up mouse handlers
    updateMouseHandlers();

    // Auto-update crosshair and tooltip if mouse is over the chart
    if (mousePositionRef.current && limitedData.length > 0) {
      const { x: mouseX } = mousePositionRef.current;
      const x0 = xScale.invert(mouseX);
      const index = bisector(limitedData, x0, 1);
      const d0 = limitedData[index - 1];
      const d1 = limitedData[index];

      if (d0 || d1) {
        let d: any;
        if (!d0) d = d1;
        else if (!d1) d = d0;
        else {
          d = x0.getTime() - new Date(d0[xKey]).getTime() > new Date(d1[xKey]).getTime() - x0.getTime() ? d1 : d0;
        }

        if (d) {
          const xPos = xScale(new Date(d[xKey]));
          const yPos = yScale(d[yKey]);

          // Update crosshair
          crosshair.style('display', null);
          crosshair.select('.crosshair-x')
            .attr('x1', xPos)
            .attr('x2', xPos);
          crosshair.select('.crosshair-y')
            .attr('y1', yPos)
            .attr('y2', yPos);

          // Update focus circle
          focusCircle
            .style('display', null)
            .attr('cx', xPos)
            .attr('cy', yPos);

          // Update tooltip content only
          if (tooltipRef.current) {
            const timeStr = new Date(d[xKey]).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            tooltipRef.current.html(`
              <div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>
              <div style="color: ${color}">● ${yLabel || yKey}: ${formatValue(d[yKey])}</div>
            `);
          }
        }
      }
    }

    previousDataRef.current = limitedData;
  }, [data, maxDataPoints, xKey, yKey, color, showGrid, showDots, transitionDuration, maintainYScale, minY, yLabel, formatValue]);

  // Update chart when data changes
  useEffect(() => {
    updateChart();
  }, [updateChart]);

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