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
  yLabels?: { [key: string]: string };
  formatValue?: (value: number) => string;
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
  animate = true,
  yLabels = {},
  formatValue = (v) => v.toFixed(2)
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
      const layers = g.selectAll('.layer')
        .data(stackedData)
        .enter().append('g')
        .attr('class', 'layer');

      layers.append('path')
        .attr('class', 'area')
        .style('fill', (d, i) => colors[i])
        .style('opacity', 0.7)
        .attr('d', area);

      // Animation
      if (animate) {
        layers.selectAll('path')
          .style('opacity', 0)
          .transition()
          .duration(1000)
          .style('opacity', 0.7);
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

      // Area and line generators
      yKeys.forEach((key, i) => {
        const area = d3.area<any>()
          .x(d => isTimeData ? xScale(new Date(d[xKey])) : xScale(d[xKey]))
          .y0(innerHeight)
          .y1(d => yScale(d[key]))
          .curve(d3.curveMonotoneX);

        const line = d3.line<any>()
          .x(d => isTimeData ? xScale(new Date(d[xKey])) : xScale(d[xKey]))
          .y(d => yScale(d[key]))
          .curve(d3.curveMonotoneX);

        // Draw area
        const areaPath = g.append('path')
          .datum(data)
          .attr('fill', colors[i])
          .attr('fill-opacity', 0.3)
          .attr('d', area);

        // Draw line
        const linePath = g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', colors[i])
          .attr('stroke-width', 2)
          .attr('d', line);

        // Animation
        if (animate) {
          areaPath
            .style('opacity', 0)
            .transition()
            .duration(1000)
            .style('opacity', 0.3);

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

    // Focus circles for each series
    const focusCircles = yKeys.map((key, i) => {
      return g.append('circle')
        .attr('class', `focus-circle-${i}`)
        .attr('r', 5)
        .attr('fill', colors[i])
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('display', 'none');
    });

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

          crosshair.style('display', null);
          crosshair.select('.crosshair-x')
            .attr('x1', xPos)
            .attr('x2', xPos);

          // Update focus circles for each series
          yKeys.forEach((key, i) => {
            const yPos = yScale(d[key]);
            focusCircles[i]
              .style('display', null)
              .attr('cx', xPos)
              .attr('cy', yPos);
          });

          // Update tooltip
          const timeStr = isTimeData ?
            new Date(d[xKey]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) :
            d[xKey];

          let tooltipHtml = `<div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>`;
          yKeys.forEach((key, i) => {
            const label = yLabels[key] || key;
            tooltipHtml += `<div style="color: ${colors[i]}">● ${label}: ${formatValue(d[key])}</div>`;
          });

          tooltip.transition().duration(100).style('opacity', 0.95);
          tooltip.html(tooltipHtml)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 35) + 'px');
        }
      })
      .on('mouseout', () => {
        crosshair.style('display', 'none');
        focusCircles.forEach(circle => circle.style('display', 'none'));
        tooltip.transition().duration(200).style('opacity', 0);
      });

    return () => {
      d3.select('body').selectAll('.chart-tooltip').remove();
    };
  }, [data, width, height, xKey, yKeys, colors, stacked, showGrid, showLegend, animate, yLabels, formatValue]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}