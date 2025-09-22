import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3BarChartProps {
  data: any[];
  width?: number;
  height?: number;
  xKey?: string;
  yKey?: string;
  color?: string | string[];
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  animate?: boolean;
}

export function D3BarChart({
  data,
  width = 600,
  height = 300,
  xKey = 'name',
  yKey = 'value',
  color = '#3b82f6',
  layout = 'vertical',
  showGrid = true,
  animate = true
}: D3BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Use container width if available
    const containerWidth = containerRef.current?.clientWidth || width;
    const actualWidth = Math.min(containerWidth, width);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 80, left: layout === 'horizontal' ? 150 : 60 };
    const innerWidth = actualWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', actualWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (layout === 'vertical') {
      // Vertical bar chart
      const xScale = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([0, innerWidth])
        .padding(0.1);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yKey]) as number])
        .nice()
        .range([innerHeight, 0]);

      // Grid
      if (showGrid) {
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
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      // Y axis
      g.append('g')
        .call(d3.axisLeft(yScale));

      // Bars
      const bars = g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d[xKey]) as number)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d, i) => Array.isArray(color) ? color[i % color.length] : color)
        .attr('y', innerHeight)
        .attr('height', 0);

      // Animation
      if (animate) {
        bars.transition()
          .duration(800)
          .attr('y', d => yScale(d[yKey]))
          .attr('height', d => innerHeight - yScale(d[yKey]));
      } else {
        bars
          .attr('y', d => yScale(d[yKey]))
          .attr('height', d => innerHeight - yScale(d[yKey]));
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

      bars
        .on('mouseover', function(event, d) {
          tooltip.transition().duration(200).style('opacity', .9);
          tooltip.html(`${d[xKey]}: ${d[yKey]}`)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition().duration(500).style('opacity', 0);
        });

      return () => {
        d3.select('body').selectAll('.tooltip').remove();
      };

    } else {
      // Horizontal bar chart
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yKey]) as number])
        .nice()
        .range([0, innerWidth]);

      const yScale = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([0, innerHeight])
        .padding(0.1);

      // Grid
      if (showGrid) {
        g.append('g')
          .attr('class', 'grid')
          .call(d3.axisBottom(xScale)
            .tickSize(innerHeight)
            .tickFormat(() => '')
          )
          .style('stroke-dasharray', '3,3')
          .style('opacity', 0.3);
      }

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

      // Y axis
      g.append('g')
        .call(d3.axisLeft(yScale));

      // Bars
      const bars = g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d[xKey]) as number)
        .attr('height', yScale.bandwidth())
        .attr('fill', (d, i) => Array.isArray(color) ? color[i % color.length] : color)
        .attr('x', 0)
        .attr('width', 0);

      // Animation
      if (animate) {
        bars.transition()
          .duration(800)
          .attr('width', d => xScale(d[yKey]));
      } else {
        bars.attr('width', d => xScale(d[yKey]));
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

      bars
        .on('mouseover', function(event, d) {
          tooltip.transition().duration(200).style('opacity', .9);
          tooltip.html(`${d[xKey]}: ${d[yKey]}`)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition().duration(500).style('opacity', 0);
        });

      return () => {
        d3.select('body').selectAll('.tooltip').remove();
      };
    }
  }, [data, width, height, xKey, yKey, color, layout, showGrid, animate]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}