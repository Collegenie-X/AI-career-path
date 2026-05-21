# Testing Guide - Career Path Backend Integration

> **작성일**: 2026-03-27  
> **목적**: 프론트엔드-백엔드 통합 테스트 가이드

---

## 1. 준비 사항

### 1.1. 백엔드 서버 실행

```bash
cd backend
source venv/bin/activate
python3 manage.py runserver
```

서버 확인: http://127.0.0.1:8000/api/schema/

### 1.2. 프론트엔드 서버 실행

```bash
cd frontend
npm run dev
```

서버 확인: http://localhost:3000

---

## 2. JWT 토큰 설정

### 2.1. 방법 1: 프론트엔드 로그인 페이지 사용 (권장)

1. http://localhost:3000/auth/login 접속
2. 테스트 계정으로 로그인:
   - 이메일: `test@example.com`
   - 비밀번호: `password123`
3. 로그인 성공 시 자동으로 `/career` 페이지로 이동
4. JWT 토큰이 자동으로 `localStorage`에 저장됨

또는 새 계정 생성:
1. "회원가입" 클릭
2. 이메일, 비밀번호, 이름, 학년, 이모지 입력
3. 회원가입 성공 시 자동으로 로그인되고 `/career` 페이지로 이동

### 2.2. 방법 2: Postman으로 토큰 발급

1. Postman 열기
2. `Local.postman_environment.json` 임포트
3. `AI-Career-Path.postman_collection.json` 임포트
4. **Auth (no Bearer) > POST email-login** 실행
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. 응답에서 `access_token` 복사

### 2.3. 방법 3: Django Shell에서 직접 생성

```bash
cd backend
source venv/bin/activate
python3 manage.py shell
```

```python
from rest_framework_simplejwt.tokens import AccessToken
from apps.accounts.models import User

# 테스트 유저 조회
user = User.objects.get(email='test@example.com')

# JWT 토큰 생성
token = AccessToken.for_user(user)
print(f"Access Token: {str(token)}")
```

토큰 복사 후 다음 단계로.

### 2.4. 브라우저에서 토큰 수동 설정 (방법 2, 3 사용 시)

1. http://localhost:3000/career 접속
2. 브라우저 개발자 도구 열기 (F12)
3. Console 탭에서 실행:

```javascript
localStorage.setItem('dreampath_access_token', 'YOUR_ACCESS_TOKEN_HERE');
location.reload();
```

4. 페이지 새로고침 후 Network 탭 확인
5. `/api/v1/career-path/career-plans/` 요청이 보이면 성공

---

## 3. 테스트 시나리오

### 3.1. 커리어 패스 생성 테스트

#### 로컬 모드 (JWT 없음)

1. http://localhost:3000/career 접속
2. "새 패스 만들기" 버튼 클릭
3. 직업/적성 선택
4. 학년별 활동 추가
5. "저장" 버튼 클릭
6. 브라우저 개발자 도구 → Application → Local Storage
7. `career_plans_v3` 키 확인 → 데이터 저장됨
8. Network 탭 → API 요청 없음 (로컬 저장)

#### 백엔드 모드 (JWT 있음)

1. 위 2.3 단계로 JWT 토큰 설정
2. http://localhost:3000/career 접속 (새로고침)
3. "새 패스 만들기" 버튼 클릭
4. 직업/적성 선택
5. 학년별 활동 추가
6. "저장" 버튼 클릭
7. Network 탭 확인:
   ```
   POST /api/v1/career-path/career-plans/
   Status: 201 Created
   Response: { id: "uuid", title: "...", years: [...] }
   ```
8. 타임라인 탭에서 새 패스 확인

### 3.2. 템플릿 사용 테스트

#### 로컬 모드 (JWT 없음)

1. http://localhost:3000/career?tab=explore 접속
2. 템플릿 카드에서 "이 패스 사용하기" 버튼 클릭
3. 커스텀 제목 입력 (예: "나의 서울대 합격 패스")
4. "사용하기" 버튼 클릭
5. Local Storage 확인 → `career_plans_v3`에 새 패스 추가됨
6. Network 탭 → API 요청 없음

#### 백엔드 모드 (JWT 있음)

1. JWT 토큰 설정 (위 2.3 단계)
2. http://localhost:3000/career?tab=explore 접속
3. 템플릿 카드에서 "이 패스 사용하기" 버튼 클릭
4. 커스텀 제목 입력
5. "사용하기" 버튼 클릭
6. Network 탭 확인:
   ```
   POST /api/v1/career-path/career-plans/
   Status: 201 Created
   Response: { id: "new-uuid", title: "나의 서울대 합격 패스", years: [...] }
   ```
