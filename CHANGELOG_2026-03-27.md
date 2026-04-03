# Changelog - 2026-03-27

## Frontend-Backend Integration for Career Path

### 개요

프론트엔드 `/career` 앱을 백엔드 `career_path` API와 완전히 통합했습니다. JWT 토큰 유무에 따라 백엔드 API와 `localStorage`를 자동으로 전환하여, 로그인 없이도 로컬 개발이 가능하며 로그인 후 자동으로 클라우드 동기화됩니다.

---

## 주요 변경 사항

### 1. 백엔드 (Django)

#### 1.1. SharedPlan 업데이트 지원

**파일**: `backend/apps/career_path/serializers.py`

```python
class SharedPlanCreateSerializer(serializers.ModelSerializer):
    @transaction.atomic
    def update(self, instance, validated_data):
        group_ids = validated_data.pop('group_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if group_ids is not None:
            instance.group_links.all().delete()
            for group_id in group_ids:
                try:
                    group = Group.objects.get(id=group_id)
                    SharedPlanGroup.objects.create(shared_plan=instance, group=group)
                except Group.DoesNotExist:
                    pass
        
        return instance
```

**변경 이유**: 공유 설정 변경 시 `share_type`, `description`, `group_ids`를 업데이트할 수 있도록 `update` 메서드 추가.

#### 1.2. 커리어 패스 ID로 공유 패스 조회

**파일**: `backend/apps/career_path/views.py`

```python
class SharedPlanViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'], url_path='by-career-plan/(?P<career_plan_id>[^/.]+)')
    def by_career_plan(self, request, career_plan_id=None):
        """커리어 패스 ID로 공유 패스 조회"""
        try:
            shared_plan = SharedPlan.objects.select_related('user', 'career_plan', 'school').get(
                career_plan_id=career_plan_id,
                user=request.user
            )
            serializer = SharedPlanDetailSerializer(shared_plan)
            return Response(serializer.data)
        except SharedPlan.DoesNotExist:
            return Response(
                {'error': '공유 패스를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
```

**변경 이유**: 공유 취소 시 기존 `SharedPlan`을 조회하여 삭제하기 위해 필요.

---

### 2. 프론트엔드 (React + Next.js)

#### 2.1. 새로 생성된 파일

| 파일 | 역할 |
|------|------|
| `frontend/lib/auth/jwtStorage.ts` | JWT 토큰 저장/조회 (`dreampath_access_token`) |
| `frontend/lib/career-path/isUuidString.ts` | UUID 검증 유틸 |
| `frontend/lib/career-path/mapCareerPlanApi.ts` | API ↔ UI 타입 변환 (snake_case ↔ camelCase) |
| `frontend/lib/career-path/careerPathApi.ts` | CareerPlan API 클라이언트 (fetch 래퍼) |
| `frontend/lib/career-path/sharedPlanApi.ts` | SharedPlan API 클라이언트 |
| `frontend/lib/career-path/templateApi.ts` | 템플릿 API 클라이언트 |
| `frontend/app/career/hooks/useCareerPlansController.ts` | React Query + localStorage 통합 |
| `frontend/app/career/hooks/useSharedPlansQuery.ts` | 공유 패스 목록 조회 |
| `frontend/app/career/hooks/useMySharedPlansQuery.ts` | 내 공유 패스 조회 |
| `frontend/app/career/hooks/useSharedPlanReactions.ts` | 좋아요/북마크 관리 |

#### 2.2. 수정된 파일

