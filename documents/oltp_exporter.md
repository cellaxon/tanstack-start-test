# OTLP Exporter 완전 가이드

## OTLP Exporter란?

**OTLP (OpenTelemetry Protocol) Exporter**는 OpenTelemetry에서 수집한 관측성 데이터(메트릭, 트레이스, 로그)를 다른 시스템으로 전송하는 컴포넌트입니다.

### 핵심 특징
- **표준화된 프로토콜**: OpenTelemetry 공식 표준 프로토콜
- **다중 데이터 타입 지원**: 메트릭, 트레이스, 로그를 모두 처리
- **유연한 전송 방식**: gRPC, HTTP/Protobuf, HTTP/JSON 지원
- **벤더 중립적**: 다양한 관측성 플랫폼과 호환

## OTLP 프로토콜 종류

### 1. gRPC (권장)
- **특징**: 고성능, 양방향 스트리밍, 압축 지원
- **포트**: 기본 4317
- **사용 사례**: 높은 처리량이 필요한 프로덕션 환경

### 2. HTTP/Protobuf
- **특징**: HTTP 기반, Protobuf 직렬화
- **포트**: 기본 4318
- **사용 사례**: 방화벽 제약이 있는 환경

### 3. HTTP/JSON
- **특징**: 사람이 읽기 쉬운 JSON 형태
- **포트**: 기본 4318
- **사용 사례**: 디버깅, 개발 환경

## 사용 방법

### 1. 애플리케이션에서 OTLP Exporter 설정

#### Python 예시
```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# OTLP Exporter 설정
otlp_exporter = OTLPSpanExporter(
    endpoint="http://localhost:4317",
    headers={
        "api-key": "your-api-key",
        "x-custom-header": "value"
    },
    insecure=True  # 개발 환경에서만 사용
)

# Tracer Provider 설정
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Span Processor 추가
span_processor = BatchSpanProcessor(otlp_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)
```

#### Node.js 예시
```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4317',
    headers: {
      'api-key': 'your-api-key',
    },
  }),
  metricExporter: new OTLPMetricExporter({
    url: 'http://localhost:4317',
    headers: {
      'api-key': 'your-api-key',
    },
  }),
});

sdk.start();
```

#### Java 예시
```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;

OtlpGrpcSpanExporter spanExporter = OtlpGrpcSpanExporter.builder()
    .setEndpoint("http://localhost:4317")
    .addHeader("api-key", "your-api-key")
    .build();

SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
    .addSpanProcessor(BatchSpanProcessor.builder(spanExporter).build())
    .build();

OpenTelemetry openTelemetry = OpenTelemetrySdk.builder()
    .setTracerProvider(tracerProvider)
    .build();
```

### 2. 환경 변수로 설정

```bash
# gRPC Exporter
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
export OTEL_EXPORTER_OTLP_HEADERS="api-key=your-key,x-custom=value"
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc

# HTTP Exporter
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# 개별 엔드포인트 설정
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://localhost:4318/v1/logs
```

### 3. OpenTelemetry Collector에서 OTLP Exporter 설정

```yaml
# collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger:
    endpoint: http://jaeger:14250
    tls:
      insecure: true
  
  otlp/honeycomb:
    endpoint: https://api.honeycomb.io:443
    headers:
      "x-honeycomb-team": "${HONEYCOMB_API_KEY}"
  
  otlp/grafana:
    endpoint: https://otlp-gateway-prod-us-central-0.grafana.net/otlp
    headers:
      authorization: "Basic ${GRAFANA_CLOUD_API_KEY}"

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp/jaeger, otlp/honeycomb]
    
    metrics:
      receivers: [otlp]
      exporters: [otlp/grafana]
```

## 주요 관측성 플랫폼과의 연동

### 1. Jaeger
```bash
# 환경 변수
export OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:14250
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```

### 2. Honeycomb
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=your-api-key"
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
```

### 3. Grafana Cloud
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
export OTEL_EXPORTER_OTLP_HEADERS="authorization=Basic $(echo -n 'instance_id:api_key' | base64)"
```

### 4. AWS X-Ray
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://xray.us-east-1.amazonaws.com/v1/traces
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 5. Datadog
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.datadoghq.com
export OTEL_EXPORTER_OTLP_HEADERS="dd-api-key=your-datadog-api-key"
```

### 6. New Relic
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net:4317
export OTEL_EXPORTER_OTLP_HEADERS="api-key=your-new-relic-license-key"
```

