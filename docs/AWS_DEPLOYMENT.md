# AWS S3 + CloudFront 배포 가이드

## 목차
1. [S3 버킷 생성 및 설정](#1-s3-버킷-생성-및-설정)
2. [CloudFront 배포 (선택사항)](#2-cloudfront-배포-선택사항)
3. [자동 배포 스크립트 사용](#3-자동-배포-스크립트-사용)
4. [수동 배포 방법](#4-수동-배포-방법)
5. [문제 해결](#5-문제-해결)

## 1. S3 버킷 생성 및 설정

### 1.1 S3 버킷 생성
```bash
aws s3 mb s3://your-app-name --region ap-northeast-2
```

### 1.2 정적 웹사이트 호스팅 활성화
```bash
aws s3 website s3://your-app-name \
  --index-document index.html \
  --error-document index.html
```

### 1.3 버킷 정책 설정 (퍼블릭 액세스)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-name/*"
    }
  ]
}
```

## 2. CloudFront 배포 (선택사항)

CloudFront를 사용하면 더 빠른 로딩 속도와 HTTPS를 제공받을 수 있습니다.

### 2.1 CloudFront Distribution 생성

1. AWS Console에서 CloudFront 서비스로 이동
2. "Create Distribution" 클릭
3. Origin Settings:
   - Origin Domain Name: `your-app-name.s3.amazonaws.com`
   - Origin Path: 비워둠
   - S3 Bucket Access: Yes use OAI (권장)

4. Default Cache Behavior:
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache Policy: CachingOptimized

5. Distribution Settings:
   - Price Class: 필요한 지역 선택
   - Default Root Object: `index.html`

### 2.2 Error Pages 설정 (중요!)

CloudFront Console > Error Pages > Create Custom Error Response:

| Error Code | Response Page Path | HTTP Response Code |
|------------|-------------------|-------------------|
| 404        | /index.html       | 200               |
| 403        | /index.html       | 200               |

### 2.3 CloudFront Function 설정 (대안)

`aws/cloudfront-functions.js` 파일을 CloudFront Function으로 등록:

1. CloudFront > Functions > Create function
2. 함수 코드 붙여넣기
3. Publish 후 Distribution과 연결 (Viewer Request)

## 3. 자동 배포 스크립트 사용

### 3.1 AWS CLI 설정
```bash
# AWS CLI 설치
brew install awscli  # macOS
# 또는
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# AWS 자격 증명 설정
aws configure
# AWS Access Key ID 입력
# AWS Secret Access Key 입력
# Default region: ap-northeast-2
# Default output format: json
```

### 3.2 배포 스크립트 실행
```bash
# S3만 사용하는 경우
./scripts/deploy-s3.sh your-bucket-name

# 특정 AWS Profile 사용
./scripts/deploy-s3.sh your-bucket-name production-profile
```

### 3.3 package.json에 배포 명령 추가
```json
{
  "scripts": {
    "deploy:s3": "./scripts/deploy-s3.sh your-bucket-name",
    "deploy:s3:prod": "./scripts/deploy-s3.sh your-bucket-name production"
  }
}
```

## 4. 수동 배포 방법

### 4.1 빌드
```bash
npm run build:static
```

### 4.2 S3에 업로드
```bash
# HTML 파일 제외 업로드 (캐시 설정)
aws s3 sync dist/ s3://your-bucket-name/ \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000"

# HTML 파일 업로드 (캐시 안함)
aws s3 sync dist/ s3://your-bucket-name/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache"
```

### 4.3 CloudFront 캐시 무효화 (CloudFront 사용 시)
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 5. 문제 해결

### 5.1 라우팅이 작동하지 않는 경우

**S3 단독 사용 시:**
- Error Document를 `index.html`로 설정했는지 확인
- S3 정적 웹사이트 호스팅이 활성화되어 있는지 확인

**CloudFront 사용 시:**
- Custom Error Response 설정 확인 (404 → 200)
- CloudFront Function이 제대로 연결되어 있는지 확인

### 5.2 403 Forbidden 오류

- S3 버킷 정책에서 퍼블릭 읽기 권한 확인
- CloudFront OAI 설정 확인

### 5.3 캐시 문제

- CloudFront Invalidation 실행
- 브라우저 캐시 삭제
- HTML 파일은 no-cache 설정 확인

## 접속 URL

### S3 웹사이트 엔드포인트
```
http://your-bucket-name.s3-website-ap-northeast-2.amazonaws.com
```

### CloudFront 배포 URL
```
https://d1234567890.cloudfront.net
```

### 커스텀 도메인 (Route 53)
```
https://your-domain.com
```

## 비용 최적화 팁

1. **S3 스토리지 클래스**: 자주 액세스하지 않는 파일은 S3 IA로 이동
2. **CloudFront 가격 클래스**: 필요한 지역만 선택
3. **로그 비활성화**: 필요없다면 S3/CloudFront 로그 비활성화
4. **Lifecycle Policy**: 오래된 빌드 파일 자동 삭제

## 보안 권장사항

1. **S3 버킷**:
   - 버전 관리 활성화
   - MFA Delete 설정
   - 서버 측 암호화 활성화

2. **CloudFront**:
   - HTTPS만 허용
   - Security Headers 추가 (HSTS, CSP 등)
   - WAF 연동 고려

3. **IAM**:
   - 배포용 IAM 사용자는 최소 권한 원칙 적용
   - MFA 활성화