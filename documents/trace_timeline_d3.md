D3.js를 사용하여 trace를 타임라인으로 시각화하는 것은 매우 효과적인 방법입니다. trace 데이터의 성격(성능 프로파일링, 분산 시스템 추적, 이벤트 로그 등)에 따라 다양한 접근법이 있습니다. 주요 구현 방법들을 소개하겠습니다.

## 기본 타임라인 구조

먼저 기본적인 타임라인을 설정하는 방법입니다. SVG 컨테이너를 만들고 시간 축과 스케일을 설정합니다:

```javascript
const margin = {top: 20, right: 20, bottom: 30, left: 100};
const width = 1200 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// SVG 생성
const svg = d3.select("#timeline")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// 시간 스케일 설정
const xScale = d3.scaleTime()
  .domain([minTime, maxTime])
  .range([0, width]);

const yScale = d3.scaleBand()
  .domain(traces.map(d => d.name))
  .range([0, height])
  .padding(0.1);
```

## Gantt 차트 스타일 (Span 기반 Trace)

분산 추적이나 성능 프로파일링에서 자주 사용되는 span 기반 trace의 경우:

```javascript
// 데이터 구조 예시
const traceData = [
  {
    traceId: "trace-1",
    spans: [
      {id: "span-1", name: "HTTP Request", startTime: 0, duration: 120, level: 0},
      {id: "span-2", name: "Database Query", startTime: 20, duration: 50, level: 1},
      {id: "span-3", name: "Cache Lookup", startTime: 75, duration: 10, level: 1}
    ]
  }
];

// Span 렌더링
const spans = g.selectAll(".span")
  .data(traceData[0].spans)
  .enter().append("g")
  .attr("class", "span");

spans.append("rect")
  .attr("x", d => xScale(d.startTime))
  .attr("y", d => yScale(d.level))
  .attr("width", d => xScale(d.startTime + d.duration) - xScale(d.startTime))
  .attr("height", yScale.bandwidth())
  .attr("fill", d => colorScale(d.name))
  .attr("opacity", 0.8);

// 텍스트 레이블
spans.append("text")
  .attr("x", d => xScale(d.startTime) + 5)
  .attr("y", d => yScale(d.level) + yScale.bandwidth() / 2)
  .attr("dy", "0.35em")
  .text(d => d.name)
  .style("font-size", "12px");
```

## Flame Graph 스타일

CPU 프로파일링 trace의 경우 flame graph 스타일이 효과적입니다:

```javascript
function renderFlameGraph(data) {
  const hierarchy = d3.hierarchy(data)
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);
  
  const root = d3.partition()
    .size([width, height])
    .padding(1)(hierarchy);
  
  const cell = g.selectAll(".cell")
    .data(root.descendants())
    .enter().append("g")
    .attr("class", "cell")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);
  
  cell.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => color(d.data.name));
  
  cell.append("text")
    .attr("x", 4)
    .attr("y", 13)
    .text(d => d.data.name);
}
```

## 인터랙티브 기능 추가

사용자 경험을 향상시키기 위한 인터랙션:

```javascript
// 줌 기능
const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .translateExtent([[0, 0], [width, height]])
  .on("zoom", (event) => {
    const newXScale = event.transform.rescaleX(xScale);
    
    // X축 업데이트
    g.select(".x-axis").call(d3.axisBottom(newXScale));
    
    // Span 위치 업데이트
    g.selectAll(".span rect")
      .attr("x", d => newXScale(d.startTime))
      .attr("width", d => newXScale(d.startTime + d.duration) - newXScale(d.startTime));
  });

svg.call(zoom);

// 툴팁
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

spans.on("mouseover", (event, d) => {
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(`
      <strong>${d.name}</strong><br/>
      Start: ${d.startTime}ms<br/>
      Duration: ${d.duration}ms
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

// 클릭 이벤트 (상세 정보 표시)
spans.on("click", (event, d) => {
  showDetailPanel(d);
});
```

## Waterfall 차트 (네트워크 trace)

네트워크 요청 trace의 경우:

```javascript
function renderWaterfall(requests) {
  const bars = g.selectAll(".request")
    .data(requests)
    .enter().append("g")
    .attr("class", "request");
  
  // 연결선 (대기 시간)
  bars.append("line")
    .attr("x1", d => xScale(d.startTime))
    .attr("y1", d => yScale(d.resource) + yScale.bandwidth() / 2)
    .attr("x2", d => xScale(d.responseStart))
    .attr("y2", d => yScale(d.resource) + yScale.bandwidth() / 2)
    .style("stroke", "#999")
    .style("stroke-width", 1);
  
  // 다운로드 시간
  bars.append("rect")
    .attr("x", d => xScale(d.responseStart))
    .attr("y", d => yScale(d.resource))
    .attr("width", d => xScale(d.endTime) - xScale(d.responseStart))
    .attr("height", yScale.bandwidth())
    .attr("fill", d => getColorByType(d.type));
}
```

## 최적화 팁

대량의 trace 데이터를 다룰 때:

```javascript
// 가상 스크롤링 구현
function virtualScroll(data, viewportHeight, rowHeight) {
  const visibleStart = Math.floor(scrollTop / rowHeight);
  const visibleEnd = Math.ceil((scrollTop + viewportHeight) / rowHeight);
  const visibleData = data.slice(visibleStart, visibleEnd);
  
  // 보이는 데이터만 렌더링
  renderSpans(visibleData, visibleStart * rowHeight);
}

// 데이터 집계 (레벨에 따라)
function aggregateByZoomLevel(data, zoomLevel) {
  if (zoomLevel < 0.5) {
    // 매우 축소된 상태: 주요 span만 표시
    return data.filter(d => d.duration > threshold);
  }
  return data;
}

// Canvas 렌더링 (성능이 중요한 경우)
function renderWithCanvas(data) {
  const canvas = d3.select("#timeline").append("canvas")
    .attr("width", width)
    .attr("height", height);
  
  const context = canvas.node().getContext("2d");
  
  data.forEach(d => {
    context.fillStyle = colorScale(d.type);
    context.fillRect(
      xScale(d.startTime),
      yScale(d.level),
      xScale(d.startTime + d.duration) - xScale(d.startTime),
      yScale.bandwidth()
    );
  });
}
```

이러한 기법들을 조합하여 trace 데이터의 특성과 요구사항에 맞는 타임라인 시각화를 구현할 수 있습니다. 특히 중요한 것은 데이터의 양과 복잡도에 따라 적절한 렌더링 방식(SVG vs Canvas)과 인터랙션 수준을 선택하는 것입니다.