## 고급 설정 옵션

### 배치 처리 설정
```python
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# 배치 처리 옵션
span_processor = BatchSpanProcessor(
    otlp_exporter,
    max_queue_size=2048,        # 큐 최대 크기
    export_timeout_millis=30000, # 내보내기 타임아웃
    schedule_delay_millis=5000,  # 배치 지연 시간
    max_export_batch_size=512    # 한 번에 보낼 최대 span 수
)
```

### 압축 설정
```python
# gRPC 압축
otlp_exporter = OTLPSpanExporter(
    endpoint="http://localhost:4317",
    compression="gzip"  # gzip 압축 사용
)
```

### TLS/SSL 설정
```python
# 보안 연결
otlp_exporter = OTLPSpanExporter(
    endpoint="https://secure-endpoint.com:4317",
    credentials=ChannelCredentials(
        root_certificates=None,  # 시스템 CA 사용
        private_key=None,
        certificate_chain=None
    )
)
```

### 재시도 설정
```python
# 재시도 정책
otlp_exporter = OTLPSpanExporter(
    endpoint="http://localhost:4317",
    timeout=10,  # 요청 타임아웃 (초)
)
```

## 실제 사용 예시

### Docker Compose 환경
```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
      - OTEL_EXPORTER_OTLP_PROTOCOL=grpc
      - OTEL_SERVICE_NAME=my-app
    depends_on:
      - otel-collector

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports:
      - "4317:4317"
      - "4318:4318"
    volumes:
      - ./collector-config.yaml:/etc/collector-config.yaml
    command: ["--config=/etc/collector-config.yaml"]

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14250:14250"
```

### Kubernetes 환경
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-app:latest
        env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://otel-collector:4317"
        - name: OTEL_EXPORTER_OTLP_PROTOCOL
          value: "grpc"
        - name: OTEL_SERVICE_NAME
          value: "my-app"
---
apiVersion: v1
kind: Service
metadata:
  name: otel-collector
spec:
  ports:
  - port: 4317
    name: grpc
  - port: 4318
    name: http
```

## 성능 최적화 팁

### 1. 프로토콜 선택
- **높은 처리량**: gRPC 사용
- **방화벽 제약**: HTTP/Protobuf 사용
- **디버깅**: HTTP/JSON 사용

### 2. 배치 크기 조정
```python
# 높은 처리량 환경
BatchSpanProcessor(
    exporter,
    max_export_batch_size=1024,  # 큰 배치 크기
    schedule_delay_millis=1000   # 짧은 지연
)

# 낮은 지연 시간 환경
BatchSpanProcessor(
    exporter,
    max_export_batch_size=128,   # 작은 배치 크기
    schedule_delay_millis=100    # 매우 짧은 지연
)
```

### 3. 샘플링 설정
```python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# 10% 샘플링
tracer_provider = TracerProvider(
    sampler=TraceIdRatioBased(0.1)
)
```

## 문제 해결

### 일반적인 오류와 해결책

#### 1. 연결 오류
```bash
# 엔드포인트 확인
curl -v http://localhost:4317
netstat -an | grep 4317
```

#### 2. 인증 오류
```python
# 헤더 확인
headers = {
    "authorization": "Bearer your-token",
    "x-api-key": "your-key"
}
```

#### 3. 데이터 손실
```python
# 더 큰 큐 크기 설정
BatchSpanProcessor(
    exporter,
    max_queue_size=8192,
    export_timeout_millis=60000
)
```

## 모니터링 및 디버깅

### 로깅 활성화
```python
import logging
logging.basicConfig(level=logging.DEBUG)

# OpenTelemetry 로그 활성화
logging.getLogger("opentelemetry").setLevel(logging.DEBUG)
```

### 메트릭 확인
```bash
# Collector 메트릭 엔드포인트
curl http://localhost:8888/metrics
```

## 결론

OTLP Exporter는 OpenTelemetry 생태계의 핵심 컴포넌트로, 표준화된 방식으로 관측성 데이터를 다양한 백엔드 시스템으로 전송할 수 있게 해줍니다. 적절한 설정과 최적화를 통해 높은 성능과 안정성을 확보할 수 있습니다.