| 파일 | 주요 변경 사항 |
|------|---------------|
| `frontend/app/career/page.tsx` | - `useCareerPlansController` 사용<br>- `handleSharePlan` 백엔드 연동<br>- `ShareSettingsDialog.onConfirm` 백엔드 연동<br>- `handleUseTemplate` 백엔드 연동 |
| `frontend/app/career/components/CareerPathBuilder.tsx` | - `onSave` 타입을 `Promise<void>` 지원<br>- `handleSave`를 `async` 함수로 변경 |
| `frontend/app/career/components/TimelineDetailPanel.tsx` | - `onUpdatePlan`, `onDeletePlan` 타입을 `Promise<void>` 지원 |
| `frontend/app/career/components/CareerPathList.tsx` | - `onUseTemplate` 타입을 `Promise<void>` 지원 |
| `frontend/app/career/components/community/CommunityTab.tsx` | - `useSharedPlansQuery` 사용<br>- `useSharedPlanReactions` 사용 |
| `frontend/lib/config/api.ts` | - `careerPlans` 경로 추가 |

---

### 3. 주요 기능

#### 3.1. 자동 전환 (API ↔ localStorage)

```typescript
const { plans, source } = useCareerPlansController();

// source === 'api' → 백엔드 API 사용 (JWT 있음)
// source === 'local' → localStorage 사용 (JWT 없음)
```

#### 3.2. 커리어 패스 CRUD

```typescript
const {
  plans,              // CareerPlan[]
  savePlan,           // (plan) => Promise<CareerPlan>
  deletePlan,         // (id) => Promise<void>
  updatePlanInline,   // (plan) => Promise<CareerPlan>
  useTemplate,        // (templateId, title) => Promise<CareerPlan>
} = useCareerPlansController();

// 새 패스 저장
const saved = await savePlan(newPlan);

// 패스 수정
await updatePlanInline(updatedPlan);

// 패스 삭제
await deletePlan(planId);

// 템플릿 사용
const newPlan = await useTemplate('template-uuid', '나만의 패스');
```

#### 3.3. 공유 패스 관리

```typescript
// 공유 생성
await createSharedPlanApi({
  career_plan: 'plan-uuid',
  share_type: 'public',
  description: '공유 설명',
  group_ids: [],
});

// 공유 수정
await updateSharedPlanApi('shared-plan-uuid', {
  share_type: 'group',
  group_ids: ['group-uuid'],
});

// 공유 취소
const existing = await fetchSharedPlanByCareerPlanId('plan-uuid');
if (existing) {
  await deleteSharedPlanApi(existing.id);
}

// 좋아요
await likeSharedPlanApi('shared-plan-uuid');

// 북마크
await bookmarkSharedPlanApi('shared-plan-uuid');
```

#### 3.4. 공유 설정 다이얼로그

```typescript
<ShareSettingsDialog
  onConfirm={async (channels, description, groupIds) => {
    // 자동으로 공유 생성/수정/취소 처리
    // - JWT 있음: 백엔드 API 호출
    // - JWT 없음: localStorage만 업데이트
  }}
/>
```

---

### 4. 데이터 매핑

#### 4.1. API → UI 변환

```typescript
import { mapCareerPlanDetailApiToUi } from '@/lib/career-path/mapCareerPlanApi';

const apiData = await fetchCareerPlanDetailById('uuid');
const uiPlan = mapCareerPlanDetailApiToUi(apiData);
```

**주요 변환:**
- `snake_case` → `camelCase`
- `goal_groups` → `goalGroups`
- `sub_items` → `subItems`
- `semester_id` → `semesterId`
- `null` → `undefined` (optional)

#### 4.2. UI → API 변환

```typescript
import { mapCareerPlanUiToWritePayload } from '@/lib/career-path/mapCareerPlanApi';

const apiPayload = mapCareerPlanUiToWritePayload(uiPlan);
await createCareerPlanApi(apiPayload);
```

**주요 변환:**
- `camelCase` → `snake_case`
- `semesterPlans` → `goal_groups` (with `semester_id`)
- 임시 ID 제거 (UUID가 아닌 ID는 생략)
- 빈 URL → `null`

#### 4.3. 학기 처리

프론트엔드 `semesterPlans` 배열을 백엔드 `goal_groups.semester_id`로 변환:

```typescript
// Frontend
years: [{
  semester: 'split',
  semesterPlans: [
    { semesterId: 'first', goalGroups: [...] },
    { semesterId: 'second', goalGroups: [...] }
  ]
}]

// Backend
years: [{
  semester: 'split',
  goal_groups: [
    { semester_id: 'first', goal: '...', items: [...] },
    { semester_id: 'second', goal: '...', items: [...] }
  ]
}]
```

---

### 5. API 엔드포인트

#### 5.1. Career Plans

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/career-path/career-plans/` | 목록 (본인 + 템플릿) |
| POST | `/api/v1/career-path/career-plans/` | 생성 |
| GET | `/api/v1/career-path/career-plans/{id}/` | 상세 |
| PATCH | `/api/v1/career-path/career-plans/{id}/` | 수정 |
| DELETE | `/api/v1/career-path/career-plans/{id}/` | 삭제 |
| POST | `/api/v1/career-path/career-plans/{id}/use_template/` | 템플릿 복사 |

#### 5.2. Shared Plans

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

### 6. 테스트 시나리오

#### 6.1. 로컬 개발 (JWT 없음)

1. 프론트엔드 실행: `npm run dev`
2. `/career` 접속
3. 새 패스 만들기 → `localStorage`에 저장
4. 공유 설정 → `localStorage`에만 반영

#### 6.2. 백엔드 연동 (JWT 있음)

1. 백엔드 실행: `python3 manage.py runserver`
2. 프론트엔드 실행: `npm run dev`
3. 소셜 로그인 → `setAccessToken(token)`
4. `/career` 접속
5. 새 패스 만들기 → 백엔드 API 호출
6. 공유 설정 → 백엔드 API 호출
7. 커뮤니티 탭에서 공유 패스 조회

#### 6.3. Postman 테스트

1. `Local.postman_environment.json` 임포트
2. `AI-Career-Path.postman_collection.json` 임포트
3. Auth > POST social-login → `access_token` 저장
4. Career Path > GET career-plans
5. Career Path > POST shared-plan (create)
6. Career Path > POST like shared-plan

---

### 7. 파일 변경 요약

#### 7.1. 새로 생성된 파일 (10개)

1. `frontend/lib/auth/jwtStorage.ts`
2. `frontend/lib/career-path/isUuidString.ts`
3. `frontend/lib/career-path/mapCareerPlanApi.ts`
4. `frontend/lib/career-path/careerPathApi.ts`
5. `frontend/lib/career-path/sharedPlanApi.ts`
6. `frontend/lib/career-path/templateApi.ts`
7. `frontend/app/career/hooks/useCareerPlansController.ts`
8. `frontend/app/career/hooks/useSharedPlansQuery.ts`
9. `frontend/app/career/hooks/useMySharedPlansQuery.ts`
10. `frontend/app/career/hooks/useSharedPlanReactions.ts`

#### 7.2. 수정된 파일 (10개)

1. `backend/apps/career_path/serializers.py` - SharedPlan update 메서드
2. `backend/apps/career_path/views.py` - by-career-plan 액션
3. `frontend/app/career/page.tsx` - 백엔드 API 통합
4. `frontend/app/career/components/CareerPathBuilder.tsx` - async 지원
5. `frontend/app/career/components/TimelineDetailPanel.tsx` - async 지원
6. `frontend/app/career/components/CareerPathList.tsx` - async 지원
7. `frontend/app/career/components/community/CommunityTab.tsx` - 백엔드 조회
8. `frontend/lib/config/api.ts` - API 경로 추가
9. `backend/apps/career_path/README.md` - API 문서 업데이트
10. `documents/backend/postman/README.md` - Postman 문서 업데이트

#### 7.3. 새로 생성된 문서 (3개)

1. `backend/apps/career_path/INTEGRATION.md` - 통합 가이드
2. `INTEGRATION_SUMMARY.md` - 통합 요약
3. `documents/backend/postman/AI-Career-Path.postman_collection.json` - Postman 컬렉션 업데이트 (새 엔드포인트 추가)

---

### 8. 주요 기술 결정

#### 8.1. React Query + localStorage 하이브리드

**이유**: 로그인 없이도 프론트엔드 개발/테스트가 가능하도록 하면서, 로그인 후 자동으로 백엔드 동기화.

**구현**:
```typescript
const useBackend = Boolean(getAccessToken());