7. 타임라인 탭에서 새 패스 확인
8. Django Admin 확인: http://127.0.0.1:8000/admin/career_path/careerplan/

### 3.3. 공유 패스 생성 테스트

#### 백엔드 모드 (JWT 필수)

1. JWT 토큰 설정
2. 타임라인 탭에서 패스 선택
3. "공유" 버튼 클릭
4. 공유 설정 다이얼로그:
   - 설명 입력: "서울대 합격 전략 공유합니다"
   - 공유 채널 선택: "전체 공유" 체크
5. "공유하기" 버튼 클릭
6. Network 탭 확인:
   ```
   POST /api/v1/career-path/shared-plans/
   Status: 201 Created
   Response: {
     id: "shared-plan-uuid",
     career_plan: { /* 전체 구조 */ },
     share_type: "public",
     like_count: 0,
     ...
   }
   ```
7. 커뮤니티 탭으로 자동 이동
8. 공유 패스 목록에 표시됨

### 3.4. 공유 패스 수정 테스트

1. 타임라인 탭에서 공유된 패스 선택
2. "공유" 버튼 클릭 (이미 공유됨)
3. 공유 설정 변경:
   - 공유 채널: "그룹 공유"로 변경
   - 그룹 선택
4. "공유하기" 버튼 클릭
5. Network 탭 확인:
   ```
   GET /api/v1/career-path/shared-plans/by-career-plan/{career_plan_id}/
   PATCH /api/v1/career-path/shared-plans/{shared_plan_id}/
   Status: 200 OK
   ```

### 3.5. 공유 취소 테스트

1. 타임라인 탭에서 공유된 패스 선택
2. "공유" 버튼 클릭
3. "비공개" 선택
4. "공유하기" 버튼 클릭
5. Network 탭 확인:
   ```
   GET /api/v1/career-path/shared-plans/by-career-plan/{career_plan_id}/
   DELETE /api/v1/career-path/shared-plans/{shared_plan_id}/
   Status: 204 No Content
   ```

### 3.6. 좋아요/북마크 테스트

1. JWT 토큰 설정
2. 커뮤니티 탭 접속
3. 공유 패스 카드에서 "❤️" 버튼 클릭
4. Network 탭 확인:
   ```
   POST /api/v1/career-path/shared-plans/{id}/like/
   Status: 200 OK
   Response: { like_count: 1 }
   ```
5. "⭐" 버튼 클릭
6. Network 탭 확인:
   ```
   POST /api/v1/career-path/shared-plans/{id}/bookmark/
   Status: 200 OK
   Response: { bookmark_count: 1 }
   ```

---

## 4. 디버깅

### 4.1. JWT 토큰 확인

브라우저 콘솔:
```javascript
console.log('Token:', localStorage.getItem('dreampath_access_token'));
```

### 4.2. 백엔드 연동 상태 확인

브라우저 콘솔:
```javascript
// 페이지 새로고침 후
console.log('Using backend:', Boolean(localStorage.getItem('dreampath_access_token')));
```

### 4.3. 저장된 데이터 확인

#### localStorage (로컬 모드)
```javascript
console.log('Local plans:', JSON.parse(localStorage.getItem('career_plans_v3') || '[]'));
```

#### Django Admin (백엔드 모드)
1. http://127.0.0.1:8000/admin/ 접속
2. Career path → Career plans 클릭
3. 저장된 패스 확인

### 4.4. API 요청 확인

브라우저 개발자 도구 → Network 탭:
- Filter: `career-path`
- 요청 URL, Method, Status 확인
- Request Headers → Authorization 확인
- Response 확인

---

## 5. 문제 해결

### 5.1. "템플릿 사용 시 DB에 저장 안 됨"

**원인**: JWT 토큰이 설정되지 않음

**해결**:
1. 브라우저 콘솔에서 토큰 확인:
   ```javascript
   localStorage.getItem('dreampath_access_token')
   ```
2. `null`이면 위 2.3 단계로 토큰 설정
3. 페이지 새로고침
4. 다시 템플릿 사용

### 5.2. "401 Unauthorized"

**원인**: JWT 토큰 만료 또는 유효하지 않음

**해결**:
1. 새 토큰 발급 (위 2.2 단계)
2. 브라우저 콘솔에서 재설정:
   ```javascript
   localStorage.setItem('dreampath_access_token', 'NEW_TOKEN');
   location.reload();
   ```

### 5.3. "Network 탭에 API 요청 없음"

**원인**: JWT 토큰이 없어서 로컬 모드로 작동 중

**해결**:
1. 토큰 설정 (위 2.3 단계)
2. 페이지 새로고침
3. 다시 시도

