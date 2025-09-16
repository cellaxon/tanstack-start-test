import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'

interface PieDataPoint {
  label: string
  value: number
}

interface PieChartProps {
  data: PieDataPoint[]
  width?: number
  height?: number
  title?: string
}

export function PieChart({
  data,
  width = 400,
  height = 400,
  title
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const radius = Math.min(width, height) / 2
    const margin = 40

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const pie = d3.pie<PieDataPoint>()
      .value(d => d.value)

    const arc = d3.arc<d3.PieArcDatum<PieDataPoint>>()
      .outerRadius(radius - margin)
      .innerRadius(0)

    const labelArc = d3.arc<d3.PieArcDatum<PieDataPoint>>()
      .outerRadius(radius - margin)
      .innerRadius(radius - margin - 40)

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

    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc")

    arcs.append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.label))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.7)
        const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)
        tooltip.transition().duration(200).style("opacity", .9)
        tooltip.html(`${d.data.label}: ${d.data.value}<br/>${percent}%`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1)
        tooltip.transition().duration(500).style("opacity", 0)
      })

    arcs.append("text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .text(d => {
        const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(0)
        return percent > 5 ? `${percent}%` : ''
      })

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, 20)`)

    const legendItem = legend.selectAll(".legend")
      .data(data)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)

    legendItem.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", d => color(d.label))

    legendItem.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .text(d => d.label)

    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove()
    }
  }, [data, width, height])

  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <svg ref={svgRef} role="img" aria-label={title ?? 'Pie chart'} />
    </div>
  )
}