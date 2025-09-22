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
  showLegend?: boolean;
  showDots?: boolean;
  maxDataPoints?: number;
  transitionDuration?: number;
  yLabels?: { [key: string]: string };
  formatValue?: (value: number) => string;
}

export function D3RealtimeAreaChart({
  data,
  width = 9999,
  height = 300,
  xKey = 'time',
  yKeys = ['value'],
  colors = ['#10b981', '#f59e0b', '#ef4444'],
  stacked = false,
  showGrid = true,
  showLegend = false,
  showDots = false,
  maxDataPoints = 50,
  transitionDuration = 500,
  yLabels = {},
  formatValue = (v) => v.toFixed(2)
}: D3RealtimeAreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>({});
  const previousDataRef = useRef<any[]>([]);
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

    // Focus circles container
    const focusCirclesGroup = g.append('g')
      .attr('class', 'focus-circles')
      .style('display', 'none');

    // Create focus circles for each series
    const focusCircles = yKeys.map((key, i) => {
      return focusCirclesGroup.append('circle')
        .attr('class', `focus-circle-${i}`)
        .attr('r', 5)
        .attr('fill', colors[i % colors.length])
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    });

    // Tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body').append('div')
        .attr('class', 'chart-tooltip-realtime-area')
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

    // Dots container - rendered after areas so they appear on top
    const dotsContainer = g.append('g')
      .attr('class', 'dots-container');

    // Invisible rect for mouse events
    const mouseRect = g.append('rect')
      .attr('class', 'mouse-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    // Legend
    if (showLegend) {
      const legend = g.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(yKeys.slice().reverse())
        .enter().append('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);

      legend.append('rect')
        .attr('x', innerWidth - 19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', (d, i) => colors[yKeys.length - 1 - i]);

      legend.append('text')
        .attr('x', innerWidth - 24)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(d => yLabels[d] || d);
    }

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
      dotsContainer,
      innerWidth,
      innerHeight,
      gridX: chartRef.current.gridX,
      gridY: chartRef.current.gridY,
      crosshair,
      focusCirclesGroup,
      focusCircles,
      mouseRect
    };

  }, [width, height, showGrid, showLegend, yKeys, colors, yLabels]);

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
      dotsContainer,
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

    // Update dots if enabled
    if (showDots && dotsContainer) {
      yKeys.forEach((key, keyIndex) => {
        const dotsSelection = dotsContainer.selectAll(`.dot-${key}`)
          .data(limitedData, (d: any) => d[xKey]);

        // Remove old dots
        dotsSelection.exit().remove();

        // Add new dots
        const newDots = dotsSelection.enter()
          .append('circle')
          .attr('class', `dot-${key}`)
          .attr('r', 3)
          .attr('fill', colors[keyIndex % colors.length])
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5)
          .style('opacity', 1);

        // Update all dots position
        dotsSelection.merge(newDots)
          .attr('cx', (d: any) => xScale(new Date(d[xKey])))
          .attr('cy', (d: any) => {
            if (stacked) {
              // For stacked charts, calculate cumulative y
              let cumulativeY = 0;
              for (let i = 0; i <= keyIndex; i++) {
                cumulativeY += d[yKeys[i]] || 0;
              }
              return yScale(cumulativeY);
            } else {
              return yScale(d[key] || 0);
            }
          });
      });
    }

    // Update mouse interactions
    const { crosshair, focusCirclesGroup, focusCircles, mouseRect } = chartRef.current;

    if (mouseRect && crosshair && focusCirclesGroup) {
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

              // Update crosshair
              crosshair.style('display', null);
              crosshair.select('.crosshair-x')
                .attr('x1', xPos)
                .attr('x2', xPos);

              // Update focus circles for each series
              focusCirclesGroup.style('display', null);

              if (stacked) {
                // For stacked charts, calculate cumulative y values
                let cumulativeY = 0;
                yKeys.forEach((key, i) => {
                  cumulativeY += d[key];
                  const yPos = yScale(cumulativeY);
                  if (focusCircles[i]) {
                    focusCircles[i]
                      .attr('cx', xPos)
                      .attr('cy', yPos);
                  }
                });
              } else {
                // For non-stacked charts
                yKeys.forEach((key, i) => {
                  const yPos = yScale(d[key]);
                  if (focusCircles[i]) {
                    focusCircles[i]
                      .attr('cx', xPos)
                      .attr('cy', yPos);
                  }
                });
              }

              // Update tooltip
              const timeStr = new Date(d[xKey]).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              if (tooltipRef.current) {
                let tooltipHtml = `<div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>`;
                yKeys.forEach((key, i) => {
                  const label = yLabels[key] || key;
                  tooltipHtml += `<div style="color: ${colors[i % colors.length]}">● ${label}: ${formatValue(d[key])}</div>`;
                });

                tooltipRef.current.transition().duration(100).style('opacity', 0.95);
                tooltipRef.current.html(tooltipHtml)
                  .style('left', (event.pageX + 15) + 'px')
                  .style('top', (event.pageY - 35) + 'px');
              }
            }
          })
          .on('mouseout', () => {
            // Clear mouse position
            mousePositionRef.current = null;

            crosshair.style('display', 'none');
            focusCirclesGroup.style('display', 'none');
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

            // Update crosshair
            crosshair.style('display', null);
            crosshair.select('.crosshair-x')
              .attr('x1', xPos)
              .attr('x2', xPos);

            // Update focus circles for each series
            focusCirclesGroup.style('display', null);

            if (stacked) {
              // For stacked charts, calculate cumulative y values
              let cumulativeY = 0;
              yKeys.forEach((key, i) => {
                cumulativeY += d[key];
                const yPos = yScale(cumulativeY);
                if (focusCircles[i]) {
                  focusCircles[i]
                    .attr('cx', xPos)
                    .attr('cy', yPos);
                }
              });
            } else {
              // For non-stacked charts
              yKeys.forEach((key, i) => {
                const yPos = yScale(d[key]);
                if (focusCircles[i]) {
                  focusCircles[i]
                    .attr('cx', xPos)
                    .attr('cy', yPos);
                }
              });
            }

            // Update tooltip content only
            if (tooltipRef.current) {
              const timeStr = new Date(d[xKey]).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              let tooltipHtml = `<div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>`;
              yKeys.forEach((key, i) => {
                const label = yLabels[key] || key;
                tooltipHtml += `<div style="color: ${colors[i % colors.length]}">● ${label}: ${formatValue(d[key])}</div>`;
              });

              tooltipRef.current.html(tooltipHtml);
            }
          }
        }
      }
    }

    // Store current data for next update
    previousDataRef.current = [...limitedData];

  }, [data, xKey, yKeys, colors, stacked, maxDataPoints, transitionDuration, yLabels, formatValue]);

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

      const margin = { top: 20, right: 30, bottom: 60, left: 60 };
      const innerWidth = actualWidth - margin.left - margin.right;

      if (chartRef.current.xScale && chartRef.current.g) {
        chartRef.current.xScale.range([0, innerWidth]);
        chartRef.current.innerWidth = innerWidth;

        // Update grid width if exists
        if (chartRef.current.gridY) {
          chartRef.current.gridY.call(d3.axisLeft(chartRef.current.yScale)
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
  }, [width, updateChart]);

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