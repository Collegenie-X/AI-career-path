# Career Path Frontend-Backend Integration Guide

> **작성일**: 2026-03-27  
> **프론트엔드**: `/frontend/app/career`  
> **백엔드**: `/backend/apps/career_path`

---

## 개요

이 문서는 커리어 패스 프론트엔드(`/career`)와 백엔드 API(`/api/v1/career-path/`)의 통합 방식을 설명합니다.

### 통합 전략

프론트엔드는 **JWT 토큰 유무**에 따라 백엔드 API와 `localStorage`를 자동으로 전환합니다:

- **JWT 토큰 있음** → 백엔드 API 사용 (React Query)
- **JWT 토큰 없음** → `localStorage` 사용 (로컬 개발/테스트)

이를 통해 로그인 없이도 프론트엔드 개발/테스트가 가능하며, 로그인 후 자동으로 백엔드 연동됩니다.

---

## 1. 인증 (Authentication)

### JWT 토큰 저장

```typescript
// frontend/lib/auth/jwtStorage.ts
import { getAccessToken, setAccessToken } from '@/lib/auth/jwtStorage';

// 소셜 로그인 성공 시
setAccessToken(response.access_token);

// API 요청 시
const token = getAccessToken();
```

**토큰 키**: `dreampath_access_token` (localStorage)

### 백엔드 인증 확인

```typescript
import { hasCareerPathBackendAuth } from '@/lib/career-path/careerPathApi';

if (hasCareerPathBackendAuth()) {
  // 백엔드 API 사용
} else {
  // localStorage 사용
}
```

---

## 2. 커리어 패스 CRUD

### 2.1. 데이터 흐름

```
Frontend UI (camelCase)
  ↕ mapCareerPlanApi.ts (mapper)
Backend API (snake_case)
```

### 2.2. 주요 파일

| 파일 | 역할 |
|------|------|
| `frontend/lib/career-path/careerPathApi.ts` | API 클라이언트 (fetch 래퍼) |
| `frontend/lib/career-path/mapCareerPlanApi.ts` | API ↔ UI 타입 변환 |
| `frontend/app/career/hooks/useCareerPlansController.ts` | React Query + localStorage 통합 |
| `frontend/app/career/page.tsx` | 메인 페이지 (hook 사용) |

### 2.3. API 엔드포인트

#### 목록 조회
```
GET /api/v1/career-path/career-plans/
Authorization: Bearer {access_token}

Response: {
  count: 10,
  results: [
    {
      id: "uuid",
      title: "서울대 컴공 합격 패스",
      job_name: "소프트웨어 개발자",
      star_name: "기술",
      ...
    }
  ]
}
```

#### 상세 조회
```
GET /api/v1/career-path/career-plans/{id}/
Authorization: Bearer {access_token}

Response: {
  id: "uuid",
  title: "...",
  years: [
    {
      id: "uuid",
      grade_id: "high1",
      grade_label: "고1",
      semester: "both",
      goal_groups: [
        {
          id: "uuid",
          goal: "수학 올림피아드 입상",
          semester_id: "first",
          items: [
            {
              id: "uuid",
              type: "award",
              title: "KMO 1차 도전",
              months: [3, 4],
              difficulty: 3,
              cost: "무료",
              organizer: "한국수학올림피아드위원회",
              sub_items: [
                {
                  id: "uuid",
                  title: "기출문제 풀이",
                  done: false
                }
              ],
              links: [
                {
                  id: "uuid",
                  title: "KMO 공식 사이트",
                  url: "https://kmo.or.kr",
                  kind: "official"
                }
              ]
            }
          ]
        }
      ],
      items: []
    }
  ]
}
```

