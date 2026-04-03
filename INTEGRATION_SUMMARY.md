# Frontend-Backend Integration Summary

> **작성일**: 2026-03-27  
> **통합 범위**: `/frontend/app/career` ↔ `/backend/apps/career_path`

---

## 완료된 작업

### 1. 커리어 패스 CRUD 백엔드 연동

#### 생성된 파일
- `frontend/lib/auth/jwtStorage.ts` - JWT 토큰 저장/조회
- `frontend/lib/career-path/isUuidString.ts` - UUID 검증 유틸
- `frontend/lib/career-path/mapCareerPlanApi.ts` - API ↔ UI 타입 변환
- `frontend/lib/career-path/careerPathApi.ts` - CareerPlan API 클라이언트
- `frontend/lib/career-path/sharedPlanApi.ts` - SharedPlan API 클라이언트
- `frontend/lib/career-path/templateApi.ts` - 템플릿 API 클라이언트
- `frontend/app/career/hooks/useCareerPlansController.ts` - React Query + localStorage 통합
- `frontend/app/career/hooks/useSharedPlansQuery.ts` - 공유 패스 목록 조회
- `frontend/app/career/hooks/useMySharedPlansQuery.ts` - 내 공유 패스 조회
- `frontend/app/career/hooks/useSharedPlanReactions.ts` - 좋아요/북마크 관리

#### 수정된 파일
- `frontend/app/career/page.tsx` - 백엔드 API 통합
- `frontend/app/career/components/CareerPathBuilder.tsx` - async 저장 지원
- `frontend/app/career/components/TimelineDetailPanel.tsx` - async 업데이트 지원
- `frontend/app/career/components/CareerPathList.tsx` - async 템플릿 사용 지원
- `frontend/app/career/components/community/CommunityTab.tsx` - 백엔드 공유 패스 조회
- `frontend/lib/config/api.ts` - API 경로 추가
- `backend/apps/career_path/serializers.py` - SharedPlan update 메서드 추가
- `backend/apps/career_path/views.py` - by-career-plan 액션 추가

---

## 2. 주요 기능

### 2.1. 자동 전환 (API ↔ localStorage)

```typescript
// JWT 토큰 있음 → 백엔드 API 사용
// JWT 토큰 없음 → localStorage 사용

const { plans, source } = useCareerPlansController();
console.log(source); // 'api' or 'local'
```

### 2.2. 커리어 패스 CRUD

| 작업 | 프론트엔드 | 백엔드 API |
|------|-----------|-----------|
| 목록 조회 | `useCareerPlansController()` | `GET /api/v1/career-path/career-plans/` |
| 상세 조회 | `plans.find(p => p.id === id)` | `GET /api/v1/career-path/career-plans/{id}/` |
| 생성 | `savePlan(newPlan)` | `POST /api/v1/career-path/career-plans/` |
| 수정 | `updatePlanInline(plan)` | `PATCH /api/v1/career-path/career-plans/{id}/` |
| 삭제 | `deletePlan(id)` | `DELETE /api/v1/career-path/career-plans/{id}/` |
| 템플릿 사용 | `useTemplate(templateId, title)` | `POST /api/v1/career-path/career-plans/{id}/use_template/` |

### 2.3. 공유 패스 CRUD

| 작업 | 프론트엔드 | 백엔드 API |
|------|-----------|-----------|
| 목록 조회 | `useSharedPlansQuery()` | `GET /api/v1/career-path/shared-plans/` |
| 생성 | `createSharedPlanApi(payload)` | `POST /api/v1/career-path/shared-plans/` |
| 수정 | `updateSharedPlanApi(id, payload)` | `PATCH /api/v1/career-path/shared-plans/{id}/` |
| 삭제 | `deleteSharedPlanApi(id)` | `DELETE /api/v1/career-path/shared-plans/{id}/` |
| 커리어 패스로 조회 | `fetchSharedPlanByCareerPlanId(id)` | `GET /api/v1/career-path/shared-plans/by-career-plan/{id}/` |
| 좋아요 | `likeSharedPlanApi(id)` | `POST /api/v1/career-path/shared-plans/{id}/like/` |
| 북마크 | `bookmarkSharedPlanApi(id)` | `POST /api/v1/career-path/shared-plans/{id}/bookmark/` |

### 2.4. 공유 설정 다이얼로그

