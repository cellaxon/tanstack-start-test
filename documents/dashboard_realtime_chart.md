API Gateway 대시보드에서 CPU, MEMORY 같은 실시간 데이터를 D3.js 차트로 시각화하는 것은 흔한 요구사항입니다. React와 D3.js를 함께 사용할 때, 데이터 관리와 렌더링을 효율적으로 분리하는 것이 중요합니다.

여기에는 두 가지 주요 접근 방식이 있으며, 각각의 장단점을 고려하여 프로젝트에 맞는 방법을 선택할 수 있습니다.

# 1. TanStack Query를 사용하여 데이터 업데이트 관리하기 (권장)

TanStack Query는 서버 상태(Server State)를 관리하는 데 특화된 라이브러리입니다. 실시간 데이터 스트리밍을 직접 처리하기보다는, 주기적으로 데이터를 가져와서 UI를 업데이트하는 방식에 매우 강력합니다.

## 장점:

- 코드 단순화: 데이터 패칭, 캐싱, 동기화, 에러 처리 로직을 추상화하여 코드를 간결하게 만듭니다.

- 자동 갱신: refetchInterval 옵션을 사용하여 일정 주기(예: 1초마다)로 API를 자동 호출하여 최신 데이터를 가져올 수 있습니다.

- 성능 최적화: 중복 요청을 방지하고, 윈도우 포커스/네트워크 재연결 시 자동으로 데이터를 갱신하는 기능이 내장되어 있습니다.

## 구현 방식:

### 1. TanStack Query 설정:

useQuery 훅을 사용하여 API에서 CPU, MEMORY 데이터를 가져오는 쿼리를 정의합니다. 이때 refetchInterval 옵션을 설정합니다.

```ts
// src/hooks/useRealtimeMetrics.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchSystemMetrics = async () => {
  // 실제 API 엔드포인트
  const response = await axios.get('/api/metrics/realtime');
  return response.data;
};

export function useRealtimeMetrics() {
  return useQuery({
    queryKey: ['systemMetrics'],
    queryFn: fetchSystemMetrics,
    refetchInterval: 1000, // 1초마다 데이터 자동 갱신
    staleTime: 1000, // 데이터가 1초 동안 "fresh" 상태를 유지하도록 설정
  });
}
```

### 2. React 컴포넌트에서 데이터 사용:

차트를 그릴 컴포넌트에서 위에서 만든 훅을 호출하고, data가 변경될 때마다 D3.js 렌더링 함수를 호출합니다. useEffect 훅을 사용하면 data가 바뀔 때만 차트가 다시 그려지도록 할 수 있습니다.

```ts
// src/components/CpuMemoryChart.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

const CpuMemoryChart = () => {
  const svgRef = useRef(null);
  const { data, isLoading, isError } = useRealtimeMetrics();

  useEffect(() => {
    if (isLoading || isError || !data) return;

    // D3.js를 사용하여 차트 업데이트
    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // 데이터와 D3.js를 연결하여 차트 그리기 또는 업데이트
    // 이 부분에 D3.js의 Enter-Update-Exit 패턴 로직이 들어갑니다.
    // 예를 들어, SVG rect 요소를 데이터에 바인딩하여 높이를 변경하는 방식입니다.

    // 예시: 간단한 바 차트 업데이트
    svg.selectAll("rect")
       .data(data.cpu) // data.cpu는 CPU 사용률 배열이라고 가정
       .join("rect")
       .attr("x", (d, i) => i * 50)
       .attr("y", d => height - d)
       .attr("width", 40)
       .attr("height", d => d)
       .attr("fill", "steelblue");

  }, [data, isLoading, isError]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data.</div>;

  return (
    <svg ref={svgRef} width="500" height="300">
      {/* D3.js가 차트를 그릴 SVG 컨테이너 */}
    </svg>
  );
};

export default CpuMemoryChart;
```

이 방식은 TanStack Query가 데이터를 관리하고, D3.js는 데이터를 받아서 UI를 렌더링하는 역할만 맡게 되어 관심사(Concern)가 분리됩니다.


# 2. WebSockets 또는 SSE(Server-Sent Events) 사용하기
진정한 실시간 데이터 업데이트가 필요한 경우, 서버에서 데이터를 실시간으로 클라이언트로 푸시하는 WebSockets 또는 SSE를 사용하는 것이 가장 효율적입니다.

## 장점:

- 즉각적인 업데이트: 서버에서 데이터가 변경되는 즉시 클라이언트에 알림이 전달되어 거의 지연 없는 실시간 업데이트가 가능합니다.

- 네트워크 효율성: HTTP 요청-응답 모델보다 데이터 전송 오버헤드가 적습니다.

## 구현 방식:

### 1. WebSocket 연결 관리:

- useEffect 훅을 사용하여 컴포넌트가 마운트될 때 WebSocket 연결을 설정하고, 언마운트될 때 연결을 해제합니다.

- useState나 useReducer 훅을 사용하여 WebSocket으로 들어오는 데이터를 관리합니다.

```ts
// src/components/RealtimeChartWithWS.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RealtimeChartWithWS = () => {
  const [metrics, setMetrics] = useState([]);
  const svgRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://your-api-gateway-ws-url');

    ws.onmessage = (event) => {
      const newMetrics = JSON.parse(event.data);
      // 새로운 데이터를 기존 데이터에 추가
      setMetrics(prevMetrics => {
        // 차트의 데이터 크기를 일정하게 유지 (예: 최근 50개 데이터 포인트)
        const updatedMetrics = [...prevMetrics, newMetrics];
        if (updatedMetrics.length > 50) {
          updatedMetrics.shift();
        }
        return updatedMetrics;
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    // `metrics` 데이터가 업데이트될 때마다 D3.js 차트 렌더링
    if (metrics.length > 0) {
      // D3.js 차트 업데이트 로직 (Enter-Update-Exit 패턴)
      // ...
    }
  }, [metrics]);

  return <svg ref={svgRef} />;
};
```

### 2. D3.js의 Enter-Update-Exit 패턴 활용:

- D3.js는 데이터가 실시간으로 변할 때 join() 메서드를 사용한 enter(), update(), exit() 패턴으로 DOM 요소를 효율적으로 관리합니다.

- 새로운 데이터 포인트가 들어오면 enter()로 새로운 SVG 요소를 추가하고, 기존 데이터 포인트는 update()로 속성을 업데이트하며, 범위를 벗어난 데이터 포인트는 exit()로 제거합니다. 이 방식은 DOM 조작을 최소화하여 성능을 최적화합니다.

## 결론 및 권장 사항
대부분의 API Gateway 대시보드 환경에서는 TanStack Query와 refetchInterval 옵션을 사용하는 방식이 가장 효율적이고 유지보수하기 쉽습니다.

- CPU, MEMORY 같은 지표는 보통 1~5초 간격으로 업데이트해도 충분히 "실시간"처럼 느껴집니다.

- WebSocket 서버를 구축하고 관리하는 복잡성을 피할 수 있습니다.

- TanStack Query의 강력한 캐싱 및 에러 핸들링 기능을 활용하여 애플리케이션의 안정성을 높일 수 있습니다.

만약 금융 거래소의 실시간 주가 차트처럼 밀리초 단위의 즉각적인 업데이트가 필수적이라면 WebSocket을 고려해야 합니다. 하지만 일반적인 대시보드라면 TanStack Query만으로도 충분히 훌륭한 사용자 경험을 제공할 수 있습니다.

