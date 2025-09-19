import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react'

interface SpanData {
  spanId: string;
  traceId: string;
  parentSpanId: string | null;
  serviceName: string;
  operationName: string;
  startTime: number;
  duration: number;
  level: number;
  status: 'success' | 'error' | 'warning';
  tags: Record<string, any>;
  events?: Array<{ timestamp: number; name: string }>;
}

interface TraceData {
  traceId: string;
  rootSpan: SpanData;
  spans: SpanData[];
  startTime: number;
  duration: number;
  serviceCount: number;
  spanCount: number;
  errorCount: number;
}

interface TraceTimelineProps {
  traceId: string;
  data?: TraceData;
  viewMode?: 'gantt' | 'waterfall' | 'flame';
  height?: number;
}

const SERVICE_COLORS: Record<string, string> = {
  'api-gateway': '#3B82F6',
  'user-service': '#10B981',
  'order-service': '#8B5CF6',
  'payment-service': '#F59E0B',
  'database': '#EF4444',
  'cache': '#EC4899',
  'payment-gateway': '#06B6D4',
};

export function TraceTimeline({
  traceId,
  data,
  viewMode = 'gantt',
  height = 600
}: TraceTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedSpan, setSelectedSpan] = useState<SpanData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  const margin = useMemo(() => ({
    top: 40,
    right: 120,
    bottom: 60,
    left: 150
  }), []);

  const dimensions = useMemo(() => ({
    width: 1200 - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  }), [height, margin]);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width + margin.left + margin.right)
      .attr('height', dimensions.height + margin.top + margin.bottom);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .translateExtent([[-100, -100], [dimensions.width + 100, dimensions.height + 100]])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k);
        g.attr('transform', `translate(${margin.left},${margin.top}) scale(${event.transform.k})`);
      });

    svg.call(zoom);

    if (currentViewMode === 'gantt') {
      renderGanttChart(g, data, dimensions);
    } else if (currentViewMode === 'waterfall') {
      renderWaterfallChart(g, data, dimensions);
    } else if (currentViewMode === 'flame') {
      renderFlameGraph(g, data, dimensions);
    }

    // Add title
    svg.append('text')
      .attr('x', margin.left + dimensions.width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Trace Timeline: ${traceId}`);

  }, [data, currentViewMode, dimensions, margin, traceId]);

  const renderGanttChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, traceData: TraceData, dim: typeof dimensions) => {
    const { spans, startTime, duration } = traceData;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, duration])
      .range([0, dim.width]);

    const yScale = d3.scaleBand()
      .domain(spans.map((_, i) => i.toString()))
      .range([0, dim.height])
      .padding(0.1);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${dim.height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => `${d}ms`)
        .ticks(10));

    // Add Y axis labels (service names)
    g.append('g')
      .attr('class', 'y-axis')
      .selectAll('text')
      .data(spans)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', (_, i) => (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text(d => `${d.serviceName}`);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'trace-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Add spans as rectangles
    const spanGroups = g.selectAll('.span')
      .data(spans)
      .enter()
      .append('g')
      .attr('class', 'span');

    // Draw span rectangles
    spanGroups.append('rect')
      .attr('x', d => xScale(d.startTime - startTime))
      .attr('y', (_, i) => yScale(i.toString()) || 0)
      .attr('width', d => xScale(d.duration))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => SERVICE_COLORS[d.serviceName] || '#94A3B8')
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);

        tooltip.transition()
          .duration(200)
          .style('opacity', .9);

        tooltip.html(`
          <strong>${d.operationName}</strong><br/>
          Service: ${d.serviceName}<br/>
          Duration: ${d.duration}ms<br/>
          Status: ${d.status}<br/>
          ${d.tags['http.method'] ? `Method: ${d.tags['http.method']}<br/>` : ''}
          ${d.tags['http.status_code'] ? `Status Code: ${d.tags['http.status_code']}<br/>` : ''}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('click', (_, d) => {
        setSelectedSpan(d);
      });

    // Add operation name labels
    spanGroups.append('text')
      .attr('x', d => xScale(d.startTime - startTime) + 5)
      .attr('y', (_, i) => (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text(d => {
        const maxWidth = xScale(d.duration) - 10;
        const text = d.operationName;
        return maxWidth > 50 ? text : '';
      });

    // Add connecting lines for parent-child relationships
    const connections = spans.filter(s => s.parentSpanId);
    g.selectAll('.connection')
      .data(connections)
      .enter()
      .append('line')
      .attr('class', 'connection')
      .attr('x1', d => {
        const parent = spans.find(s => s.spanId === d.parentSpanId);
        return parent ? xScale(parent.startTime - startTime + parent.duration) : 0;
      })
      .attr('y1', d => {
        const parentIndex = spans.findIndex(s => s.spanId === d.parentSpanId);
        return parentIndex >= 0 ? (yScale(parentIndex.toString()) || 0) + yScale.bandwidth() / 2 : 0;
      })
      .attr('x2', d => xScale(d.startTime - startTime))
      .attr('y2', (d, i) => {
        const spanIndex = spans.findIndex(s => s.spanId === d.spanId);
        return (yScale(spanIndex.toString()) || 0) + yScale.bandwidth() / 2;
      })
      .attr('stroke', '#64748B')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.5);

    return () => {
      tooltip.remove();
    };
  };

  const renderWaterfallChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, traceData: TraceData, dim: typeof dimensions) => {
    // Waterfall implementation similar to gantt but with network timing visualization
    renderGanttChart(g, traceData, dim); // Simplified for demo
  };

  const renderFlameGraph = (g: d3.Selection<SVGGElement, unknown, null, undefined>, traceData: TraceData, dim: typeof dimensions) => {
    // Flame graph implementation
    renderGanttChart(g, traceData, dim); // Simplified for demo
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleTo as any,
      zoomLevel * 1.2
    );
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleTo as any,
      zoomLevel * 0.8
    );
  };

  const handleReset = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
    setZoomLevel(1);
  };

  const handleExport = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-${traceId}.svg`;
    a.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Distributed Trace Timeline</CardTitle>
            <CardDescription>
              Trace ID: {traceId} | {data?.spanCount || 0} spans | {data?.serviceCount || 0} services
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={currentViewMode} onValueChange={setCurrentViewMode}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gantt">Gantt View</SelectItem>
                <SelectItem value="waterfall">Waterfall View</SelectItem>
                <SelectItem value="flame">Flame Graph</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {data && (
          <div className="flex gap-4 mt-4">
            <Badge variant={data.errorCount > 0 ? 'destructive' : 'default'}>
              {data.errorCount > 0 ? `${data.errorCount} Errors` : 'No Errors'}
            </Badge>
            <Badge variant="outline">Duration: {data.duration}ms</Badge>
            <Badge variant="outline">Zoom: {(zoomLevel * 100).toFixed(0)}%</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg ref={svgRef} className="w-full border rounded-lg bg-slate-50 dark:bg-slate-900" />
          {selectedSpan && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <h4 className="font-semibold mb-2">Selected Span Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Operation:</span> {selectedSpan.operationName}
                </div>
                <div>
                  <span className="font-medium">Service:</span> {selectedSpan.serviceName}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {selectedSpan.duration}ms
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={selectedSpan.status === 'error' ? 'destructive' : 'default'} className="text-xs">
                    {selectedSpan.status}
                  </Badge>
                </div>
              </div>
              {selectedSpan.tags && Object.keys(selectedSpan.tags).length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Tags:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(selectedSpan.tags).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {JSON.stringify(value)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}