#### 생성
```
POST /api/v1/career-path/career-plans/
Authorization: Bearer {access_token}
Content-Type: application/json

Body: {
  "title": "나의 커리어 패스",
  "description": "설명",
  "job_id": "software-developer",
  "job_name": "소프트웨어 개발자",
  "job_emoji": "💻",
  "star_id": "tech",
  "star_name": "기술",
  "star_emoji": "💻",
  "star_color": "#3B82F6",
  "years": [
    {
      "grade_id": "high1",
      "grade_label": "고1",
      "semester": "both",
      "sort_order": 0,
      "goal_groups": [
        {
          "goal": "목표 1",
          "semester_id": "",
          "sort_order": 0,
          "items": [
            {
              "type": "activity",
              "title": "활동 1",
              "months": [3, 4],
              "difficulty": 2,
              "cost": "무료",
              "organizer": "주최기관",
              "description": "설명",
              "category_tags": ["학교"],
              "activity_subtype": "club",
              "sub_items": [
                {
                  "title": "세부 실행 1",
                  "done": false
                }
              ],
              "links": [
                {
                  "title": "링크 제목",
                  "url": "https://example.com",
                  "kind": "official"
                }
              ]
            }
          ]
        }
      ],
      "items": []
    }
  ]
}

Response: { id: "uuid", ... }
```

#### 수정 (전체 중첩 구조 교체)
```
PATCH /api/v1/career-path/career-plans/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

Body: {
  "title": "수정된 제목",
  "years": [
    // 전체 years 배열 (기존 데이터는 삭제되고 새로 생성됨)
  ]
}

Response: { id: "uuid", ... }
```

#### 삭제
```
DELETE /api/v1/career-path/career-plans/{id}/
Authorization: Bearer {access_token}

Response: 204 No Content
```

#### 템플릿 복사
```
POST /api/v1/career-path/career-plans/{template_id}/use_template/
Authorization: Bearer {access_token}
Content-Type: application/json

Body: {
  "title": "나만의 커리어 패스"
}

Response: {
  id: "new-uuid",
  title: "나만의 커리어 패스",
  years: [ /* 템플릿의 전체 구조 복사 */ ]
}
```

---

## 3. 공유 패스 (Shared Plans)

### 3.1. 데이터 흐름

```
CareerPlan (개인 패스)
  → SharedPlan (공유 인스턴스)
    → SharedPlanGroup (M:N 그룹 연결)
```

### 3.2. API 엔드포인트

#### 공유 패스 생성
```
POST /api/v1/career-path/shared-plans/
Authorization: Bearer {access_token}
Content-Type: application/json

Body: {
  "career_plan": "uuid",
  "share_type": "public",  // public, school, group, private
  "description": "공유 설명",
  "tags": [],
  "group_ids": ["group-uuid-1", "group-uuid-2"]  // 그룹 공유 시
}

Response: {
  id: "shared-plan-uuid",
  career_plan: { /* 전체 CareerPlan 구조 */ },
  user: { id, name, emoji, ... },
  share_type: "public",
  like_count: 0,
  bookmark_count: 0,
  view_count: 0,
  ...
}
```

#### 공유 패스 수정
```
PATCH /api/v1/career-path/shared-plans/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

Body: {
  "share_type": "group",
  "description": "업데이트된 설명",
  "group_ids": ["new-group-uuid"]
}

Response: { id: "uuid", ... }
```

#### 공유 패스 삭제 (공유 취소)
```
DELETE /api/v1/career-path/shared-plans/{id}/
Authorization: Bearer {access_token}

Response: 204 No Content
```

#### 커리어 패스 ID로 공유 패스 조회
```
GET /api/v1/career-path/shared-plans/by-career-plan/{career_plan_id}/
Authorization: Bearer {access_token}

Response: {
  id: "shared-plan-uuid",
  career_plan: { /* 전체 구조 */ },
  ...
}

404: 공유 패스가 없음
```

#### 좋아요
```
POST /api/v1/career-path/shared-plans/{id}/like/
Authorization: Bearer {access_token}

Response: {
  "like_count": 15
}
```

#### 북마크
```
POST /api/v1/career-path/shared-plans/{id}/bookmark/
Authorization: Bearer {access_token}

Response: {
  "bookmark_count": 8
}
```

---

## 4. 프론트엔드 통합

### 4.1. useCareerPlansController Hook

```typescript
import { useCareerPlansController } from '@/app/career/hooks/useCareerPlansController';

function MyComponent() {
  const {
    plans,              // CareerPlan[]
    source,             // 'api' | 'local'
    isLoading,          // boolean
    savePlan,           // (plan: CareerPlan) => Promise<CareerPlan>
    deletePlan,         // (id: string) => Promise<void>
    updatePlanInline,   // (plan: CareerPlan) => Promise<CareerPlan>
    useTemplate,        // (templateId: string, title: string) => Promise<CareerPlan>
  } = useCareerPlansController();

  // 새 패스 저장
  const handleSave = async (plan: CareerPlan) => {
    const saved = await savePlan(plan);
    console.log('Saved:', saved.id);
  };

  // 템플릿 사용
  const handleUseTemplate = async () => {
    const newPlan = await useTemplate('template-uuid', '나만의 패스');
    console.log('Created from template:', newPlan.id);
  };
}
```

