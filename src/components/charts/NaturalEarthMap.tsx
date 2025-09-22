import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import countries110m from 'world-atlas/countries-110m.json';
import land110m from 'world-atlas/land-110m.json';

interface MapData {
  region: string;
  lat: number;
  lng: number;
  requests: number;
  latency: number;
  errorRate: string;
}

interface NaturalEarthMapProps {
  data: MapData[];
}

export function NaturalEarthMap({ data }: NaturalEarthMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mapType, setMapType] = useState<'korea' | 'world'>('world');
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the TopoJSON to GeoJSON conversion
  const geoData = useMemo(() => {
    try {
      return {
        worldLand: feature(land110m as any, (land110m as any).objects.land),
        worldCountries: feature(countries110m as any, (countries110m as any).objects.countries)
      };
    } catch (error) {
      console.error('Error converting TopoJSON to GeoJSON:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const width = 900;
    const height = 500;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 100%)');

    // Create groups
    const mapGroup = svg.append('g').attr('class', 'map-group');
    const dataGroup = svg.append('g').attr('class', 'data-group');

    // Create projection
    let projection: d3.GeoProjection;

    if (mapType === 'korea') {
      // Focus on Korea
      projection = d3.geoMercator()
        .center([127.5, 36])
        .scale(4000)
        .translate([width / 2, height / 2]);
    } else {
      // World view
      projection = d3.geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]);
    }

    const pathGenerator = d3.geoPath().projection(projection);

    // Use the memoized geo data
    if (!geoData) {
      setIsLoading(false);
      console.error('Failed to load map data');
      return;
    }

    try {
      // Draw land
      mapGroup.append('path')
        .datum(geoData.worldLand)
        .attr('d', pathGenerator as any)
        .attr('fill', '#e5e7eb')
        .attr('stroke', 'none');

      // Draw countries
      mapGroup.selectAll('.country')
        .data(geoData.worldCountries.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator as any)
        .attr('fill', (d: any) => {
          // Highlight Korea
          if (d.properties?.name === 'South Korea' || d.properties?.name === 'Korea') {
            return '#bfdbfe';
          }
          return '#f3f4f6';
        })
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d: any) {
          d3.select(this).attr('fill', '#93c5fd');
          setHoveredCountry(d.properties?.name || 'Unknown');
        })
        .on('mouseout', function(event, d: any) {
          d3.select(this).attr('fill',
            d.properties?.name === 'South Korea' ? '#bfdbfe' : '#f3f4f6'
          );
          setHoveredCountry(null);
        });

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading map data:', error);
      setIsLoading(false);
    }

    // Calculate max requests for scaling
    const maxRequests = Math.max(...data.map(d => d.requests));

    // Color scale
    const colorScale = d3.scaleSequential()
      .domain([0, maxRequests])
      .interpolator(d3.interpolateOrRd);

    // Size scale for bubbles
    const sizeScale = d3.scaleSqrt()
      .domain([0, maxRequests])
      .range([3, 25]);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');

    // Filter data based on map type
    const displayData = mapType === 'korea'
      ? data.filter(d => ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan'].includes(d.region))
      : data;

    // Draw data points
    displayData.forEach(city => {
      const coords = projection([city.lng, city.lat]);
      if (!coords) return;

      const [x, y] = coords;

      // Add glow effect for large cities
      if (city.requests > maxRequests * 0.5) {
        dataGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', sizeScale(city.requests) * 1.5)
          .attr('fill', colorScale(city.requests))
          .attr('fill-opacity', 0.2)
          .attr('stroke', 'none');
      }

      // Draw main circle
      dataGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', sizeScale(city.requests))
        .attr('fill', colorScale(city.requests))
        .attr('fill-opacity', 0.8)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
        .on('mouseover', function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', sizeScale(city.requests) * 1.3)
            .attr('fill-opacity', 1);

          tooltip.transition()
            .duration(200)
            .style('opacity', 0.95);

          const errorColor = parseFloat(city.errorRate) < 1 ? '#10b981' :
                            parseFloat(city.errorRate) < 2 ? '#f59e0b' : '#ef4444';
          const latencyColor = city.latency < 50 ? '#10b981' :
                              city.latency < 100 ? '#f59e0b' : '#ef4444';

          tooltip.html(`
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px;">
              ${city.region}
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span style="color: #9ca3af;">요청:</span>
              <span style="font-weight: bold;">${city.requests.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span style="color: #9ca3af;">레이턴시:</span>
              <span style="color: ${latencyColor}; font-weight: bold;">${city.latency}ms</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span style="color: #9ca3af;">에러율:</span>
              <span style="color: ${errorColor}; font-weight: bold;">${city.errorRate}%</span>
            </div>
          `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', sizeScale(city.requests))
            .attr('fill-opacity', 0.8);

          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });

      // Draw city label for major cities
      if (city.requests > maxRequests * 0.4) {
        dataGroup.append('text')
          .attr('x', x)
          .attr('y', y - sizeScale(city.requests) - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('fill', '#1e293b')
          .style('text-shadow', '0 0 3px white, 0 0 3px white')
          .style('pointer-events', 'none')
          .text(city.region);
      }
    });

    // Add legend
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${width - 180}, ${height - 120})`);

    // Legend background
    legendGroup.append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', 170)
      .attr('height', 100)
      .attr('fill', 'white')
      .attr('fill-opacity', 0.9)
      .attr('rx', 8)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // Legend title
    legendGroup.append('text')
      .attr('x', 75)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text('요청 수');

    // Gradient for legend
    const gradientId = 'natural-earth-gradient';
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('x2', '100%');

    for (let i = 0; i <= 10; i++) {
      gradient.append('stop')
        .attr('offset', `${i * 10}%`)
        .attr('stop-color', d3.interpolateOrRd(i / 10));
    }

    legendGroup.append('rect')
      .attr('x', 10)
      .attr('y', 20)
      .attr('width', 130)
      .attr('height', 15)
      .attr('fill', `url(#${gradientId})`);

    legendGroup.append('text')
      .attr('x', 10)
      .attr('y', 50)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text('0');

    legendGroup.append('text')
      .attr('x', 140)
      .attr('y', 50)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text(maxRequests.toLocaleString());

    // Size legend
    const sizes = [maxRequests * 0.2, maxRequests * 0.5, maxRequests];
    legendGroup.selectAll('.size-legend')
      .data(sizes)
      .enter()
      .append('circle')
      .attr('cx', 30 + sizes.indexOf(maxRequests) * 30)
      .attr('cy', 70)
      .attr('r', d => sizeScale(d))
      .attr('fill', 'none')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1);

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [data, mapType, geoData]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => setMapType('world')}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            mapType === 'world'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-105'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          🌍 세계 지도
        </button>
        <button
          onClick={() => setMapType('korea')}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            mapType === 'korea'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-105'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          🇰🇷 한국 지도
        </button>
      </div>

      <div className="relative bg-white rounded-xl shadow-xl p-6">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
            <div className="text-gray-500">지도를 불러오는 중...</div>
          </div>
        )}

        <svg ref={svgRef} className="w-full h-auto"></svg>

        {hoveredCountry && (
          <div className="absolute top-8 left-8 bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium border border-gray-200">
            {hoveredCountry}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Data: Natural Earth (Public Domain) | naturalearthdata.com
      </div>
    </div>
  );
}