```typescript
// 공유 생성/수정/취소 자동 처리
onConfirm={async (channels, description, groupIds) => {
  const useBackend = hasCareerPathBackendAuth() && isUuidString(plan.id);
  
  if (useBackend) {
    const existingShared = await fetchSharedPlanByCareerPlanId(plan.id);
    
    if (isPublic) {
      // 공유 생성 또는 수정
      if (existingShared) {
        await updateSharedPlanApi(existingShared.id, { ... });
      } else {
        await createSharedPlanApi({ ... });
      }
    } else if (existingShared) {
      // 공유 취소
      await deleteSharedPlanApi(existingShared.id);
    }
  }
  
  // 로컬 상태 업데이트
  await persistPlanInline(updatedPlan);
}}
```

---

## 3. 데이터 매핑

### 3.1. 필드 변환 규칙

| Frontend (camelCase) | Backend (snake_case) |
|---------------------|---------------------|
| `starId` | `star_id` |
| `jobName` | `job_name` |
| `createdAt` | `created_at` |
| `goalGroups` | `goal_groups` |
| `subItems` | `sub_items` |
| `semesterId` | `semester_id` |
| `activitySubtype` | `activity_subtype` |
| `categoryTags` | `category_tags` |

### 3.2. 학기 처리

프론트엔드는 `semesterPlans` 배열을 사용하지만, 백엔드는 `goal_groups.semester_id`로 학기를 구분합니다:

```typescript
// Frontend
years: [{
  semester: 'split',
  semesterPlans: [
    { semesterId: 'first', goalGroups: [...] },
    { semesterId: 'second', goalGroups: [...] }
  ]
}]

// Backend API
years: [{
  semester: 'split',
  goal_groups: [
    { semester_id: 'first', goal: '...', items: [...] },
    { semester_id: 'second', goal: '...', items: [...] }
  ]
}]
```

매퍼 함수(`mapCareerPlanApi.ts`)가 이 변환을 자동으로 처리합니다.

### 3.3. 임시 ID 처리

프론트엔드에서 새로 생성한 항목은 임시 ID(`temp-xxx`)를 가집니다. 백엔드로 전송 시 UUID가 아닌 ID는 생략됩니다:

```typescript
if (isUuidString(item.id)) {
  payload.id = item.id;  // 기존 항목
} else {
  // 새 항목 - id 생략
}
```

---

## 4. 테스트 방법

### 4.1. 로컬 개발 (JWT 없음)

```bash
# 프론트엔드만 실행
cd frontend
npm run dev
```

1. `http://localhost:3000/career` 접속
2. 새 패스 만들기 → `localStorage`에 저장됨
3. 브라우저 개발자 도구 → Application → Local Storage 확인
4. `career_plans_v2` 키에 데이터 저장됨

### 4.2. 백엔드 연동 (JWT 있음)

```bash
# 백엔드 실행
cd backend
source venv/bin/activate
python3 manage.py runserver

# 프론트엔드 실행 (다른 터미널)
cd frontend
npm run dev
```

1. `http://localhost:3000/login` 접속 (소셜 로그인)
2. 로그인 성공 → `setAccessToken(token)` 호출
3. `http://localhost:3000/career` 접속
4. 새 패스 만들기 → 백엔드 API 호출
5. 브라우저 개발자 도구 → Network 탭에서 API 요청 확인

### 4.3. Postman 테스트

```bash
# 1. 환경 변수 임포트
documents/backend/postman/Local.postman_environment.json

# 2. 컬렉션 임포트
documents/backend/postman/AI-Career-Path.postman_collection.json

# 3. 소셜 로그인 요청 실행
Auth > POST social-login
→ access_token 환경 변수에 저장

# 4. 커리어 패스 요청 실행
Career Path > GET career-plans
Career Path > POST shared-plan (create)
Career Path > POST like shared-plan
```

---

## 5. 주요 변경 사항

### 5.1. 백엔드

1. **SharedPlanCreateSerializer**에 `update` 메서드 추가
   - 공유 설정 변경 시 `group_ids` 재설정 가능

2. **SharedPlanViewSet**에 `by_career_plan` 액션 추가
   - `GET /api/v1/career-path/shared-plans/by-career-plan/{career_plan_id}/`
   - 커리어 패스 ID로 공유 패스 조회 (공유 취소 시 필요)

3. **CareerPlanViewSet**의 `use_template` 액션 활용
   - 템플릿 복사 시 전체 중첩 구조 복사

### 5.2. 프론트엔드

1. **useCareerPlansController** - 중앙 데이터 관리
   - React Query (API) + localStorage (fallback)
   - `savePlan`, `deletePlan`, `updatePlanInline`, `useTemplate` 제공

2. **공유 설정 다이얼로그** - 백엔드 연동
   - 공유 생성: `createSharedPlanApi`
   - 공유 수정: `updateSharedPlanApi`
   - 공유 취소: `deleteSharedPlanApi`
   - 기존 공유 확인: `fetchSharedPlanByCareerPlanId`

