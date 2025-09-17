# 결론부터 말씀드리면, Nginx를 사용하는 경우 JSP 페이지와 React 정적 빌드 페이지가 동일한 도메인과 포트를 공유한다면, localStorage에 동시에 접근할 수 있습니다.

Nginx는 웹 서버 또는 리버스 프록시의 역할을 수행하며, 클라이언트(브라우저)와 서버(애플리케이션) 사이에서 요청을 처리하는 역할을 합니다. localStorage는 서버가 아닌 클라이언트(브라우저)의 저장소입니다.

이것을 이해하는 데 중요한 원칙은 바로 **동일 출처 정책(Same-Origin Policy)**입니다.

## 동일 출처 정책 (Same-Origin Policy)과 localStorage

- **출처(Origin)**는 다음 세 가지 요소로 정의됩니다:

  1. 프로토콜 (Protocol): http 또는 https
  2. 호스트 (Host): example.com
  3. 포트 (Port): 80, 443 등

- localStorage는 브라우저의 보안 정책인 동일 출처 정책에 따라 관리됩니다. 즉, 브라우저는 이 세 가지 요소가 모두 일치하는 경우에만 동일한 localStorage 객체에 접근을 허용합니다.

## Nginx 설정과 localStorage 접근

Nginx는 이 출처를 변경하지 않습니다. Nginx는 단순히 요청을 프록시하거나 정적 파일을 제공할 뿐입니다.

예를 들어, 웹사이트의 URL이 https://www.example.com이고, Nginx가 다음과 같이 구성되었다고 가정해 보겠습니다.

- https://www.example.com/legacy 경로로 들어오는 요청은 JSP 서버로 proxy_pass 합니다.

- https://www.example.com/modern 경로로 들어오는 요청은 React 정적 빌드 파일이 있는 디렉토리로 root를 설정하여 제공합니다.

## Nginx 설정 예시:

Nginx

```
server {
    listen 80;
    server_name www.example.com;

    # React 앱
    location /modern {
        alias /var/www/react_app/build;
        try_files $uri $uri/ /modern/index.html;
    }

    # JSP 앱
    location /legacy {
        proxy_pass http://localhost:8080/legacy;
    }
}
```

이 설정에서 https://www.example.com/legacy로 접속하든, https://www.example.com/modern로 접속하든, 브라우저가 인식하는 **출처는 모두 https://www.example.com**으로 동일합니다.

따라서, localStorage에 접근할 때 브라우저는 두 페이지가 동일한 출처에서 왔다고 판단하고, 동일한 localStorage 객체를 공유하게 됩니다.

- JSP 페이지에서 localStorage.setItem('user_id', '12345');를 실행하면,
- React 페이지에서도 localStorage.getItem('user_id');를 통해 '12345' 값을 읽을 수 있습니다.

## 주의할 점
- 하위 도메인(Subdomain): 만약 Nginx 설정에서 jsp.example.com과 react.example.com처럼 하위 도메인을 다르게 사용한다면 localStorage는 공유되지 않습니다. 이는 동일 출처 정책의 "호스트" 부분이 다르기 때문입니다.

- 프로토콜/포트: http://example.com과 https://example.com은 다른 출처로 인식되며, example.com:80과 example.com:8080도 다른 출처로 인식됩니다. Nginx의 proxy_pass 설정 시 프로토콜과 포트가 동일한지 확인해야 합니다.

- 경로(Path)의 영향: 경로(e.g., /legacy, /modern)는 localStorage의 출처에 영향을 주지 않습니다. 이는 localStorage가 도메인-포트 레벨에서 관리되기 때문입니다.

## 결론

Nginx가 서로 다른 애플리케이션(JSP, React)을 동일한 도메인과 포트 아래에서 서빙하도록 설정되어 있다면, 두 페이지는 클라이언트 측에서 동일한 localStorage 객체를 공유하며 동시에 접근할 수 있습니다. Nginx는 이 과정에 직접적인 영향을 주지 않으며, 클라이언트의 출처(Origin)를 결정하는 역할을 합니다.


---


# JWT(JSON Web Token) 토큰도 localStorage나 Cookie를 통해 공유하여 사용할 수 있습니다.

JWT 자체는 상태가 없는(stateless) 토큰이므로, 중요한 것은 토큰을 저장하고 공유하는 방식입니다. 앞서 Nginx 답변에서 설명했듯이, JSP와 React 페이지가 **동일한 출처(origin)**를 공유한다면, 두 페이지는 클라이언트 측 저장소에 접근하여 JWT 토큰을 공유할 수 있습니다.

## JWT 토큰을 공유하는 방법

