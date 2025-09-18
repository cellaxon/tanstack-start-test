import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'

interface DataPoint {
  date: Date
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  color?: string
  title?: string
}

export function LineChart({
  data,
  width = 600,
  height = 400,
  color = '#3b82f6',
  title
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number])
      .range([innerHeight, 0])

    const line = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M") as any))

    g.append("g")
      .call(d3.axisLeft(yScale))

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line)

    // Add crosshair and tooltip
    const crosshairGroup = g.append('g')
      .style('display', 'none')

    // Vertical line
    const verticalLine = crosshairGroup.append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('pointer-events', 'none')

    // Horizontal line
    const horizontalLine = crosshairGroup.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('pointer-events', 'none')

    // Tooltip
    const tooltip = g.append('g')
      .style('display', 'none')
      .style('pointer-events', 'none')

    const tooltipBg = tooltip.append('rect')
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('rx', 4)
      .attr('ry', 4)

    const tooltipText = tooltip.append('text')
      .attr('fill', 'white')
      .attr('font-size', '12px')

    // Circle to highlight current point
    const focusCircle = crosshairGroup.append('circle')
      .attr('r', 4)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)

    // Bisector for finding closest data point
    const bisect = d3.bisector<DataPoint, Date>(d => d.date).left

    // Create overlay for mouse events
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mouseX, mouseY] = d3.pointer(event)

        // Find closest data point
        const x0 = xScale.invert(mouseX)
        const i = bisect(data, x0, 1)
        const d0 = data[i - 1]
        const d1 = data[i]
        const d = d1 && x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0

        if (!d) return

        const xPos = xScale(d.date)
        const yPos = yScale(d.value)

        // Update crosshair position
        verticalLine.attr('x1', xPos).attr('x2', xPos)
        horizontalLine.attr('y1', mouseY).attr('y2', mouseY)

        // Update focus circle
        focusCircle.attr('cx', xPos).attr('cy', yPos)

        // Update tooltip content
        const timeFormat = d3.timeFormat("%H:%M")
        const dateFormat = d3.timeFormat("%Y-%m-%d")
        const tooltipContent = [
          `날짜: ${dateFormat(d.date)}`,
          `시간: ${timeFormat(d.date)}`,
          `값: ${d.value.toLocaleString()}`
        ]

        // Clear and add new text
        tooltipText.selectAll('*').remove()
        const textLines = tooltipText.selectAll('tspan')
          .data(tooltipContent)
          .enter()
          .append('tspan')
          .attr('x', 0)
          .attr('dy', (d, i) => i === 0 ? 0 : '1.2em')
          .text(d => d)

        // Calculate tooltip dimensions
        const padding = 8
        const lineHeight = 14
        const maxTextWidth = Math.max(...tooltipContent.map(text => text.length * 6))
        const tooltipWidth = maxTextWidth + padding * 2
        const tooltipHeight = tooltipContent.length * lineHeight + padding * 2

        // Position tooltip
        let tooltipX = xPos + 10
        let tooltipY = yPos - tooltipHeight / 2

        if (tooltipX + tooltipWidth > innerWidth) {
          tooltipX = xPos - tooltipWidth - 10
        }

        if (tooltipY < 0) {
          tooltipY = 0
        } else if (tooltipY + tooltipHeight > innerHeight) {
          tooltipY = innerHeight - tooltipHeight
        }

        // Update tooltip background
        tooltipBg
          .attr('x', -padding / 2)
          .attr('y', -padding - 2)
          .attr('width', tooltipWidth)
          .attr('height', tooltipHeight)

        // Update tooltip position
        tooltip.attr('transform', `translate(${tooltipX}, ${tooltipY + padding})`)
        tooltipText.attr('x', padding / 2).attr('y', padding)

        crosshairGroup.style('display', 'block')
        tooltip.style('display', 'block')
      })
      .on('mouseout', function() {
        crosshairGroup.style('display', 'none')
        tooltip.style('display', 'none')
      })
  }, [data, width, height, color])

  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <svg ref={svgRef} role="img" aria-label={title ?? 'Line chart'}>
        <title>{title ?? 'Line chart'}</title>
      </svg>
    </div>
  )
}