if (useBackend) {
  // React Query로 API 호출
  const query = useQuery({ queryKey: ['careerPlans'], queryFn: fetchMyCareerPlanDetails });
} else {
  // localStorage 사용
  const [plans, setPlans] = useState(() => loadFromLocalStorage());
}
```

#### 8.2. 중첩 구조 전체 교체

**이유**: 부분 업데이트는 복잡도가 높고 버그 가능성이 큼. 전체 교체가 더 안전.

**구현**:
```python
@transaction.atomic
def update(self, instance, validated_data):
    if years_data is not None:
        instance.years.all().delete()  # Cascade 삭제
        # 새로 생성
```

#### 8.3. 공유 패스 별도 모델

**이유**: `CareerPlan`과 `SharedPlan`을 분리하여 공유 관련 메타데이터(좋아요, 북마크, 조회수)를 독립적으로 관리.

**구현**:
```python
class SharedPlan(UUIDPrimaryKeyModel, TimeStampedModel):
    career_plan = models.ForeignKey(CareerPlan, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    share_type = models.CharField(max_length=20, choices=SHARE_TYPE_CHOICES)
    like_count = models.IntegerField(default=0)
    bookmark_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
```

---

### 9. 성능 최적화

#### 9.1. React Query 캐싱

```typescript
const listQuery = useQuery({
  queryKey: ['careerPlans'],
  queryFn: fetchMyCareerPlanDetails,
  staleTime: 30_000,  // 30초 캐시
});
```

#### 9.2. Prefetch (백엔드)

```python
queryset = CareerPlan.objects.select_related('user').prefetch_related(
    'years__goal_groups__items__sub_items',
    'years__goal_groups__items__links',
)
```

#### 9.3. 병렬 조회

```typescript
// 목록 조회 후 병렬로 상세 조회
const list = await fetchMyCareerPlanList();
const details = await Promise.all(
  list.results.map(item => fetchCareerPlanDetailById(item.id))
);
```

---

### 10. 문제 해결

#### 10.1. CORS 에러

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

#### 10.2. JWT 만료

```typescript
if (error.message.includes('401')) {
  setAccessToken(null);
  router.push('/login');
}
```

#### 10.3. 중첩 구조 불일치

`mapCareerPlanApi.ts`의 매퍼 함수를 수정하여 필드 매핑 조정.

---

### 11. 다음 단계

1. **Comment 모델 추가** - 공유 패스 댓글 기능
2. **Reaction 모델 추가** - 좋아요/북마크를 별도 모델로 관리 (중복 방지)
3. **Notification 모델 추가** - 댓글·좋아요 알림
4. **파일 업로드** - S3 연동 (활동 증빙 자료)
5. **검색 기능** - Elasticsearch 연동
6. **실시간 동기화** - WebSocket 연동
7. **오프라인 지원** - Service Worker + IndexedDB
8. **테스트 코드** - pytest, Jest 작성

---

### 12. 검증 완료

- ✅ Django system check 통과
- ✅ OpenAPI schema validation 통과
- ✅ Next.js build 성공
- ✅ TypeScript 타입 체크 통과 (빌드 시 자동 검증)
- ✅ 프론트엔드 개발 서버 정상 작동
- ✅ 백엔드 개발 서버 정상 작동

---

### 13. 참고 문서

- [Career Path App README](/backend/apps/career_path/README.md)
- [Career Path Integration Guide](/backend/apps/career_path/INTEGRATION.md)
- [Integration Summary](/INTEGRATION_SUMMARY.md)
- [Postman README](/documents/backend/postman/README.md)
- [커리어패스 Django DB 설계서](/documents/backend/커리어패스_Career_Django_DB_설계서.md)