### 5.4. "CORS 에러"

**원인**: `next.config.js`의 rewrite 설정 누락

**해결**:
`frontend/next.config.js` 확인:
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://127.0.0.1:8000/api/:path*',
    },
  ];
}
```

---

## 6. 빠른 테스트 (개발용)

### 6.1. 테스트 토큰 생성 스크립트

`backend/generate_test_token.py` 생성:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework_simplejwt.tokens import AccessToken
from apps.accounts.models import User

user, created = User.objects.get_or_create(
    email='test@example.com',
    defaults={
        'name': '테스트 유저',
        'emoji': '🧪',
        'grade': 'high1',
    }
)

token = AccessToken.for_user(user)
print(f"\n{'='*60}")
print(f"User: {user.name} ({user.email})")
print(f"Token: {str(token)}")
print(f"{'='*60}\n")
print(f"브라우저 콘솔에서 실행:")
print(f"localStorage.setItem('dreampath_access_token', '{str(token)}');")
print(f"location.reload();")
print(f"{'='*60}\n")
```

실행:
```bash
cd backend
source venv/bin/activate
python3 generate_test_token.py
```

출력된 명령어를 브라우저 콘솔에 붙여넣기.

### 6.2. 원클릭 테스트 설정

브라우저 북마크 추가:

**이름**: "Set Test Token"

**URL**:
```javascript
javascript:(function(){const token=prompt('JWT Token:');if(token){localStorage.setItem('dreampath_access_token',token);alert('Token set! Reloading...');location.reload();}})();
```

사용법:
1. 북마크 클릭
2. 토큰 입력
3. 자동 새로고침

---

## 7. 데이터 확인

### 7.1. 프론트엔드 상태 확인

브라우저 콘솔:
```javascript
// 현재 모드 확인
console.log('Mode:', localStorage.getItem('dreampath_access_token') ? 'API' : 'Local');

// 저장된 플랜 확인 (로컬)
console.log('Local plans:', JSON.parse(localStorage.getItem('career_plans_v3') || '[]'));

// React Query 캐시 확인
// (React DevTools 필요)
```

### 7.2. 백엔드 데이터 확인

#### Django Admin
http://127.0.0.1:8000/admin/career_path/careerplan/

#### Django Shell
```bash
cd backend
source venv/bin/activate
python3 manage.py shell
```

```python
from apps.career_path.models import CareerPlan, SharedPlan

# 커리어 패스 목록
plans = CareerPlan.objects.all()
for plan in plans:
    print(f"{plan.id} - {plan.title} (user: {plan.user.name})")

# 공유 패스 목록
shared = SharedPlan.objects.all()
for sp in shared:
    print(f"{sp.id} - {sp.career_plan.title} ({sp.share_type})")
```

---

## 8. 예상 동작

### 8.1. JWT 없음 (로컬 모드)

| 작업 | 동작 | 저장 위치 |
|------|------|----------|
| 새 패스 만들기 | localStorage에 저장 | `career_plans_v3` |
| 템플릿 사용 | JSON 복사 → localStorage | `career_plans_v3` |
| 공유 설정 | `isPublic` 플래그만 저장 | `career_plans_v3` |
| 좋아요/북마크 | localStorage에만 저장 | `community_reactions_v1` |

### 8.2. JWT 있음 (백엔드 모드)

| 작업 | 동작 | 저장 위치 |
|------|------|----------|
| 새 패스 만들기 | API 호출 → DB 저장 | PostgreSQL/SQLite |
| 템플릿 사용 | JSON 복사 → API 호출 → DB 저장 | PostgreSQL/SQLite |
| 공유 설정 | API 호출 → SharedPlan 생성 | PostgreSQL/SQLite |
| 좋아요/북마크 | API 호출 → like_count 증가 | PostgreSQL/SQLite |

---

## 9. 트러블슈팅

### 9.1. "템플릿 사용했는데 DB에 없음"

**체크리스트**:
1. JWT 토큰 설정 확인
   ```javascript
   console.log(localStorage.getItem('dreampath_access_token'));
   ```
2. 페이지 새로고침 후 재시도
3. Network 탭에서 `POST /api/v1/career-path/career-plans/` 요청 확인
4. 요청이 없으면 → JWT 토큰 재설정
5. 요청이 있는데 실패하면 → Response 에러 메시지 확인

### 9.2. "공유 설정했는데 커뮤니티 탭에 안 보임"

**체크리스트**:
1. Network 탭에서 `POST /api/v1/career-path/shared-plans/` 요청 확인
2. 요청 성공 (201) 확인
3. 커뮤니티 탭 새로고침
4. Django Admin에서 SharedPlan 확인