### 4.2. 공유 기능

```typescript
import { createSharedPlanApi, fetchSharedPlanByCareerPlanId, deleteSharedPlanApi } from '@/lib/career-path/sharedPlanApi';

// 공유 생성
const handleShare = async (careerPlanId: string) => {
  const sharedPlan = await createSharedPlanApi({
    career_plan: careerPlanId,
    share_type: 'public',
    description: '공유 설명',
    tags: [],
    group_ids: [],
  });
  console.log('Shared:', sharedPlan.id);
};

// 공유 취소
const handleUnshare = async (careerPlanId: string) => {
  const existing = await fetchSharedPlanByCareerPlanId(careerPlanId);
  if (existing) {
    await deleteSharedPlanApi(existing.id);
    console.log('Unshared');
  }
};
```

### 4.3. 공유 패스 목록 조회

```typescript
import { useSharedPlansQuery } from '@/app/career/hooks/useSharedPlansQuery';

function CommunityFeed() {
  const { data: sharedPlans, isLoading } = useSharedPlansQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {sharedPlans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.title}</h3>
          <p>좋아요: {plan.likes}</p>
        </div>
      ))}
    </div>
  );
}
```

### 4.4. 좋아요/북마크

```typescript
import { useSharedPlanReactions } from '@/app/career/hooks/useSharedPlanReactions';

function SharedPlanCard({ planId }: { planId: string }) {
  const { reactions, toggleLike, toggleBookmark } = useSharedPlanReactions();

  const isLiked = reactions.likedPlanIds.includes(planId);
  const isBookmarked = reactions.bookmarkedPlanIds.includes(planId);

  return (
    <div>
      <button onClick={() => toggleLike(planId)}>
        {isLiked ? '❤️' : '🤍'} 좋아요
      </button>
      <button onClick={() => toggleBookmark(planId)}>
        {isBookmarked ? '⭐' : '☆'} 북마크
      </button>
    </div>
  );
}
```

---

## 5. 데이터 매핑

### 5.1. API → UI 변환

```typescript
import { mapCareerPlanDetailApiToUi } from '@/lib/career-path/mapCareerPlanApi';

const apiResponse = await fetch('/api/v1/career-path/career-plans/uuid/');
const apiData = await apiResponse.json();
const uiPlan = mapCareerPlanDetailApiToUi(apiData);
```

**주요 변환:**
- `snake_case` → `camelCase`
- `goal_groups` → `goalGroups`
- `sub_items` → `subItems`
- `semester_id` → `semesterId`
- `null` → `undefined` (optional fields)

### 5.2. UI → API 변환

```typescript
import { mapCareerPlanUiToWritePayload } from '@/lib/career-path/mapCareerPlanApi';

const uiPlan: CareerPlan = { /* ... */ };
const apiPayload = mapCareerPlanUiToWritePayload(uiPlan);

await fetch('/api/v1/career-path/career-plans/', {
  method: 'POST',
  body: JSON.stringify(apiPayload),
});
```

**주요 변환:**
- `camelCase` → `snake_case`
- `semesterPlans` → `goal_groups` (with `semester_id`)
- 임시 ID 제거 (UUID가 아닌 ID는 생략)
- 빈 URL → `null`

---

## 6. 중첩 구조 처리

### 6.1. 백엔드 (Django)

**생성 시:**
```python
@transaction.atomic
def create(self, validated_data):
    years_data = validated_data.pop('years', [])
    career_plan = CareerPlan.objects.create(user=user, **validated_data)
    
    for year_data in years_data:
        goal_groups_data = year_data.pop('goal_groups', [])
        items_data = year_data.pop('items', [])
        plan_year = PlanYear.objects.create(career_plan=career_plan, **year_data)
        
        for group_data in goal_groups_data:
            items_data = group_data.pop('items', [])
            goal_group = GoalGroup.objects.create(plan_year=plan_year, **group_data)
            
            for item_data in items_data:
                sub_items_data = item_data.pop('sub_items', [])
                links_data = item_data.pop('links', [])
                plan_item = PlanItem.objects.create(goal_group=goal_group, **item_data)
                
                for sub_item_data in sub_items_data:
                    SubItem.objects.create(plan_item=plan_item, **sub_item_data)
                
                for link_data in links_data:
                    ItemLink.objects.create(plan_item=plan_item, **link_data)
    
    return career_plan
```