3. **커뮤니티 탭** - 백엔드 공유 패스 조회
   - `useSharedPlansQuery` - 공유 패스 목록
   - `useSharedPlanReactions` - 좋아요/북마크
   - `useMySharedPlansQuery` - 내 공유 패스

4. **템플릿 사용** - 백엔드 `use_template` 호출
   - JWT 있음 → `useTemplateApi` 호출
   - JWT 없음 → JSON 파일에서 복사

---

## 6. 데이터 흐름 예시

### 6.1. 새 커리어 패스 생성

```
1. 사용자가 CareerPathBuilder에서 패스 작성
2. "저장" 버튼 클릭
3. page.tsx의 savePlan 호출
4. useCareerPlansController.savePlan 실행
   - JWT 있음:
     4a. mapCareerPlanUiToWritePayload (UI → API)
     4b. createCareerPlanApi (POST)
     4c. mapCareerPlanDetailApiToUi (API → UI)
     4d. React Query 캐시 갱신
   - JWT 없음:
     4a. localStorage에 저장
5. 화면에 새 패스 표시
```

### 6.2. 공유 패스 생성

```
1. 사용자가 TimelineDetailPanel에서 "공유" 버튼 클릭
2. ShareSettingsDialog 열림
3. 공유 채널 선택 (전체/학교/그룹)
4. "공유하기" 버튼 클릭
5. page.tsx의 onConfirm 실행
   - JWT 있음:
     5a. fetchSharedPlanByCareerPlanId (기존 공유 확인)
     5b. createSharedPlanApi 또는 updateSharedPlanApi
     5c. React Query 캐시 갱신
   - JWT 없음:
     5a. localStorage에만 isPublic 플래그 저장
6. 커뮤니티 탭으로 이동
7. 공유 패스 목록에 표시
```

### 6.3. 템플릿 사용

```
1. 사용자가 CareerPathList에서 템플릿 선택
2. 커스텀 제목 입력
3. page.tsx의 handleUseTemplate 실행
   - JWT 있음:
     3a. useTemplateApi (POST /use_template/)
     3b. 백엔드가 전체 구조 복사
     3c. mapCareerPlanDetailApiToUi
     3d. React Query 캐시 갱신
   - JWT 없음:
     3a. buildPlanFromTemplate (JSON 복사)
     3b. localStorage에 저장
4. 타임라인 탭으로 이동
5. 새 패스 표시
```

---

## 7. 주요 타입

### 7.1. CareerPlan (Frontend)

```typescript
type CareerPlan = {
  id: string;
  starId: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  jobId: string;
  jobName: string;
  jobEmoji: string;
  title: string;
  description?: string;
  createdAt: string;
  isPublic?: boolean;
  shareChannels?: ShareChannel[];
  shareType?: ShareType;
  shareGroupIds?: string[];
  sharedAt?: string;
  years: YearPlan[];
};
```

### 7.2. ApiCareerPlanDetail (Backend)

```typescript
type ApiCareerPlanDetail = {
  id: string;
  user: { id: string; name: string; email: string; emoji: string };
  title: string;
  description?: string | null;
  job_id: string;
  job_name: string;
  job_emoji: string;
  star_id: string;
  star_name: string;
  star_emoji: string;
  star_color: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  years: ApiPlanYear[];
};
```

### 7.3. SharedPlanCreatePayload

```typescript
type SharedPlanCreatePayload = {
  career_plan: string;
  school?: string | null;
  share_type: 'public' | 'school' | 'group' | 'private';
  description?: string;
  tags?: string[];
  group_ids?: string[];
};
```

---

## 8. API 엔드포인트 요약

### 8.1. Career Plans

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/career-path/career-plans/` | 목록 (본인 + 템플릿) |
| POST | `/api/v1/career-path/career-plans/` | 생성 |
| GET | `/api/v1/career-path/career-plans/{id}/` | 상세 |
| PATCH | `/api/v1/career-path/career-plans/{id}/` | 수정 |
| DELETE | `/api/v1/career-path/career-plans/{id}/` | 삭제 |
| POST | `/api/v1/career-path/career-plans/{id}/use_template/` | 템플릿 복사 |

### 8.2. Shared Plans

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/career-path/shared-plans/` | 목록 |
| POST | `/api/v1/career-path/shared-plans/` | 생성 |
| GET | `/api/v1/career-path/shared-plans/{id}/` | 상세 (조회수 증가) |
| PATCH | `/api/v1/career-path/shared-plans/{id}/` | 수정 |
| DELETE | `/api/v1/career-path/shared-plans/{id}/` | 삭제 |
| GET | `/api/v1/career-path/shared-plans/by-career-plan/{career_plan_id}/` | 커리어 패스로 조회 |
| POST | `/api/v1/career-path/shared-plans/{id}/like/` | 좋아요 |
| POST | `/api/v1/career-path/shared-plans/{id}/bookmark/` | 북마크 |