### 9.3. "좋아요 눌렀는데 안 늘어남"

**체크리스트**:
1. JWT 토큰 확인
2. Network 탭에서 `POST /api/v1/career-path/shared-plans/{id}/like/` 요청 확인
3. Response에서 `like_count` 확인
4. 페이지 새로고침 후 확인

---

## 10. Postman 테스트

### 10.1. 환경 설정

1. Postman 열기
2. Environments → Import → `Local.postman_environment.json`
3. Collections → Import → `AI-Career-Path.postman_collection.json`
4. 환경 선택: "Local"

### 10.2. 인증

1. **Auth > POST social-login** 실행
2. 응답에서 `access_token` 복사
3. Environment 변수 `access_token`에 붙여넣기
4. 저장

### 10.3. 커리어 패스 테스트

1. **Career Path > GET career-plans** 실행
   - 빈 배열 또는 기존 패스 목록 확인
2. **Career Path > POST career-plan** 실행 (Body 수정 필요)
3. **Career Path > GET career-plans** 재실행
   - 새 패스 확인

### 10.4. 공유 패스 테스트

1. 위에서 생성한 `career_plan` ID 복사
2. **Career Path > POST shared-plan (create)** 실행
   - Body에서 `career_plan` 값을 복사한 UUID로 변경
3. **Career Path > GET shared-plans** 실행
   - 새 공유 패스 확인
4. 공유 패스 ID 복사
5. **Career Path > POST like shared-plan** 실행
   - URL의 `<shared-plan-id>`를 복사한 ID로 변경
6. **Career Path > GET shared-plans** 재실행
   - `like_count` 증가 확인

---

## 11. 자동화 테스트 (향후)

### 11.1. Frontend (Jest + React Testing Library)

```typescript
// frontend/app/career/__tests__/useCareerPlansController.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useCareerPlansController } from '../hooks/useCareerPlansController';

test('should save plan to backend when JWT exists', async () => {
  localStorage.setItem('dreampath_access_token', 'test-token');
  
  const { result } = renderHook(() => useCareerPlansController());
  
  const newPlan = { /* ... */ };
  await act(async () => {
    await result.current.savePlan(newPlan);
  });
  
  expect(result.current.source).toBe('api');
  expect(result.current.plans).toHaveLength(1);
});
```

### 11.2. Backend (pytest + Django)

```python
# backend/apps/career_path/tests/test_views.py
import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.career_path.models import CareerPlan

@pytest.mark.django_db
def test_create_career_plan():
    client = APIClient()
    user = User.objects.create(email='test@example.com', name='Test')
    client.force_authenticate(user=user)
    
    response = client.post('/api/v1/career-path/career-plans/', {
        'title': '테스트 패스',
        'job_id': 'test',
        'job_name': '테스트',
        'job_emoji': '🧪',
        'star_id': 'tech',
        'star_name': '기술',
        'star_emoji': '💻',
        'star_color': '#3B82F6',
        'years': []
    }, format='json')
    
    assert response.status_code == 201
    assert CareerPlan.objects.filter(user=user).count() == 1
```

---

## 12. 성능 모니터링

### 12.1. 프론트엔드 (React DevTools)

1. React DevTools 설치
2. Profiler 탭 열기
3. "Record" 버튼 클릭
4. 템플릿 사용 또는 패스 저장
5. "Stop" 버튼 클릭
6. 렌더링 시간 확인

### 12.2. 백엔드 (Django Debug Toolbar)

```bash
pip install django-debug-toolbar
```

`config/settings.py`:
```python
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
INTERNAL_IPS = ['127.0.0.1']
```

http://127.0.0.1:8000/api/v1/career-path/career-plans/ 접속 시 SQL 쿼리 확인.

---

## 13. 체크리스트

### 템플릿 사용 시 DB 저장 확인

- [ ] 백엔드 서버 실행 중 (`python3 manage.py runserver`)
- [ ] 프론트엔드 서버 실행 중 (`npm run dev`)
- [ ] JWT 토큰 설정 완료 (`localStorage.getItem('dreampath_access_token')` 확인)
- [ ] 페이지 새로고침 완료
- [ ] 템플릿 "이 패스 사용하기" 클릭
- [ ] Network 탭에서 `POST /api/v1/career-path/career-plans/` 요청 확인
- [ ] Response Status 201 확인
- [ ] Django Admin에서 CareerPlan 생성 확인

---

## 14. 참고

- [Integration Summary](/INTEGRATION_SUMMARY.md)
- [Changelog 2026-03-27](/CHANGELOG_2026-03-27.md)
- [Career Path Integration Guide](/backend/apps/career_path/INTEGRATION.md)
