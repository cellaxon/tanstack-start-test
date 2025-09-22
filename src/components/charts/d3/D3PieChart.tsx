import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3PieChartProps {
  data: any[];
  width?: number;
  height?: number;
  valueKey?: string;
  nameKey?: string;
  colors?: string[];
  innerRadius?: number;
  showLabels?: boolean;
  animate?: boolean;
  labelThreshold?: number; // 최소 표시 비율 (%)
  labelStyle?: 'inside' | 'outside'; // 레이블 스타일
}

export function D3PieChart({
  data,
  width = 400,
  height = 400,
  valueKey = 'value',
  nameKey = 'name',
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  innerRadius = 0,
  showLabels = true,
  animate = true,
  labelThreshold = 5, // 5% 이하는 레이블 숨김
  labelStyle = 'outside'
}: D3PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Use container width if available
    const containerWidth = containerRef.current?.clientWidth || width;
    const actualWidth = Math.min(containerWidth, width);
    const actualHeight = Math.min(actualWidth, height); // Keep aspect ratio

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = 40;
    const radius = Math.min(actualWidth, actualHeight) / 2 - margin;

    const g = svg
      .attr('width', actualWidth)
      .attr('height', actualHeight)
      .append('g')
      .attr('transform', `translate(${actualWidth / 2},${actualHeight / 2})`);

    // Create pie layout
    const pie = d3.pie<any>()
      .value(d => d[valueKey])
      .sort(null);

    // Create arc generator
    const arc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Create label arc generator
    const labelArc = d3.arc<any>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    // Create color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d[nameKey]))
      .range(colors);

    // Create tooltip
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

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    // Add paths
    const paths = arcs.append('path')
      .attr('fill', (d: any) => color(d.data[nameKey]) as string)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    if (animate) {
      paths
        .transition()
        .duration(1000)
        .attrTween('d', function(d: any) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t) {
            return arc(interpolate(t));
          };
        });
    } else {
      paths.attr('d', arc);
    }

    // Add hover effects
    paths
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function(d: any) {
            const [x, y] = arc.centroid(d);
            return `translate(${x * 0.1},${y * 0.1})`;
          });

        tooltip.transition().duration(200).style('opacity', .9);
        const percentage = ((d.data[valueKey] / d3.sum(data, (item: any) => item[valueKey])) * 100).toFixed(1);
        tooltip.html(`${d.data[nameKey]}: ${d.data[valueKey]} (${percentage}%)`)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0)');

        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Add labels
    if (showLabels) {
      const total = d3.sum(data, (item: any) => item[valueKey]);

      if (labelStyle === 'outside') {
        // Create polylines and labels for outside placement
        const outerArc = d3.arc<any>()
          .innerRadius(radius * 1.2)
          .outerRadius(radius * 1.2);

        // Filter data to show labels only for significant slices
        const labelData = pie(data).filter(d => {
          const percentage = (d.data[valueKey] / total) * 100;
          return percentage >= labelThreshold;
        });

        // Add polylines
        const polylines = g.selectAll('.polyline')
          .data(labelData)
          .enter()
          .append('polyline')
          .attr('points', function(d: any) {
            const posA = arc.centroid(d);
            const posB = outerArc.centroid(d);
            const posC = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = radius * 1.35 * (midangle < Math.PI ? 1 : -1);
            return [posA, posB, posC].map(p => p.join(',')).join(' ');
          })
          .style('fill', 'none')
          .style('stroke', 'black')
          .style('stroke-width', 1)
          .style('opacity', animate ? 0 : 0.7);

        // Add labels
        const labels = g.selectAll('.label')
          .data(labelData)
          .enter()
          .append('text')
          .attr('transform', function(d: any) {
            const pos = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 1.4 * (midangle < Math.PI ? 1 : -1);
            return `translate(${pos})`;
          })
          .style('text-anchor', function(d: any) {
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return midangle < Math.PI ? 'start' : 'end';
          })
          .style('fill', 'black')
          .style('font-size', '11px')
          .style('font-weight', 'normal')
          .style('opacity', animate ? 0 : 1)
          .text((d: any) => {
            const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
            return `${d.data[nameKey]} (${percentage}%)`;
          });

        if (animate) {
          polylines
            .transition()
            .delay(800)
            .duration(200)
            .style('opacity', 0.7);

          labels
            .transition()
            .delay(800)
            .duration(200)
            .style('opacity', 1);
        }
      } else {
        // Inside labels (original implementation) with threshold
        const labelData = pie(data).filter(d => {
          const percentage = (d.data[valueKey] / total) * 100;
          return percentage >= labelThreshold;
        });

        const labels = arcs.filter((d: any) => {
            const percentage = ((d.data[valueKey] / total) * 100);
            return percentage >= labelThreshold;
          })
          .append('text')
          .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
          .attr('text-anchor', 'middle')
          .style('fill', 'white')
          .style('font-size', '11px')
          .style('font-weight', 'bold');

        if (animate) {
          labels
            .style('opacity', 0)
            .transition()
            .delay(800)
            .duration(200)
            .style('opacity', 1)
            .text((d: any) => {
              const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
              return `${percentage}%`;
            });
        } else {
          labels.text((d: any) => {
            const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
            return `${percentage}%`;
          });
        }
      }
    }

    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height, valueKey, nameKey, colors, innerRadius, showLabels, animate, labelThreshold, labelStyle]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}