---

## 9. 중첩 구조 처리

### 9.1. 백엔드 (Django)

**생성 시 (`@transaction.atomic`):**
```python
career_plan = CareerPlan.objects.create(...)
for year_data in years_data:
    plan_year = PlanYear.objects.create(career_plan=career_plan, ...)
    for group_data in goal_groups_data:
        goal_group = GoalGroup.objects.create(plan_year=plan_year, ...)
        for item_data in items_data:
            plan_item = PlanItem.objects.create(goal_group=goal_group, ...)
            for sub_item_data in sub_items_data:
                SubItem.objects.create(plan_item=plan_item, ...)
```

**수정 시 (전체 교체):**
```python
@transaction.atomic
def update(self, instance, validated_data):
    years_data = validated_data.pop('years', None)
    
    if years_data is not None:
        instance.years.all().delete()  # Cascade 삭제
        # 새로 생성 (create와 동일)
    
    return instance
```

### 9.2. 프론트엔드 (React)

**매핑 함수:**
```typescript
// API → UI
export function mapCareerPlanDetailApiToUi(api: ApiCareerPlanDetail): CareerPlan {
  return {
    id: api.id,
    title: api.title,
    years: api.years.map(mapYearFromApi),
    // ...
  };
}

// UI → API
export function mapCareerPlanUiToWritePayload(ui: CareerPlan): ApiCareerPlanWritePayload {
  return {
    title: ui.title,
    years: ui.years.map(mapYearToApi),
    // ...
  };
}
```

---

## 10. 에러 처리

### 10.1. API 에러

```typescript
try {
  await createCareerPlanApi(payload);
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes('401')) {
      // JWT 만료 → 로그인 페이지로
      setAccessToken(null);
      router.push('/login');
    } else if (err.message.includes('400')) {
      // 유효성 검증 실패
      alert('입력 데이터를 확인해주세요.');
    } else {
      // 기타 에러
      console.error('API Error:', err);
    }
  }
}
```

### 10.2. Fallback to localStorage

```typescript
const { plans, source } = useCareerPlansController();

if (source === 'local') {
  console.log('로컬 모드: 로그인 후 클라우드 동기화 가능');
}
```

---

## 11. 성능 최적화

### 11.1. React Query 캐싱

```typescript
const listQuery = useQuery({
  queryKey: ['careerPlans'],
  queryFn: fetchMyCareerPlanDetails,
  staleTime: 30_000,  // 30초 캐시
});
```

### 11.2. Prefetch (백엔드)

```python
queryset = CareerPlan.objects.select_related('user').prefetch_related(
    'years__goal_groups__items__sub_items',
    'years__goal_groups__items__links',
    'years__items__sub_items',
    'years__items__links',
)
```

### 11.3. 낙관적 업데이트

```typescript
const saveMutation = useMutation({
  mutationFn: createCareerPlanApi,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['careerPlans'] });
  },
});
```

---

## 12. 문제 해결

### 12.1. CORS 에러

`frontend/next.config.js`:
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

### 12.2. JWT 만료

```typescript
if (error.message.includes('401')) {
  setAccessToken(null);
  router.push('/login');
}
```

### 12.3. 중첩 구조 불일치

`mapCareerPlanApi.ts`의 매퍼 함수를 수정하여 필드 매핑 조정.

---

## 13. 다음 단계

1. **Comment 모델** - 공유 패스 댓글 기능
2. **Reaction 모델** - 좋아요/북마크를 별도 모델로 관리 (중복 방지)
3. **Notification 모델** - 댓글·좋아요 알림
4. **파일 업로드** - S3 연동 (활동 증빙 자료)
5. **검색 기능** - Elasticsearch 연동
6. **실시간 동기화** - WebSocket 연동
7. **오프라인 지원** - Service Worker + IndexedDB

---

## 14. 참고 문서

- [Career Path App README](/backend/apps/career_path/README.md)
- [Career Path Integration Guide](/backend/apps/career_path/INTEGRATION.md)
- [Postman README](/documents/backend/postman/README.md)
- [커리어패스 Django DB 설계서](/documents/backend/커리어패스_Career_Django_DB_설계서.md)
