import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3AreaChartProps {
  data: any[];
  width?: number;
  height?: number;
  xKey?: string;
  yKeys?: string[];
  colors?: string[];
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
}

export function D3AreaChart({
  data,
  width = 600,
  height = 300,
  xKey = 'time',
  yKeys = ['value'],
  colors = ['#10b981', '#f59e0b', '#ef4444'],
  stacked = false,
  showGrid = true,
  showLegend = false,
  animate = true
}: D3AreaChartProps) {
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

    let yScale: d3.ScaleLinear<number, number>;

    if (stacked) {
      // For stacked area chart
      const stack = d3.stack()
        .keys(yKeys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stackedData = stack(data);

      yScale = d3.scaleLinear()
        .domain([0, d3.max(stackedData, layer => d3.max(layer, d => d[1])) as number])
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

      // Area generator
      const area = d3.area<any>()
        .x(d => isTimeData ? xScale(new Date(d.data[xKey])) : xScale(d.data[xKey]))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      // Draw areas
      const areas = g.selectAll('.area')
        .data(stackedData)
        .enter().append('path')
        .attr('class', 'area')
        .attr('fill', (d, i) => colors[i % colors.length])
        .attr('opacity', 0.7);

      if (animate) {
        areas
          .attr('d', area)
          .style('opacity', 0)
          .transition()
          .duration(1000)
          .style('opacity', 0.7);
      } else {
        areas.attr('d', area);
      }

    } else {
      // For non-stacked area chart
      yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(...yKeys.map(key => d[key]))) as number])
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

      // Draw areas for each key
      yKeys.forEach((key, index) => {
        const area = d3.area<any>()
          .x(d => isTimeData ? xScale(new Date(d[xKey])) : xScale(d[xKey]))
          .y0(innerHeight)
          .y1(d => yScale(d[key]))
          .curve(d3.curveMonotoneX);

        const areaPath = g.append('path')
          .datum(data)
          .attr('fill', colors[index % colors.length])
          .attr('opacity', 0.3)
          .attr('d', area);

        if (animate) {
          areaPath
            .style('opacity', 0)
            .transition()
            .duration(1000)
            .style('opacity', 0.3);
        }

        // Add line on top
        const line = d3.line<any>()
          .x(d => isTimeData ? xScale(new Date(d[xKey])) : xScale(d[xKey]))
          .y(d => yScale(d[key]))
          .curve(d3.curveMonotoneX);

        const linePath = g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', colors[index % colors.length])
          .attr('stroke-width', 2)
          .attr('d', line);

        if (animate) {
          const totalLength = linePath.node()?.getTotalLength() || 0;
          linePath
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);
        }
      });
    }

    // Legend
    if (showLegend && yKeys.length > 1) {
      const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth - 100}, 0)`);

      yKeys.forEach((key, index) => {
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${index * 20})`);

        legendItem.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colors[index % colors.length]);

        legendItem.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .style('font-size', '12px')
          .text(key);
      });
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
        let d: any;

        if (isTimeData) {
          const bisector = d3.bisector((d: any) => new Date(d[xKey])).left;
          const x0 = xScale.invert(mouseX);
          const index = bisector(data, x0, 1);
          const d0 = data[index - 1];
          const d1 = data[index];
          d = d1 && x0.getTime() - new Date(d0[xKey]).getTime() > new Date(d1[xKey]).getTime() - x0.getTime() ? d1 : d0;
        } else {
          const index = Math.round(mouseX / (innerWidth / (data.length - 1)));
          d = data[Math.max(0, Math.min(index, data.length - 1))];
        }

        if (d) {
          tooltip.transition().duration(100).style('opacity', 0.9);
          const tooltipContent = yKeys.map(key => `${key}: ${d[key]}`).join('<br>');
          tooltip.html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        }
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height, xKey, yKeys, colors, stacked, showGrid, showLegend, animate]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}