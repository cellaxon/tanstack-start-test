import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'

interface BarDataPoint {
  label: string
  value: number
}

interface BarChartProps {
  data: BarDataPoint[]
  width?: number
  height?: number
  color?: string
  title?: string
}

export function BarChart({
  data,
  width = 600,
  height = 400,
  color = '#10b981',
  title
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const margin = { top: 20, right: 30, bottom: 60, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number])
      .range([innerHeight, 0])

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")

    g.append("g")
      .call(d3.axisLeft(yScale))

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

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.label) as number)
      .attr("width", xScale.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", color)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.7)
        tooltip.transition().duration(200).style("opacity", .9)
        tooltip.html(`${d.label}: ${d.value}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1)
        tooltip.transition().duration(500).style("opacity", 0)
      })
      .transition()
      .duration(800)
      .attr("y", d => yScale(d.value))
      .attr("height", d => innerHeight - yScale(d.value))

    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove()
    }
  }, [data, width, height, color])

  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <svg ref={svgRef} role="img" aria-label={title || "Bar chart"}>
        <title>{title || "Bar chart"}</title>
      </svg>
    </div>
  )
}