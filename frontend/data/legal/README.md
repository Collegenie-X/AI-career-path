# Legal Pages Data Structure

이 폴더는 AI CareerPath 서비스의 법적 문서 및 정책 페이지에 사용되는 JSON 데이터를 관리합니다.

## 파일 구조

```
frontend/data/legal/
├── terms-of-service.json      # 이용약관
├── privacy-policy.json         # 개인정보 처리방침
├── email-policy.json           # 이메일 무단수집 거부
├── legal-notice.json           # 법적 고지
├── legal-overview.json         # 법적 문서 목록 (legal 페이지용)
├── marketing-consent.json      # 마케팅 동의 설정
└── README.md                   # 이 파일
```

## 데이터 스키마

### 법적 문서 JSON 구조 (terms, privacy, email-policy, legal-notice)

```typescript
{
  "metadata": {
    "title": string,           // 문서 제목
    "lastUpdated": string,     // 최종 수정일
    "effectiveDate": string    // 시행일
  },
  "sections": [
    {
      "id": string,            // 섹션 고유 ID
      "title": string,         // 섹션 제목
      "content": string[]      // 내용 (각 문단)
    }
  ]
}
```

### 법적 문서 개요 (legal-overview.json)

```typescript
{
  "metadata": {
    "title": string,
    "description": string
  },
  "legalDocuments": [
    {
      "id": string,
      "title": string,
      "description": string,
      "path": string,          // 문서 페이지 경로
      "iconKey": string,       // Lucide 아이콘 키
      "required": boolean      // 필수 동의 여부
    }
  ]
}
```

### 마케팅 동의 (marketing-consent.json)

```typescript
{
  "metadata": {
    "title": string,
    "description": string
  },
  "consentItems": [
    {
      "id": string,
      "type": "essential" | "optional",
      "label": string,         // "필수" 또는 "선택"
      "title": string,
      "description": string | null,
      "detailPath": string | null,
      "detailLabel": string | null,
      "required": boolean
    }
  ],
  "allAgreementLabel": string,
  "allAgreementDescription": string,
  "marketingConsentDetails": {
    "title": string,
    "sections": [
      {
        "id": string,
        "title": string,
        "content": string[]
      }
    ]
  }
}
```

## 사용 방법

### 1. 법적 문서 페이지

각 법적 문서는 다음 경로에서 접근 가능합니다:
- `/terms` - 이용약관
- `/privacy` - 개인정보 처리방침
- `/email-policy` - 이메일 무단수집 거부
- `/legal` - 약관 및 정책 개요

### 2. 마케팅 동의 컴포넌트

`MarketingConsentSection` 컴포넌트를 사용하여 프로필, 회원가입, 설정 페이지에서 마케팅 동의를 받을 수 있습니다:

```tsx
import { MarketingConsentSection } from '@/components/legal/MarketingConsentSection';

function ProfilePage() {
  const handleConsentChange = (consents: Record<string, boolean>) => {
    console.log('Updated consents:', consents);
  };

  return (
    <MarketingConsentSection
      onConsentChange={handleConsentChange}
      initialConsents={{
        'essential-terms': true,
        'essential-privacy': true,
        'optional-marketing': false,
      }}
    />
  );
}
```

### 3. 독립 마케팅 동의 페이지

`/marketing-consent` 경로에서 전체 화면 마케팅 동의 페이지를 사용할 수 있습니다.

## 컴포넌트

### LegalPageLayout

법적 문서 페이지의 공통 레이아웃을 제공합니다.

```tsx
<LegalPageLayout
  title="이용약관"
  lastUpdated="2026년 3월 25일"
  effectiveDate="2026년 3월 25일"
>
  {children}
</LegalPageLayout>
```

### LegalSectionRenderer

JSON 섹션 데이터를 렌더링합니다.

```tsx
<LegalSectionRenderer sections={sections} />
```

### MarketingConsentSection

마케팅 동의 UI를 제공합니다.

```tsx
<MarketingConsentSection
  onConsentChange={handleConsentChange}
  initialConsents={initialConsents}
/>
```

## 콘텐츠 수정 가이드

### 법적 문서 내용 수정

1. 해당 JSON 파일을 엽니다 (예: `terms-of-service.json`)
2. `metadata.lastUpdated`를 현재 날짜로 업데이트합니다
3. `sections` 배열에서 수정할 섹션을 찾습니다
4. `content` 배열의 문단을 수정합니다
5. 저장하면 자동으로 페이지에 반영됩니다

### 새 섹션 추가

```json
{
  "id": "new-section",
  "title": "제13조 (새로운 조항)",
  "content": [
    "첫 번째 문단입니다.",
    "두 번째 문단입니다.",
    "",
    "빈 문자열은 줄바꿈으로 렌더링됩니다."
  ]
}
```

### 마케팅 동의 항목 추가

`marketing-consent.json`의 `consentItems` 배열에 새 항목을 추가합니다:

```json
{
  "id": "optional-sms",
  "type": "optional",
  "label": "선택",
  "title": "SMS 수신 동의",
  "description": "이벤트 및 혜택 정보를 SMS로 받아볼 수 있습니다.",
  "detailPath": null,
  "detailLabel": null,
  "required": false
}
```

## 주의사항

1. **JSON 유효성**: 모든 JSON 파일은 유효한 JSON 형식이어야 합니다.
2. **날짜 형식**: 날짜는 "YYYY년 MM월 DD일" 형식을 사용합니다.
3. **ID 고유성**: 각 섹션과 항목의 `id`는 고유해야 합니다.
4. **필수 동의**: `required: true` 항목은 사용자가 반드시 동의해야 합니다.
5. **경로 일관성**: `detailPath`는 실제 존재하는 페이지 경로여야 합니다.

## 법적 준수

- 모든 법적 문서는 관련 법령(개인정보보호법, 정보통신망법 등)을 준수해야 합니다.
- 중요한 변경사항은 시행일 최소 7일 전에 공지해야 합니다.
- 개인정보 처리방침의 중요 변경은 30일 전 공지가 필요합니다.
