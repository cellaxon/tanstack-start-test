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
  animate = true
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

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Invisible rect for mouse events
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);

        if (isTimeData) {
          const bisector = d3.bisector((d: any) => new Date(d[xKey])).left;
          const x0 = xScale.invert(mouseX);
          const index = bisector(data, x0, 1);
          const d0 = data[index - 1];
          const d1 = data[index];
          const d = d1 && x0.getTime() - new Date(d0[xKey]).getTime() > new Date(d1[xKey]).getTime() - x0.getTime() ? d1 : d0;

          if (d) {
            tooltip.transition().duration(100).style('opacity', 0.9);
            tooltip.html(`${d[yKey]}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          }
        } else {
          // For non-time data, find closest point
          const index = Math.round(mouseX / (innerWidth / (data.length - 1)));
          const d = data[Math.max(0, Math.min(index, data.length - 1))];
          if (d) {
            tooltip.transition().duration(100).style('opacity', 0.9);
            tooltip.html(`${d[xKey]}: ${d[yKey]}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          }
        }
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height, xKey, yKey, color, strokeWidth, showGrid, showDots, animate]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}