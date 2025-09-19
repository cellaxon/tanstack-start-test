# Rotel 사전 빌드 바이너리 사용 가이드

## 1. 바이너리 다운로드

### GitHub Releases에서 다운로드
1. [Rotel Releases 페이지](https://github.com/streamfold/rotel/releases)에 접속
2. 최신 버전(현재 v0.0.1-alpha30) 선택
3. 운영체제에 맞는 바이너리 다운로드:
   - `rotel-linux-x86_64` (Linux 64bit)
   - `rotel-darwin-x86_64` (macOS Intel)
   - `rotel-darwin-arm64` (macOS Apple Silicon)
   - `rotel-windows-x86_64.exe` (Windows)

### 다운로드 명령어 (Linux/macOS)
```bash
# 최신 버전 확인 후 다운로드
wget https://github.com/streamfold/rotel/releases/download/v0.0.1-alpha30/rotel-linux-x86_64

# 실행 권한 부여
chmod +x rotel-linux-x86_64

# 편의를 위해 이름 변경
mv rotel-linux-x86_64 rotel
```

## 2. 기본 사용법

### 간단한 실행
```bash
# 기본 실행 (blackhole exporter로 테스트)
./rotel --debug-log traces --exporter blackhole

# OTLP 수신 포트 확인
# gRPC: localhost:4317
# HTTP: localhost:4318
```

### Docker 이미지 사용 (권장)
```bash
# 사전 빌드된 Docker 이미지 사용
docker run -ti -p 4317-4318:4317-4318 streamfold/rotel \
  --debug-log traces --exporter blackhole
```

## 3. 설정 옵션

### 명령어 인수
Rotel은 명령어 인수로 설정할 수 있습니다:

```bash
# 기본 OTLP 출력 설정
./rotel \
  --exporter otlp \
  --otlp-exporter-endpoint https://api.example.com \
  --otlp-exporter-custom-headers "x-api-key=your-key"

# ClickHouse 출력 설정
./rotel \
  --exporter clickhouse \
  --clickhouse-exporter-dsn "tcp://localhost:9000/otel" \
  --clickhouse-exporter-username default \
  --clickhouse-exporter-password ""

# 다중 출력 설정
./rotel \
  --exporter otlp,datadog \
  --otlp-exporter-endpoint https://otlp.example.com \
  --datadog-exporter-api-key your-dd-key
```

### 환경 변수
모든 CLI 인수는 환경 변수로도 설정 가능합니다 (`ROTEL_` 접두사 + 하이픈을 언더스코어로 변경):

```bash
# 환경 변수 설정
export ROTEL_EXPORTER=otlp
export ROTEL_OTLP_EXPORTER_ENDPOINT=https://api.example.com
export ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="x-api-key=your-key"

# 실행
./rotel
```

## 4. 지원되는 Exporter

### OTLP Exporter (기본)
```bash
./rotel \
  --exporter otlp \
  --otlp-exporter-endpoint https://api.honeycomb.io \
  --otlp-exporter-protocol http \
  --otlp-exporter-custom-headers "x-honeycomb-team=your-key"
```

### ClickHouse Exporter
```bash
./rotel \
  --exporter clickhouse \
  --clickhouse-exporter-dsn "tcp://localhost:9000/otel" \
  --clickhouse-exporter-traces-table traces \
  --clickhouse-exporter-logs-table logs
```

### Datadog Exporter
```bash
./rotel \
  --exporter datadog \
  --datadog-exporter-api-key your-datadog-key \
  --datadog-exporter-site datadoghq.com
```

### Kafka Exporter
```bash
./rotel \
  --exporter kafka \
  --kafka-exporter-brokers localhost:9092 \
  --kafka-exporter-topic otel-data
```

### AWS CloudWatch (X-Ray)
```bash
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1

./rotel \
  --exporter otlp \
  --otlp-exporter-protocol http \
  --otlp-exporter-traces-endpoint https://xray.us-east-1.amazonaws.com/v1/traces \
  --otlp-exporter-authenticator sigv4auth
```

## 5. 테스트 및 검증

### 테스트 데이터 생성
```bash
# OpenTelemetry 테스트 도구 설치
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest

# 테스트 추적 데이터 전송
telemetrygen traces --otlp-insecure --duration 5s

# 테스트 메트릭 데이터 전송
telemetrygen metrics --otlp-insecure --duration 5s

# 테스트 로그 데이터 전송
telemetrygen logs --otlp-insecure --duration 5s
```

### 디버그 로그 활성화
```bash
# 특정 데이터 타입 디버그
./rotel --debug-log traces --exporter blackhole
./rotel --debug-log metrics --exporter blackhole
./rotel --debug-log logs --exporter blackhole

# 모든 데이터 타입 디버그
./rotel --debug-log traces,metrics,logs --exporter blackhole
```

## 6. 고급 설정

### 다중 Receiver 설정
```bash
./rotel \
  --receiver otlp,kafka \
  --kafka-receiver-brokers localhost:9092 \
  --kafka-receiver-topic input-otel
```

### 배치 처리 설정
```bash
./rotel \
  --batch-timeout 5s \
  --batch-size 512 \
  --exporter otlp \
  --otlp-exporter-endpoint https://api.example.com
```

### 신호 처리 (SIGUSR1로 강제 플러시)
```bash
# 백그라운드 실행
./rotel --exporter otlp --otlp-exporter-endpoint https://api.example.com &

# 강제 플러시
kill -USR1 $!
```

## 7. 일반적인 사용 예시

### Honeycomb으로 전송
```bash
./rotel \
  --exporter otlp \
  --otlp-exporter-endpoint https://api.honeycomb.io \
  --otlp-exporter-protocol http \
  --otlp-exporter-custom-headers "x-honeycomb-team=your-api-key"
```

### Jaeger로 전송
```bash
./rotel \
  --exporter otlp \
  --otlp-exporter-endpoint http://localhost:4318
```

### Grafana Cloud로 전송
```bash
./rotel \
  --exporter otlp \
  --otlp-exporter-endpoint https://otlp-gateway-prod-us-central-0.grafana.net/otlp \
  --otlp-exporter-custom-headers "Authorization=Basic base64(instance_id:api_key)"
```

## 8. 성능 최적화

Rotel의 주요 장점:
- **경량화**: 기존 OTEL Collector 대비 75% 적은 메모리 사용
- **고성능**: 50% 적은 CPU 사용량
- **소형 바이너리**: 컨테이너 이미지 크기 최소화
- **빠른 시작**: 콜드 스타트 지연 시간 최소화

## 참고 사항

- Rotel은 Rust로 작성된 경량 OpenTelemetry Collector입니다
- 현재 alpha 버전이므로 프로덕션 사용 시 주의가 필요합니다
- 공식 문서: https://rotel.dev
- GitHub: https://github.com/streamfold/rotel
