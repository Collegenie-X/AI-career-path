# 인증 시스템 가이드

> **작성일**: 2026-03-27  
> **목적**: 이메일/패스워드 기반 로그인 및 회원가입 시스템 가이드

---

## 1. 개요

AI Career Path는 다음 인증 방식을 지원합니다:

1. **이메일/패스워드 로그인** (신규 추가)
2. **소셜 로그인** (Google, Kakao, Naver)
3. **JWT 기반 인증**

---

## 2. 백엔드 API

### 2.1. 회원가입

**Endpoint**: `POST /api/v1/auth/email-signup/`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "grade": "high1",
  "emoji": "😊"
}
```

**Response** (201 Created):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "grade": "high1",
    "emoji": "😊",
    "is_active": true,
    "created_at": "2026-03-27T12:00:00Z",
    "updated_at": "2026-03-27T12:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 이미 등록된 이메일
- `400 Bad Request`: 유효하지 않은 입력값

### 2.2. 로그인

**Endpoint**: `POST /api/v1/auth/email-login/`

**Request Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "테스트 유저",
    "grade": "high1",
    "emoji": "🧪",
    "is_active": true,
    "created_at": "2026-03-27T12:00:00Z",
    "updated_at": "2026-03-27T12:00:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: 이메일 또는 비밀번호 불일치
- `401 Unauthorized`: 비활성화된 계정

### 2.3. 토큰 갱신

**Endpoint**: `POST /api/v1/auth/token/refresh/`

**Request Body**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2.4. 현재 사용자 정보

**Endpoint**: `GET /api/v1/auth/me/`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "test@example.com",
  "name": "테스트 유저",
  "grade": "high1",
  "emoji": "🧪",
  "is_active": true,
  "created_at": "2026-03-27T12:00:00Z",
  "updated_at": "2026-03-27T12:00:00Z"
}
```

---

## 3. 프론트엔드 구현

### 3.1. 로그인 페이지

**경로**: `/auth/login`

**기능**:
- 이메일/패스워드 로그인
- 회원가입 (이메일, 패스워드, 이름, 학년, 이모지)
- 로그인 없이 둘러보기

**사용 방법**:
1. http://localhost:3000/auth/login 접속
2. 로그인 또는 회원가입 선택
3. 정보 입력 후 제출
4. 성공 시 자동으로 `/career` 페이지로 이동

### 3.2. JWT 토큰 저장

프론트엔드는 JWT 토큰을 `localStorage`에 저장합니다:

```typescript
// 저장
localStorage.setItem('dreampath_access_token', token);

// 조회
const token = localStorage.getItem('dreampath_access_token');

// 삭제
localStorage.removeItem('dreampath_access_token');
```

### 3.3. API 호출 시 인증

```typescript
import { getAccessToken } from '@/lib/auth/jwtStorage';

const token = getAccessToken();
const headers = {
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const response = await fetch(url, {
  method: 'GET',
  headers,
});
```

---

## 4. 테스트 계정

개발 및 테스트용 계정:

- **이메일**: `test@example.com`
- **비밀번호**: `password123`
- **이름**: 테스트 유저
- **학년**: 고등학교 1학년
- **이모지**: 🧪

---

## 5. 학년 옵션

회원가입 시 선택 가능한 학년:

| 값 | 표시 |
|----|------|
| `elementary_4` | 초등학교 4학년 |
| `elementary_5` | 초등학교 5학년 |
| `elementary_6` | 초등학교 6학년 |
| `mid1` | 중학교 1학년 |
| `mid2` | 중학교 2학년 |
| `mid3` | 중학교 3학년 |
| `high1` | 고등학교 1학년 |
| `high2` | 고등학교 2학년 |
| `high3` | 고등학교 3학년 |

---

## 6. 보안 고려사항

### 6.1. 비밀번호 요구사항

- 최소 8자 이상
- Django의 `set_password()` 메서드로 해시화 저장
- 평문 비밀번호는 저장하지 않음

### 6.2. JWT 토큰

- **Access Token**: 짧은 유효기간 (기본 5분)
- **Refresh Token**: 긴 유효기간 (기본 1일)
- 토큰 만료 시 Refresh Token으로 갱신

### 6.3. CORS 설정

백엔드 `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## 7. 개발 워크플로우

### 7.1. 새 계정 생성

```bash
cd backend
source venv/bin/activate
python3 manage.py shell
```

```python
from apps.accounts.models import User

user = User.objects.create_user(
    email='newuser@example.com',
    name='새 유저',
    password='password123',
    grade='high1',
    emoji='😊'
)
print(f"Created user: {user.email}")
```

### 7.2. 비밀번호 변경

```python
from apps.accounts.models import User

user = User.objects.get(email='test@example.com')
user.set_password('newpassword123')
user.save()
print("Password updated")
```

### 7.3. JWT 토큰 생성 (디버깅용)

```python
from rest_framework_simplejwt.tokens import AccessToken
from apps.accounts.models import User

user = User.objects.get(email='test@example.com')
token = AccessToken.for_user(user)
print(f"Access Token: {str(token)}")
```

---

## 8. 트러블슈팅

### 8.1. 로그인 실패

**증상**: `401 Unauthorized` 에러

**해결**:
1. 이메일과 비밀번호 확인
2. 계정이 활성화되어 있는지 확인 (`is_active=True`)
3. 백엔드 서버가 실행 중인지 확인

### 8.2. 토큰이 저장되지 않음

**증상**: 로그인 후에도 API 호출 시 인증 실패

**해결**:
1. 브라우저 개발자 도구 > Application > Local Storage 확인
2. `dreampath_access_token` 키가 있는지 확인
3. 없으면 로그인 페이지에서 다시 로그인

### 8.3. CORS 에러

**증상**: `Access-Control-Allow-Origin` 에러

**해결**:
1. 백엔드 `settings.py`의 `CORS_ALLOWED_ORIGINS` 확인
2. 프론트엔드 URL이 포함되어 있는지 확인
3. 백엔드 서버 재시작

---

## 9. 다음 단계

- [ ] 비밀번호 재설정 기능
- [ ] 이메일 인증
- [ ] 소셜 로그인 연동 (Google, Kakao, Naver)
- [ ] 프로필 이미지 업로드
- [ ] 2단계 인증 (2FA)

---

## 10. 참고 자료

- [Django REST Framework JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Django Authentication](https://docs.djangoproject.com/en/5.0/topics/auth/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
