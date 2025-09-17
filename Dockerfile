# 1단계: 빌드 단계
# node:22-alpine 이미지를 사용해 React 앱을 빌드합니다.
FROM node:22-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 파일을 복사하여 의존성 설치를 캐싱합니다.
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드를 복사하고 빌드합니다.
COPY . .
RUN npm run build

# 2단계: 배포 단계
# Nginx 컨테이너에 정적 빌드 파일을 담습니다.
FROM nginx:stable-alpine

# nginx.conf 파일을 컨테이너의 Nginx 설정 디렉토리에 복사합니다.
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 1단계에서 빌드된 React 정적 파일들을 Nginx의 기본 정적 파일 디렉토리로 복사합니다.
COPY --from=build /app/build /usr/share/nginx/html

# 컨테이너의 80번 포트를 외부에 노출합니다.
EXPOSE 80

# Nginx 서버를 시작합니다.
CMD ["nginx", "-g", "daemon off;"]