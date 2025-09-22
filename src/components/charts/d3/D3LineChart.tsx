import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3LineChartProps {
  data: any[];
  width?: number;
  height?: number;
  xKey?: string;
  yKey?: string;
  color?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showDots?: boolean;
  animate?: boolean;
  yLabel?: string;
  formatValue?: (value: number) => string;
}

export function D3LineChart({
  data,
  width = 600,
  height = 300,
  xKey = 'time',
  yKey = 'value',
  color = '#3b82f6',
  strokeWidth = 2,
  showGrid = true,
  showDots = false,
  animate = true,
  yLabel,
  formatValue = (v) => v.toFixed(2)
}: D3LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Use container width if available
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

    // Scales - check if xKey contains time-like data
    const isTimeData = data[0] && (data[0][xKey] instanceof Date ||
                                   typeof data[0][xKey] === 'string' && !isNaN(Date.parse(data[0][xKey])));

    let xScale: any;
    if (isTimeData) {
      xScale = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d[xKey])) as [Date, Date])
        .range([0, innerWidth]);
    } else {
      xScale = d3.scalePoint()
        .domain(data.map(d => d[xKey]))
        .range([0, innerWidth])
        .padding(0.5);
    }

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[yKey]) as number])
      .nice()
      .range([innerHeight, 0]);

    // Grid
    if (showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    }

    // X axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`);

    if (isTimeData) {
      xAxis.call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%H:%M') as any));
    } else {
      xAxis.call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    }

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

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

    // Line
    const line = d3.line<any>()
      .x(d => isTimeData ? xScale(new Date(d[xKey])) : xScale(d[xKey]))
      .y(d => yScale(d[yKey]))
      .curve(d3.curveMonotoneX);

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', strokeWidth)
      .attr('d', line);

    // Animation
    if (animate) {
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
    }

    // Dots
    if (showDots) {
      g.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => isTimeData ? xScale(new Date(d[xKey])) : xScale(d[xKey]))
        .attr('cy', d => yScale(d[yKey]))
        .attr('r', 3)
        .attr('fill', color)
        .style('opacity', animate ? 0 : 1)
        .transition()
        .delay(animate ? 1000 : 0)
        .duration(200)
        .style('opacity', 1);
    }

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
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
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

    // Bisector for finding closest data point
    const bisector = d3.bisector((d: any) => isTimeData ? new Date(d[xKey]) : d[xKey]).left;

    // Invisible rect for mouse events
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        let d: any;

        if (isTimeData) {
          // For time data, find the closest data point
          const x0 = xScale.invert(mouseX);
          const index = bisector(data, x0, 1);
          const d0 = data[index - 1];
          const d1 = data[index];

          if (!d0 && !d1) return;
          if (!d0) d = d1;
          else if (!d1) d = d0;
          else {
            // Choose the closer data point
            d = x0.getTime() - new Date(d0[xKey]).getTime() > new Date(d1[xKey]).getTime() - x0.getTime() ? d1 : d0;
          }
        } else {
          // For non-time data, find the closest point
          const step = innerWidth / (data.length - 1);
          const index = Math.round(mouseX / step);
          d = data[Math.max(0, Math.min(index, data.length - 1))];
        }

        if (d) {
          // Update crosshair position - snap to data point
          const xPos = isTimeData ? xScale(new Date(d[xKey])) : xScale(d[xKey]);
          const yPos = yScale(d[yKey]);

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
          const timeStr = isTimeData ?
            new Date(d[xKey]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) :
            d[xKey];

          tooltip.transition().duration(100).style('opacity', 0.95);
          tooltip.html(`
            <div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>
            <div style="color: ${color}">● ${yLabel || yKey}: ${formatValue(d[yKey])}</div>
          `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 35) + 'px');
        }
      })
      .on('mouseout', () => {
        crosshair.style('display', 'none');
        focusCircle.style('display', 'none');
        tooltip.transition().duration(200).style('opacity', 0);
      });

    return () => {
      d3.select('body').selectAll('.chart-tooltip').remove();
    };
  }, [data, width, height, xKey, yKey, color, strokeWidth, showGrid, showDots, animate, yLabel, formatValue]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}