JWT 토큰은 주로 클라이언트 측의 두 가지 저장소 중 한 곳에 저장됩니다.

### 1. localStorage:

  - 장점: JavaScript를 통해 손쉽게 접근하고 관리할 수 있습니다.

  - 단점: XSS(Cross-Site Scripting) 공격에 취약할 수 있습니다. 악의적인 스크립트가 localStorage에 저장된 토큰을 탈취할 수 있습니다.

  - 공유 방식:
    - JSP 페이지: localStorage.setItem('jwt', token_value);
    - React 페이지: localStorage.getItem('jwt');

  - 동일 출처(Same-Origin)인 경우: 두 페이지가 동일한 localStorage에 접근하므로 자연스럽게 토큰을 공유합니다.

### 2. Cookie:

  - 장점: HttpOnly 속성을 설정하면 JavaScript 접근을 막아 XSS 공격에 대한 보안을 강화할 수 있습니다. Secure 속성을 사용하면 HTTPS를 통해서만 전송되도록 할 수 있습니다.

  - 단점: CSRF(Cross-Site Request Forgery) 공격에 취약할 수 있습니다. 토큰이 모든 HTTP 요청 헤더에 자동으로 포함되어 전송되므로 서버에 대한 불필요한 요청이 발생할 수 있습니다.

  - 공유 방식:

    - 서버(JSP 또는 다른 백엔드): 인증 성공 후 HTTP 응답 헤더에 Set-Cookie: jwt=token_value; Path=/; HttpOnly;를 포함하여 클라이언트에 보냅니다.

    - 클라이언트(JSP/React): 브라우저가 해당 도메인에 대한 모든 후속 요청에 이 쿠키를 자동으로 포함시킵니다.

  - 동일 출처(Same-Origin)인 경우: 브라우저는 Path 설정에 따라 동일 도메인의 모든 경로(/로 설정하면 모든 경로)에서 쿠키를 자동으로 관리하므로, JSP 페이지에서 설정한 쿠키를 React 페이지의 요청에도 자동으로 포함하여 보낼 수 있습니다.

## Nginx를 사용한 공유 시나리오

Nginx가 프록시 역할을 하면서 JSP와 React 앱을 동일한 도메인 아래에 서빙하는 상황을 가정해 봅시다.

### 1. 사용자 인증 (JSP 페이지):

  - 사용자가 JSP 페이지(https://www.example.com/legacy/login)에서 로그인합니다.
  - JSP 백엔드 서버가 인증에 성공하면 JWT 토큰을 발급하고, 이 토큰을 localStorage 또는 Cookie에 저장하도록 응답을 보냅니다.
  - localStorage에 저장하는 경우: <script>localStorage.setItem('jwt', '${token}');</script>
  - Cookie에 저장하는 경우: Set-Cookie 헤더에 토큰을 포함시킵니다.

### 2. 토큰 공유 및 사용 (React 페이지):

  - 사용자가 React 페이지(https://www.example.com/modern)로 이동합니다.

  - localStorage 사용 시: React 컴포넌트가 마운트될 때 localStorage.getItem('jwt')를 호출하여 토큰을 가져옵니다.

  - Cookie 사용 시: React 컴포넌트가 API 요청을 보낼 때, 브라우저는 해당 도메인에 저장된 쿠키(JWT 토큰)를 요청 헤더에 자동으로 포함시킵니다.

### 3. 서버 측 검증:

  - JSP 또는 React에서 보낸 API 요청이 서버에 도달하면, 서버는 요청 헤더의 Authorization 필드(JWT의 일반적인 위치)나 쿠키에서 JWT 토큰을 추출합니다.

  - 서버는 토큰의 서명(Signature)을 검증하고, 토큰의 내용을 디코딩하여 사용자의 인증 상태를 확인합니다.

## 핵심 요약

- Nginx는 단지 웹 요청을 라우팅할 뿐이며, localStorage나 Cookie 같은 클라이언트 측 저장소의 동일 출처 정책에 직접적인 영향을 주지 않습니다.

- 따라서, Nginx를 통해 동일한 도메인과 포트 아래에서 JSP와 React 페이지를 제공한다면, 두 페이지는 localStorage 또는 Cookie를 통해 JWT 토큰을 매우 효과적으로 공유할 수 있습니다.

- 보안 측면에서 HttpOnly 속성을 가진 Cookie가 XSS 공격에 더 안전하므로, 가능하면 Cookie를 사용하는 것이 더 권장됩니다.

- CSRF 방어를 위해서는 SameSite=Strict 또는 Lax 속성을 사용하거나, X-CSRF-TOKEN 같은 추가적인 보안 조치를 고려해야 합니다.


