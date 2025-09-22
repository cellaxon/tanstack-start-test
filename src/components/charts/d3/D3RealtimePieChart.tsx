import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

interface D3RealtimePieChartProps {
  data: any[];
  width?: number;
  height?: number;
  valueKey?: string;
  nameKey?: string;
  colors?: string[];
  innerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  transitionDuration?: number;
  formatValue?: (value: number) => string;
  labelThreshold?: number; // 최소 표시 비율 (%)
  labelStyle?: 'inside' | 'outside'; // 레이블 스타일
}

export function D3RealtimePieChart({
  data,
  width = 400,
  height = 400,
  valueKey = 'value',
  nameKey = 'name',
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  innerRadius = 0,
  showLabels = true,
  showLegend = true,
  transitionDuration = 750,
  formatValue = (v) => v.toFixed(0),
  labelThreshold = 5, // 5% 이하는 레이블 숨김
  labelStyle = 'outside'
}: D3RealtimePieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>({});
  const previousDataRef = useRef<any[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const tooltipRef = useRef<any>(null);

  // Initialize chart once
  useEffect(() => {
    if (!svgRef.current) return;

    const containerWidth = containerRef.current?.clientWidth || 400;
    const actualWidth = Math.min(containerWidth, width);
    const actualHeight = Math.min(actualWidth, height);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = 40;
    const legendWidth = showLegend ? 150 : 0;
    const chartWidth = actualWidth - legendWidth;
    const radius = Math.min(chartWidth, actualHeight) / 2 - margin;

    const g = svg
      .attr('width', actualWidth)
      .attr('height', actualHeight)
      .append('g')
      .attr('transform', `translate(${chartWidth / 2},${actualHeight / 2})`);

    // Create color scale
    const color = d3.scaleOrdinal()
      .range(colors);

    // Create pie layout
    const pie = d3.pie<any>()
      .value(d => d[valueKey])
      .sort(null);

    // Create arc generators
    const arc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const labelArc = d3.arc<any>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    // Create groups for slices and labels
    const slicesGroup = g.append('g')
      .attr('class', 'slices');

    const labelsGroup = g.append('g')
      .attr('class', 'labels');

    // Create legend group
    let legendGroup = null;
    if (showLegend) {
      legendGroup = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${chartWidth + 20}, 20)`);
    }

    // Tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body').append('div')
        .attr('class', 'chart-tooltip-realtime-pie')
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
      svg,
      g,
      slicesGroup,
      labelsGroup,
      legendGroup,
      pie,
      arc,
      labelArc,
      color,
      radius,
      actualWidth,
      actualHeight,
      legendWidth
    };

  }, [width, height, innerRadius, colors, showLegend]);

  // Update chart with new data
  const updateChart = useCallback(() => {
    if (!chartRef.current.svg) return;

    // Handle empty data
    if (!data || data.length === 0) {
      chartRef.current.slicesGroup?.selectAll('path').remove();
      chartRef.current.labelsGroup?.selectAll('text').remove();
      chartRef.current.legendGroup?.selectAll('.legend-item').remove();
      return;
    }

    const {
      slicesGroup,
      labelsGroup,
      legendGroup,
      pie,
      arc,
      labelArc,
      color,
      radius
    } = chartRef.current;

    // Set color domain
    color.domain(data.map(d => d[nameKey]));

    // Compute pie layout
    const pieData = pie(data);

    // Update slices with data join
    const slices = slicesGroup.selectAll('path')
      .data(pieData, (d: any) => d.data[nameKey]);

    // Exit - remove old slices
    slices.exit().remove();

    // Update - existing slices without transition
    slices
      .attr('fill', (d: any) => color(d.data[nameKey]) as string)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('d', arc);

    // Enter - add new slices
    const newSlices = slices.enter()
      .append('path')
      .attr('fill', (d: any) => color(d.data[nameKey]) as string)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('d', arc);

    // Add hover effects with tooltip to all slices (new and existing)
    slicesGroup.selectAll('path')
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function(d: any) {
            const [x, y] = arc.centroid(d);
            return `translate(${x * 0.1},${y * 0.1})`;
          });

        // Show tooltip
        if (tooltipRef.current) {
          const total = d3.sum(data, (item: any) => item[valueKey]);
          const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
          const value = formatValue(d.data[valueKey]);

          tooltipRef.current.transition().duration(100).style('opacity', 0.95);
          tooltipRef.current.html(`
            <div style="font-weight: bold; margin-bottom: 5px;">${d.data[nameKey]}</div>
            <div style="color: ${color(d.data[nameKey])}">● 값: ${value}</div>
            <div style="color: ${color(d.data[nameKey])}">● 비율: ${percentage}%</div>
          `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 35) + 'px');
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0)');

        // Hide tooltip
        if (tooltipRef.current) {
          tooltipRef.current.transition().duration(200).style('opacity', 0);
        }
      });

    // Update labels if enabled
    if (showLabels) {
      // Compute total for percentage calculation
      const total = d3.sum(data, d => d[valueKey]);

      if (labelStyle === 'outside') {
        // Create outer arc for label positioning
        const outerArc = d3.arc<any>()
          .innerRadius(radius * 1.2)
          .outerRadius(radius * 1.2);

        // Filter data to show labels only for significant slices
        const labelData = pieData.filter(d => {
          const percentage = (d.data[valueKey] / total) * 100;
          return percentage >= labelThreshold;
        });

        // Update polylines
        const polylines = slicesGroup.selectAll('.polyline')
          .data(labelData, (d: any) => d.data[nameKey]);

        polylines.exit().remove();

        polylines
          .attr('points', function(d: any) {
            const posA = arc.centroid(d);
            const posB = outerArc.centroid(d);
            const posC = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = radius * 1.35 * (midangle < Math.PI ? 1 : -1);
            return [posA, posB, posC].map(p => p.join(',')).join(' ');
          });

        const newPolylines = polylines.enter()
          .append('polyline')
          .attr('class', 'polyline')
          .attr('points', function(d: any) {
            const posA = arc.centroid(d);
            const posB = outerArc.centroid(d);
            const posC = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = radius * 1.35 * (midangle < Math.PI ? 1 : -1);
            return [posA, posB, posC].map(p => p.join(',')).join(' ');
          })
          .style('fill', 'none')
          .style('stroke', '#666')
          .style('stroke-width', 1)
          .style('opacity', 0.7);

        // Update labels
        const labels = labelsGroup.selectAll('text')
          .data(labelData, (d: any) => d.data[nameKey]);

        labels.exit().remove();

        labels
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
          .text((d: any) => {
            const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
            return `${d.data[nameKey]} (${percentage}%)`;
          });

        const newLabels = labels.enter()
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
          .style('fill', '#333')
          .style('font-size', '11px')
          .style('font-weight', 'normal')
          .text((d: any) => {
            const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
            return `${d.data[nameKey]} (${percentage}%)`;
          });
      } else {
        // Inside labels with threshold
        const labelData = pieData.filter(d => {
          const percentage = (d.data[valueKey] / total) * 100;
          return percentage >= labelThreshold;
        });

        const labels = labelsGroup.selectAll('text')
          .data(labelData, (d: any) => d.data[nameKey]);

        labels.exit().remove();

        labels
          .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
          .text((d: any) => {
            const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
            return `${percentage}%`;
          });

        const newLabels = labels.enter()
          .append('text')
          .attr('text-anchor', 'middle')
          .style('fill', 'white')
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
          .text((d: any) => {
            const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
            return `${percentage}%`;
          });
      }
    }

    // Update legend if enabled
    if (showLegend && legendGroup) {
      // Compute total for percentage calculation
      const total = d3.sum(data, d => d[valueKey]);

      // Update legend items with data join
      const legendItems = legendGroup.selectAll('.legend-item')
        .data(data, (d: any) => d[nameKey]);

      // Exit - remove old legend items
      legendItems.exit().remove();

      // Update existing legend items
      const legendItemGroups = legendItems
        .attr('transform', (d: any, i: number) => `translate(0, ${i * 25})`);

      legendItemGroups.select('rect')
        .attr('fill', (d: any) => color(d[nameKey]) as string);

      legendItemGroups.select('text')
        .text((d: any) => {
          const percentage = ((d[valueKey] / total) * 100).toFixed(1);
          return `${d[nameKey]} (${percentage}%)`;
        });

      // Enter - add new legend items
      const newLegendItems = legendItems.enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d: any, i: number) => `translate(0, ${i * 25})`);

      // Add colored rectangle
      newLegendItems.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', (d: any) => color(d[nameKey]) as string)
        .attr('rx', 2);

      // Add text label
      newLegendItems.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .style('font-weight', 'normal')
        .text((d: any) => {
          const percentage = ((d[valueKey] / total) * 100).toFixed(1);
          return `${d[nameKey]} (${percentage}%)`;
        });
    }

    // Store current data for comparison
    previousDataRef.current = [...data];

  }, [data, valueKey, nameKey, showLabels, showLegend, transitionDuration, formatValue, labelThreshold, labelStyle]);

  // Update chart when data changes
  useEffect(() => {
    updateChart();
  }, [updateChart]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (!svgRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth || 400;
      const actualWidth = Math.min(containerWidth, width);
      const actualHeight = Math.min(actualWidth, height);

      const svg = d3.select(svgRef.current);
      svg.attr('width', actualWidth).attr('height', actualHeight);

      const margin = 40;
      const legendWidth = showLegend ? 150 : 0;
      const chartWidth = actualWidth - legendWidth;
      const radius = Math.min(chartWidth, actualHeight) / 2 - margin;

      if (chartRef.current.g) {
        // Update main group position
        chartRef.current.g.attr('transform', `translate(${chartWidth / 2},${actualHeight / 2})`);

        // Update legend position if it exists
        if (chartRef.current.legendGroup) {
          chartRef.current.legendGroup.attr('transform', `translate(${chartWidth + 20}, ${actualHeight / 2 - 50})`);
        }

        // Update arcs with new radius
        if (chartRef.current.arc && chartRef.current.pie) {
          chartRef.current.arc
            .outerRadius(radius)
            .innerRadius(innerRadius * radius);

          chartRef.current.radius = radius;

          // Trigger chart update
          updateChart();
        }
      }
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [width, height, innerRadius, showLegend, updateChart]);

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