**수정 시 (전체 교체):**
```python
@transaction.atomic
def update(self, instance, validated_data):
    years_data = validated_data.pop('years', None)
    
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()
    
    if years_data is not None:
        # 기존 years 전체 삭제 (cascade로 하위도 삭제)
        instance.years.all().delete()
        
        # 새로 생성
        for year_data in years_data:
            # ... (create와 동일한 로직)
    
    return instance
```

### 6.2. 프론트엔드 (React)

**저장 시:**
```typescript
const savePlan = async (plan: CareerPlan) => {
  const payload = mapCareerPlanUiToWritePayload(plan);
  
  if (isUuidString(plan.id)) {
    // 수정
    const updated = await updateCareerPlanApi(plan.id, payload);
    return mapCareerPlanDetailApiToUi(updated);
  } else {
    // 생성
    const created = await createCareerPlanApi(payload);
    return mapCareerPlanDetailApiToUi(created);
  }
};
```

---

## 7. 공유 설정 다이얼로그

### 7.1. 공유 생성/수정

```typescript
// frontend/app/career/page.tsx

const handleShareConfirm = async (
  channels: ShareChannel[],
  description: string,
  groupIds: string[]
) => {
  const isPublic = channels.length > 0;
  const useBackend = hasCareerPathBackendAuth() && isUuidString(plan.id);
  
  if (useBackend) {
    const existingShared = await fetchSharedPlanByCareerPlanId(plan.id);
    
    if (isPublic) {
      let shareType: 'public' | 'school' | 'group' | 'private' = 'private';
      if (channels.includes('public')) shareType = 'public';
      else if (channels.includes('school')) shareType = 'school';
      else if (channels.includes('group')) shareType = 'group';
      
      if (existingShared) {
        // 수정
        await updateSharedPlanApi(existingShared.id, {
          share_type: shareType,
          description,
          group_ids: groupIds,
        });
      } else {
        // 생성
        await createSharedPlanApi({
          career_plan: plan.id,
          share_type: shareType,
          description,
          group_ids: groupIds,
        });
      }
    } else if (existingShared) {
      // 공유 취소
      await deleteSharedPlanApi(existingShared.id);
    }
  }
  
  // 로컬 상태 업데이트
  await persistPlanInline(updatedPlan);
};
```

---

## 8. 템플릿 시스템

### 8.1. 템플릿 조회

프론트엔드는 JSON 파일(`/data/career-path-templates-*.json`)을 사용하지만, 백엔드에서도 템플릿 조회가 가능합니다:

```
GET /api/v1/career-path/career-plans/?is_template=true
Authorization: Bearer {access_token}

Response: {
  results: [
    {
      id: "template-uuid",
      title: "서울대 컴공 합격 패스",
      is_template: true,
      ...
    }
  ]
}
```

### 8.2. 템플릿 사용

```typescript
import { useTemplateApi } from '@/lib/career-path/templateApi';

const newPlan = await useTemplateApi('template-uuid', '나만의 패스');
```

백엔드는 템플릿의 전체 중첩 구조를 복사하여 새 `CareerPlan`을 생성합니다.

---

## 9. 에러 처리

### 9.1. API 에러

```typescript
try {
  await createCareerPlanApi(payload);
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes('401')) {
      // 인증 만료 → 로그인 페이지로
      setAccessToken(null);
      router.push('/login');
    } else if (err.message.includes('400')) {
      // 유효성 검증 실패 → 사용자에게 알림
      alert('입력 데이터를 확인해주세요.');
    } else {
      // 기타 에러
      console.error('API Error:', err);
    }
  }
}
```

### 9.2. Fallback to localStorage

```typescript
const { plans, source } = useCareerPlansController();

if (source === 'local') {
  // localStorage 사용 중 → 로그인 권장 메시지 표시
  console.log('로컬 모드: 로그인 후 클라우드 동기화 가능');
}
```

