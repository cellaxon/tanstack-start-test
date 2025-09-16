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

    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")

    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 4)
      .attr("fill", color)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", .9)
        tooltip.html(`Value: ${d.value}<br/>Time: ${d3.timeFormat("%H:%M")(d.date)}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0)
      })

    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove()
    }
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