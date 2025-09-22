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
}

export function D3RealtimePieChart({
  data,
  width = 9999,
  height = 400,
  valueKey = 'value',
  nameKey = 'name',
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  innerRadius = 0,
  showLabels = true,
  showLegend = true,
  transitionDuration = 750
}: D3RealtimePieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>({});
  const previousDataRef = useRef<any[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

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
    if (!chartRef.current.svg || !data || data.length === 0) return;

    const {
      slicesGroup,
      labelsGroup,
      legendGroup,
      pie,
      arc,
      labelArc,
      color
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

    // Add hover effects
    newSlices
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function(d: any) {
            const [x, y] = arc.centroid(d);
            return `translate(${x * 0.1},${y * 0.1})`;
          });
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0)');
      });

    // Update labels if enabled
    if (showLabels) {
      // Compute total for percentage calculation
      const total = d3.sum(data, d => d[valueKey]);

      // Update labels with data join
      const labels = labelsGroup.selectAll('text')
        .data(pieData, (d: any) => d.data[nameKey]);

      // Exit - remove old labels
      labels.exit().remove();

      // Update - existing labels without transition
      labels
        .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
        .text((d: any) => {
          const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
          return `${d.data[nameKey]}: ${percentage}%`;
        });

      // Enter - add new labels
      const newLabels = labels.enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
        .text((d: any) => {
          const percentage = ((d.data[valueKey] / total) * 100).toFixed(1);
          return `${d.data[nameKey]}: ${percentage}%`;
        });
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

  }, [data, valueKey, nameKey, showLabels, showLegend, transitionDuration]);

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

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}