---

## 10. 테스트 시나리오

### 10.1. 로컬 개발 (JWT 없음)

1. 프론트엔드 실행: `npm run dev`
2. `/career` 접속
3. 새 패스 만들기 → `localStorage`에 저장
4. 공유 설정 → `localStorage`에만 반영 (백엔드 호출 없음)

### 10.2. 백엔드 연동 (JWT 있음)

1. 백엔드 실행: `python3 manage.py runserver`
2. 프론트엔드 실행: `npm run dev`
3. 소셜 로그인 → `setAccessToken(token)`
4. `/career` 접속
5. 새 패스 만들기 → 백엔드 API 호출 (`POST /api/v1/career-path/career-plans/`)
6. 공유 설정 → 백엔드 API 호출 (`POST /api/v1/career-path/shared-plans/`)
7. 커뮤니티 탭에서 공유 패스 조회 → 백엔드 API 호출 (`GET /api/v1/career-path/shared-plans/`)

### 10.3. Postman 테스트

1. `Local.postman_environment.json` 임포트
2. `AI-Career-Path.postman_collection.json` 임포트
3. 소셜 로그인 요청 실행 → `access_token` 환경 변수에 저장
4. Career Path 폴더의 요청들 실행

---

## 11. 주요 타입

### 11.1. CareerPlan (Frontend)

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

### 11.2. ApiCareerPlanDetail (Backend)

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
  template_category?: string | null;
  created_at: string;
  updated_at: string;
  years: ApiPlanYear[];
};
```

---

## 12. 성능 최적화

### 12.1. React Query 캐싱

```typescript
const listQuery = useQuery({
  queryKey: ['careerPlans'],
  queryFn: fetchMyCareerPlanDetails,
  staleTime: 30_000,  // 30초 동안 캐시 유지
});
```

### 12.2. Prefetch (백엔드)

```python
queryset = CareerPlan.objects.select_related('user').prefetch_related(
    Prefetch('years', queryset=PlanYear.objects.prefetch_related(
        Prefetch('goal_groups', queryset=GoalGroup.objects.prefetch_related(
            Prefetch('items', queryset=PlanItem.objects.prefetch_related(
                'sub_items', 'links'
            ))
        )),
        'items'
    ))
)
```

### 12.3. 낙관적 업데이트

```typescript
const updateMutation = useMutation({
  mutationFn: updateCareerPlanApi,
  onMutate: async (newPlan) => {
    // 낙관적 업데이트
    queryClient.setQueryData(['careerPlans'], (old) => {
      return old.map(p => p.id === newPlan.id ? newPlan : p);
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['careerPlans'] });
  },
});
```

---

## 13. 마이그레이션

### 13.1. 초기 설정

```bash
cd backend
python3 manage.py makemigrations career_path
python3 manage.py migrate career_path
```

### 13.2. 테스트 데이터 생성

Django Admin에서:
1. 템플릿 생성 (`is_template=True`)
2. 학교 생성 (선생님 계정 필요)
3. 그룹 생성 (학생 계정)

---

## 14. 문제 해결

### 14.1. CORS 에러

프론트엔드 `next.config.js`에서 rewrite 설정:

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

### 14.2. JWT 만료

```typescript
if (error.message.includes('401')) {
  setAccessToken(null);
  router.push('/login');
}
```

### 14.3. 중첩 구조 불일치

프론트엔드와 백엔드의 중첩 구조가 다를 경우, `mapCareerPlanApi.ts`의 매퍼 함수를 수정합니다.

---

## 15. 다음 단계

1. **Comment 모델 추가** - 공유 패스에 댓글 기능
2. **Reaction 모델 추가** - 좋아요/북마크를 별도 모델로 관리 (중복 방지)
3. **Notification 모델 추가** - 댓글·좋아요 알림
4. **파일 업로드** - S3 연동 (활동 증빙 자료)
5. **검색 기능** - Elasticsearch 연동
6. **캐싱** - Redis 연동
7. **테스트 코드** - pytest, Jest 작성

---

## 16. 참고 문서

- [커리어패스_Career_Django_DB_설계서.md](/documents/backend/커리어패스_Career_Django_DB_설계서.md)
- [Postman README](/documents/backend/postman/README.md)
- [Career Path App README](/backend/apps/career_path/README.md)
