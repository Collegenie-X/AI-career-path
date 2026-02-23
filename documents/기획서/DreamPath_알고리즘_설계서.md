# DreamPath 알고리즘 설계서
# — 2단계·3단계 동작 원리 · 관계도 · 순서도 · UI 스타일 가이드

> **V0 구현 기준 문서** — 소스 코드 없음. 알고리즘·순서도·상태 머신·관계도 위주.

---

## 0. 앱 전체 데이터 흐름 관계도

### 0.1 핵심 엔티티 관계도

```mermaid
erDiagram
    USER ||--o{ RIASEC_RESULT : "검사"
    USER ||--o{ SWIPE_LOG : "스와이프"
    USER ||--o{ SIMULATION_LOG : "시뮬레이션"
    USER ||--o{ CAREER_PATH : "생성"
    USER ||--o{ CLUE_MEMBER : "가입"

    RIASEC_RESULT ||--o{ JOB_RECOMMEND : "생성"
    JOB_RECOMMEND }o--|| JOB : "매핑"

    JOB ||--o{ SIMULATION : "포함"
    JOB ||--o{ BASIC_CAREER_PATH : "포함"
    JOB ||--o{ VIRTUAL_PASS : "포함"

    SWIPE_LOG }o--|| JOB : "대상"
    SWIPE_LOG ||--o{ RECOMMEND_WEIGHT : "갱신"

    SIMULATION_LOG }o--|| SIMULATION : "대상"
    SIMULATION_LOG ||--o{ XP_LOG : "생성"

    CAREER_PATH }o--|| JOB : "목표직업"
    CAREER_PATH ||--o{ MILESTONE : "포함"

    VIRTUAL_PASS ||--o{ GAP_ANALYSIS : "생성"
    GAP_ANALYSIS }o--|| USER : "대상"

    CLUE_MEMBER }o--|| CLUE : "소속"
    CLUE ||--o{ PROJECT : "진행"
    PROJECT ||--o{ KANBAN_CARD : "포함"
    PROJECT ||--o{ QA_POST : "연결"
    PROJECT ||--o{ DEPLOY_CERT : "인증"

    DEPLOY_CERT ||--o{ PORTFOLIO_ITEM : "자동생성"
    XP_LOG ||--o{ USER_LEVEL : "업데이트"
```

### 0.2 단계별 데이터 흐름

```mermaid
flowchart TD
    subgraph Stage1["1단계: 적성 검사"]
        Q20["20문항 퀴즈<br/>상황 선택형"]
        RIASEC["RIASEC 점수<br/>R·I·A·S·E·C 각 100점"]
        TYPE["유형 카드<br/>상위 2개 유형 확정"]
    end

    subgraph Stage2["2단계: 직업 살아보기"]
        direction TB
        REC["직업 추천 엔진<br/>매칭도 % 계산"]
        SWIPE["스와이프 행동<br/>관심/패스/슈퍼관심"]
        WEIGHT["추천 가중치<br/>행동 기반 실시간 갱신"]
        SIM["하루 시뮬레이션<br/>분기 스토리"]
        CAREER["기본 커리어 패스<br/>학년별 체크리스트"]
        VPASS["가상 합격자 패스<br/>갭 분석"]
        MYPATH["나의 커리어 패스<br/>자동 생성 결과물"]
    end

    subgraph Stage3["3단계: 전우 시스템"]
        MATCH["클루 매칭 엔진<br/>가중치 점수 계산"]
        CLUE["클루 보드<br/>공동 목표 게이지"]
        PROJECT["프로젝트 상태 머신<br/>기획→설계→제작→배포"]
        KANBAN["칸반 보드<br/>카드 상태 관리"]
        QA["문의 라우팅<br/>클루→전체→AI→전문가"]
        DEPLOY["배포 인증<br/>URL 제출 + 검증"]
        PORT["포트폴리오<br/>자동 생성"]
    end

    Stage1 --> REC
    RIASEC --> REC
    SWIPE --> WEIGHT
    WEIGHT --> REC
    SIM --> CAREER
    CAREER & VPASS --> MYPATH
    MYPATH --> MATCH
    CLUE --> PROJECT
    PROJECT --> KANBAN & QA
    DEPLOY --> PORT

    style Stage1 fill:#4A90D9,color:#fff
    style Stage2 fill:#F5A623,color:#fff
    style Stage3 fill:#1ABC9C,color:#fff
```

---

## 1. UI 스타일 가이드 (V0 구현 기준)

### 1.1 디자인 시스템

```mermaid
flowchart LR
    subgraph Color["컬러 시스템"]
        C1["Primary<br/>#6C5CE7<br/>보라 (메인)"]
        C2["Stage1<br/>#4A90D9<br/>파랑 (검사)"]
        C3["Stage2<br/>#F5A623<br/>주황 (탐험)"]
        C4["Stage3<br/>#1ABC9C<br/>초록 (전우)"]
        C5["Danger<br/>#E74C3C<br/>빨강 (알림)"]
        C6["Dark BG<br/>#1A1A2E<br/>다크모드"]
    end

    subgraph Type["타이포그래피"]
        T1["제목: Pretendard Bold 20px"]
        T2["본문: Pretendard Regular 14px"]
        T3["캡션: Pretendard Light 12px"]
        T4["XP/숫자: Montserrat Bold"]
    end

    subgraph Component["핵심 컴포넌트"]
        K1["직업 카드 (틴더형)<br/>240×340px, 둥근 모서리 24px"]
        K2["XP 바 (게임형)<br/>그라데이션 + 애니메이션"]
        K3["뱃지 (수집형)<br/>원형 아이콘 + 희귀도 테두리"]
        K4["공동 게이지 (클루)<br/>멀티 컬러 프로그레스"]
        K5["칸반 카드<br/>드래그 앤 드롭"]
    end
```

### 1.2 화면 레이아웃 패턴

```mermaid
flowchart TD
    subgraph Pattern["레이아웃 패턴 (모바일 퍼스트 375px 기준)"]
        P1["Safe Area Top<br/>노치/다이나믹아일랜드 대응"]
        P2["헤더 (56px)<br/>뒤로가기 · 제목 · 액션버튼"]
        P3["메인 콘텐츠 영역<br/>스크롤 또는 고정"]
        P4["플로팅 액션 버튼<br/>우하단 고정 (60px)"]
        P5["탭바 (80px)<br/>5탭: 홈·탐험·패스·클루·포폴"]
    end

    subgraph Modal["모달 패턴"]
        M1["바텀시트 (반모달)<br/>하단 60% 영역 점유"]
        M2["풀스크린 모달<br/>시뮬레이션·기획서"]
        M3["토스트 메시지<br/>XP 획득·뱃지 알림 (3초)"]
    end

    subgraph Transition["전환 애니메이션"]
        TR1["카드 스와이프: 물리 기반 드래그"]
        TR2["레벨업: 파티클 + 팡파레"]
        TR3["뱃지 획득: 팝업 + 진동"]
        TR4["단계 전환: 슬라이드 + 컬러 변화"]
    end
```

### 1.3 게이미피케이션 UI 요소

| UI 요소 | 위치 | 동작 | 시각 효과 |
|---------|------|------|---------|
| **XP 바** | 홈 상단 | 행동마다 채워짐 | 주황→노랑 그라데이션, 흔들림 애니메이션 |
| **레벨 배지** | 프로필 옆 | 레벨업 시 변경 | 반짝임 + 팡파레 팝업 |
| **직업 카드 희귀도** | 카드 테두리 | 스와이프 등장 시 | 일반: 회색 / 희귀: 파랑 빛남 / 에픽: 주황 빛남 / 전설: 빨강 빛남 |
| **클루 게이지** | 클루 보드 상단 | 전우 활동마다 채워짐 | 멀티컬러, 물결 애니메이션 |
| **배포 인증 효과** | 배포 완료 시 | 즉시 트리거 | 화면 전체 파티클 + 전설 뱃지 팝업 |
| **연속 출석 불꽃** | 홈 화면 | 매일 접속 시 | 불꽃 이모지 + 카운터 |

---

## 2. 2단계 알고리즘 상세 설계

### 2.1 직업 추천 알고리즘

#### 입력 → 처리 → 출력

```mermaid
flowchart TD
    subgraph Input["입력 데이터"]
        I1["RIASEC 점수<br/>R:40 I:20 A:80 S:75 E:30 C:15"]
        I2["스와이프 행동 로그<br/>관심:12개 / 패스:8개 / 슈퍼관심:3개"]
        I3["학년 정보<br/>중2"]
        I4["이전 시뮬 완료 직업<br/>UX디자이너, 공간디자이너"]
    end

    subgraph Process["추천 처리 엔진"]
        P1["① RIASEC 유사도 계산<br/>각 직업의 RIASEC 프로필 vs 사용자 점수<br/>코사인 유사도 → 매칭도 %"]
        P2["② 행동 가중치 보정<br/>관심 저장 직업군 +20%<br/>패스 직업군 -10%<br/>슈퍼관심 직업군 +35%"]
        P3["③ 중복 제거<br/>이미 시뮬 완료한 직업 제외<br/>(재탐색 옵션 ON 시 포함)"]
        P4["④ 다양성 주입<br/>추천 20장 중 15장 = 매칭 상위<br/>5장 = 새로운 분야 (탐험 유도)"]
        P5["⑤ 희귀도 적용<br/>일반60%·희귀25%·에픽12%·전설3%<br/>확률 기반 랜덤 배분"]
    end

    subgraph Output["출력"]
        O1["추천 카드 큐 20장<br/>순서: 매칭도 높은 순 + 다양성 혼합"]
        O2["TOP 10 직업 리스트<br/>매칭도 % + 연봉 + 전망"]
    end

    Input --> Process --> Output

    style Process fill:#F5A623,color:#fff
```

#### 매칭도 계산 공식

```mermaid
flowchart LR
    U["사용자 벡터<br/>[R,I,A,S,E,C]<br/>[40,20,80,75,30,15]"]
    J["직업 벡터<br/>UX디자이너<br/>[10,30,90,80,50,20]"]
    COS["코사인 유사도<br/>= (U·J) / (|U|×|J|)<br/>= 0.97 → 매칭도 97%"]

    U --> COS
    J --> COS
```

---

### 2.2 직업 카드 스와이프 알고리즘

#### 전체 순서도

```mermaid
flowchart TD
    START["2단계 탐험 탭 진입"] --> LOAD

    LOAD["카드 큐 로딩<br/>추천 엔진 → 20장 준비"]

    LOAD --> SHOW["카드 앞면 표시<br/>직업명 · 키워드 · 매칭도 · 희귀도"]

    SHOW --> GESTURE{"드래그 방향<br/>감지"}

    GESTURE -->|"← (패스)"| PASS["패스 처리<br/>① 패스 로그 저장<br/>② 해당 직업군 가중치 -0.1<br/>③ 다음 카드 로딩"]

    GESTURE -->|"→ (관심)"| LIKE["관심 처리<br/>① 관심함에 저장<br/>② XP +5<br/>③ 해당 직업군 가중치 +0.2<br/>④ L2 카드 확장 표시"]

    GESTURE -->|"↑ (슈퍼관심)"| SUPER["슈퍼관심 처리<br/>① 슈퍼관심함에 저장<br/>② XP +15<br/>③ 해당 직업군 가중치 +0.35<br/>④ 즉시 시뮬레이션 진입 권유"]

    GESTURE -->|"카드 탭 (정보)"| DETAIL["직업 상세 보기<br/>L3 → L4 → L5 레이어 탐색"]

    PASS --> REMAIN{"남은 카드<br/>있음?"}
    LIKE --> L2{"L2 확장에서<br/>선택?"}
    SUPER --> SIM_PROMPT["시뮬 바로 진입 권유<br/>팝업 표시"]

    L2 -->|"시뮬 바로가기"| SIM_START["시뮬레이션 시작"]
    L2 -->|"계속 스와이프"| REMAIN

    SIM_PROMPT -->|"Yes"| SIM_START
    SIM_PROMPT -->|"No"| REMAIN

    REMAIN -->|"있음"| SHOW
    REMAIN -->|"없음 (20장 완료)"| DONE["완료 화면<br/>① 관심 직업 요약<br/>② 추가 탐색 / 시뮬 이동<br/>③ 추천 큐 갱신 (가중치 반영)"]

    style LIKE fill:#F5A623,color:#fff
    style SUPER fill:#6C5CE7,color:#fff
    style PASS fill:#BDC3C7,color:#333
```

#### L1~L5 카드 레이어 열람 흐름

```mermaid
stateDiagram-v2
    [*] --> L1_앞면: 카드 등장

    L1_앞면 --> L1_앞면: 패스 (←)
    L1_앞면 --> L2_관심확장: 관심 (→) or 탭
    L1_앞면 --> SIM시작: 슈퍼관심 (↑)

    L2_관심확장 --> L3_상세페이지: "더 보기" 탭
    L2_관심확장 --> SIM시작: "시뮬 해보기"
    L2_관심확장 --> L1_앞면: "계속 탐색"

    L3_상세페이지 --> L4_기본커리어패스: "커리어 패스 보기"
    L3_상세페이지 --> SIM시작: "시뮬 해보기"

    L4_기본커리어패스 --> L5_합격자패스: "합격자 사례 보기"
    L4_기본커리어패스 --> L4_기본커리어패스: 단계별 체크리스트 열람

    L5_합격자패스 --> 갭분석: "나와 비교하기"
    갭분석 --> 보완액션추천: 갭 계산 완료

    SIM시작 --> [*]
    보완액션추천 --> [*]
```

---

### 2.3 하루 시뮬레이션 상태 머신

#### 전체 분기 구조

```mermaid
stateDiagram-v2
    [*] --> 인트로: 시뮬 시작

    인트로 --> 오전장면: "직업명 + 오늘 상황 설명"

    state 오전장면 {
        [*] --> 상황제시
        상황제시 --> 선택A
        상황제시 --> 선택B
        상황제시 --> 선택C
    }

    오전장면 --> 오후분기A: 선택A
    오전장면 --> 오후분기B: 선택B
    오전장면 --> 오후분기C: 선택C

    state 오후분기A {
        [*] --> A결과 : "선택A 결과"
        A결과 --> A선택1
        A결과 --> A선택2
    }

    state 오후분기B {
        [*] --> B결과 : "선택B 결과"
        B결과 --> B선택1
        B결과 --> B선택2
    }

    state 오후분기C {
        [*] --> C결과 : "선택C 결과"
        C결과 --> C선택1
        C결과 --> C선택2
    }

    오후분기A --> 저녁결산
    오후분기B --> 저녁결산
    오후분기C --> 저녁결산

    state 저녁결산 {
        [*] --> XP지급
        XP지급 --> 현실지수표시
        현실지수표시 --> 핵심스킬표시
        핵심스킬표시 --> 다음액션선택
    }

    state 다음액션선택 {
        [*] --> 관심저장
        [*] --> 다시해보기
        [*] --> 커리어패스보기
        [*] --> 다음직업으로
    }

    다음액션선택 --> [*]
```

#### 시뮬레이션 점수 계산 알고리즘

```mermaid
flowchart TD
    subgraph ScoreCalc["시뮬레이션 점수 계산"]
        SC1["오전 선택 점수<br/>A=낮음 / B=중간 / C=높음<br/>(직업마다 다름)"]
        SC2["오후 선택 점수<br/>오전 결과에 따른 분기"]
        SC3["총점 계산<br/>오전 + 오후 점수 합산"]
        SC4["결과 등급 분류<br/>80+점: '이 직업 잘 맞아!'<br/>50~79점: '도전적이지만 해볼 만해'<br/>50 미만: '다른 방향도 탐색해봐'"]
    end

    subgraph Reward["보상 계산"]
        R1["기본 XP: +30"]
        R2["점수 보너스: 80+점 시 +20 추가"]
        R3["첫 시뮬 보너스: +50 (직업당 1회)"]
        R4["연속 시뮬 보너스: 3회 연속 시 +30"]
        R5["뱃지 체크: 조건 달성 시 자동 지급"]
    end

    subgraph Data["데이터 저장"]
        D1["시뮬 로그 저장<br/>직업·선택·점수·시간"]
        D2["현실지수 저장<br/>스트레스·자유도·보람 점수"]
        D3["핵심스킬 태그 저장<br/>직업마다 정의된 스킬 3개"]
        D4["커리어패스 연결<br/>시뮬 완료 직업의 패스 자동 열람 허용"]
    end

    ScoreCalc --> Reward --> Data
```

---

### 2.4 커리어 패스 생성 알고리즘

#### 기본 커리어 패스 자동 생성 순서도

```mermaid
flowchart TD
    START["커리어 패스 열람 요청<br/>(시뮬 완료 후 잠금 해제)"]

    START --> INPUT["입력값 수집<br/>① 목표 직업<br/>② 사용자 현재 학년<br/>③ 희망 대학 유형 (선택)"]

    INPUT --> LOAD["DB 조회<br/>목표 직업의 기본 패스 템플릿 로딩<br/>(직업당 1개 표준 템플릿)"]

    LOAD --> CALC["학년 계산 엔진"]

    CALC --> CURRENT["현재 학년 마킹<br/>타임라인에 '📍 지금' 표시"]

    CURRENT --> DONE_CHECK{"과거 단계<br/>있음?"}

    DONE_CHECK -->|"Yes"| DONE_MARK["완료 표시 (✅)<br/>사용자가 이미 지난 학년 단계"]
    DONE_CHECK -->|"No"| FUTURE_MARK

    DONE_MARK --> FUTURE_MARK["미래 단계 표시<br/>잠금(🔒) 또는 권장(📌)"]

    FUTURE_MARK --> PRIORITY["우선순위 정렬<br/>이번 학기 해야 할 것 TOP3 추출<br/>긴급도 계산 (남은 학기 수 기반)"]

    PRIORITY --> COST["비용·도구 매핑<br/>각 활동의 비용·추천 도구·무료 대안"]

    COST --> OUTPUT["결과 출력<br/>① 타임라인 뷰 (학기별 체크리스트)<br/>② 이번 학기 TOP3 액션<br/>③ PDF 저장 버튼"]

    style CALC fill:#4A90D9,color:#fff
    style PRIORITY fill:#F5A623,color:#fff
    style OUTPUT fill:#7BC67E,color:#fff
```

#### 긴급도 계산 로직

```mermaid
flowchart LR
    subgraph Urgency["긴급도 계산"]
        U1["남은 학기 수 계산<br/>= 고3 2학기 기준 - 현재 학기"]
        U2["직업별 준비 기간 매핑<br/>UX디자이너: 최소 4학기<br/>의사: 최소 8학기"]
        U3["긴급도 산출<br/>남은 학기 ÷ 필요 기간<br/>1.5 이상: 🟢 여유<br/>1.0~1.5: 🟡 보통<br/>0.7~1.0: 🟠 높음<br/>0.7 미만: 🔴 긴급"]
    end

    U1 --> U2 --> U3
```

---

### 2.5 가상 합격자 패스 갭 분석 알고리즘

#### 전체 처리 순서

```mermaid
flowchart TD
    START["합격자 패스 열람<br/>(기본 패스 열람 후 잠금 해제)"]

    START --> SELECT["전형 선택<br/>학종 / 정시 / 특기자 / 해외"]

    SELECT --> LOAD_PASS["가상 합격자 프로필 로딩<br/>해당 직업 × 전형의 합격자 데이터<br/>(DB에 직업당 전형별 2~3개 프로필)"]

    LOAD_PASS --> USER_DATA["사용자 현황 수집<br/>① 현재 학년<br/>② (자가 입력) 내신 / 수상 / 활동<br/>③ 세특 관련 활동 수<br/>④ 프로젝트/공모전 실적"]

    USER_DATA --> GAP_CALC["갭 계산 엔진"]

    subgraph GAP_CALC["갭 계산 엔진"]
        G1["동일 학년 시점 비교<br/>합격자가 중2일 때 vs 나 현재 중2"]
        G2["스펙 항목별 점수화<br/>내신 차이<br/>세특 횟수 차이<br/>수상 횟수 차이<br/>활동 깊이 차이"]
        G3["가중치 적용<br/>전형별로 중요도 다름<br/>학종: 세특>활동>내신<br/>정시: 내신>수능<br/>특기자: 포트폴리오>수상"]
        G4["달성도 % 계산<br/>= 내 스펙 점수 / 합격자 스펙 점수 × 100"]
    end

    GAP_CALC --> HIGHLIGHT["갭 하이라이트<br/>부족 항목 빨간색 강조<br/>달성 항목 초록색 표시"]

    HIGHLIGHT --> ACTION["보완 액션 추천<br/>갭이 큰 상위 3개 항목에 대해<br/>구체적인 다음 행동 제시<br/>예: '코딩 동아리 가입 (합격자 대비 부족)'"]

    ACTION --> SAVE["나의 커리어 패스에 저장<br/>갭 분석 결과 + 보완 액션이<br/>내 패스에 자동 업데이트"]

    style GAP_CALC fill:#E74C3C,color:#fff
    style ACTION fill:#7BC67E,color:#fff
```

#### 갭 분석 항목 구조

| 분석 항목 | 사용자 입력 방법 | 합격자 데이터 | 차이 계산 |
|---------|--------------|------------|---------|
| 내신 등급 | 직접 입력 (1.0~9.0) | 합격자 내신 등급 | 수치 차이 |
| 세특 관련 횟수 | 직접 입력 (0~6) | 합격자 세특 수 | 횟수 차이 |
| 수상 실적 | 직접 입력 (0~n) | 합격자 수상 횟수 | 횟수 차이 |
| 탐구/R&E 활동 | 있음/없음 선택 | 합격자 활동 여부 | 0 or 1 |
| 포트폴리오 작품 | 직접 입력 (0~n) | 합격자 작품 수 | 횟수 차이 |
| 공모전 도전 | 직접 입력 (0~n) | 합격자 공모전 수 | 횟수 차이 |

---

### 2.6 XP → 레벨 → 기능 잠금 해제 상태 머신

```mermaid
stateDiagram-v2
    [*] --> Lv1탐색자: 앱 가입

    state Lv1탐색자 {
        [*] --> 사용가능
        사용가능 --> 사용가능: 카드 스와이프 (50개 제한)
        note right of 사용가능: 0 XP\n기본 카드 탐색만
    }

    Lv1탐색자 --> Lv2관찰자: 100 XP 달성

    state Lv2관찰자 {
        [*] --> 해금됨
        해금됨 --> 해금됨: 하루 시뮬레이션 잠금 해제
        note right of 해금됨: 100 XP\n시뮬레이션 활성화
    }

    Lv2관찰자 --> Lv3체험자: 300 XP 달성

    state Lv3체험자 {
        [*] --> 해금됨2
        해금됨2 --> 해금됨2: 커리어패스·연봉협상 해금
        note right of 해금됨2: 300 XP\n커리어 패스 활성화
    }

    Lv3체험자 --> Lv4탐험가: 700 XP 달성

    state Lv4탐험가 {
        [*] --> 해금됨3
        해금됨3 --> 해금됨3: 합격자패스·전체 카드200개 해금
        note right of 해금됨3: 700 XP\n합격자 패스 활성화
    }

    Lv4탐험가 --> Lv5커리어러: 1500 XP 달성

    state Lv5커리어러 {
        [*] --> 해금됨4
        해금됨4 --> 해금됨4: 비교 오버레이·PDF 미리보기 해금
        note right of 해금됨4: 1500 XP
    }

    Lv5커리어러 --> Lv6드림파인더: 3000 XP 달성

    state Lv6드림파인더 {
        [*] --> 최종
        최종 --> 최종: 커리어패스 완성본·3단계 초대 해금
        note right of 최종: 3000 XP\n3단계 진입 가능
    }
```

---

### 2.7 나의 커리어 패스 자동 생성 알고리즘

```mermaid
flowchart TD
    TRIGGER["커리어 패스 생성 트리거<br/>① Lv3 달성 시 자동 생성<br/>② 목표 직업 확정 시<br/>③ 합격자 패스 첫 비교 시"]

    TRIGGER --> COLLECT["데이터 수집"]

    subgraph COLLECT["수집 데이터"]
        C1["플레이 행동<br/>스와이프·시뮬·패스열람 기록"]
        C2["관심 직업 TOP3<br/>가중치 기반 순위"]
        C3["갭 분석 결과<br/>합격자 대비 달성도"]
        C4["학년·시간 정보<br/>남은 기간 계산"]
    end

    COLLECT --> BUILD["패스 구성"]

    subgraph BUILD["패스 구성 엔진"]
        B1["유형 프로필 섹션<br/>RIASEC 결과 + 강점 키워드"]
        B2["탐험 기록 섹션<br/>시뮬 완료 직업 + 각 현실지수"]
        B3["목표 직업 섹션<br/>TOP1 기준 커리어 패스 타임라인"]
        B4["합격자 갭 섹션<br/>달성도 % + 보완 액션 TOP3"]
        B5["성장 타임라인 섹션<br/>앱 사용 이력 자동 정렬"]
    end

    BUILD --> OUTPUT["출력 형태"]

    subgraph OUTPUT["출력"]
        O1["앱 내 패스 화면<br/>실시간 업데이트"]
        O2["PDF 저장 (Lv5+)<br/>자소서 소재용 포맷"]
        O3["부모/교사 공유 링크<br/>읽기 전용 URL"]
    end

    style COLLECT fill:#F5A623,color:#fff
    style BUILD fill:#6C5CE7,color:#fff
    style OUTPUT fill:#7BC67E,color:#fff
```

---

## 3. 3단계 알고리즘 상세 설계

### 3.1 클루 매칭 알고리즘

#### 매칭 점수 계산 순서도

```mermaid
flowchart TD
    START["3단계 시작 or 클루 매칭 요청"]

    START --> MODE{"팀 or 솔로?"}

    MODE -->|"솔로"| SOLO["솔로 트랙 시작<br/>개인 프로젝트 보드 생성<br/>전체 Q&A 접근 허용"]

    MODE -->|"팀"| POOL["매칭 풀 진입<br/>현재 매칭 대기 중인 유저 목록"]

    POOL --> FILTER["필터링<br/>① Lv6 이상 (3단계 진입 자격)<br/>② 클루 없음 상태<br/>③ 프로젝트 유형 선호 일치"]

    FILTER --> SCORE["매칭 점수 계산"]

    subgraph SCORE["매칭 점수 계산 (100점 만점)"]
        S1["커리어 방향 일치 (40점)<br/>관심 직업 카테고리 동일: 40점<br/>유사 카테고리: 20점<br/>무관: 0점"]
        S2["RIASEC 유형 유사 (25점)<br/>동일 유형: 25점<br/>인접 유형: 15점<br/>보완적 유형: 10점"]
        S3["프로젝트 유형 선호 (20점)<br/>앱개발/디자인/기획/콘텐츠 중<br/>동일 선호: 20점"]
        S4["학년 근접 (10점)<br/>±1년: 10점 / ±2년: 5점 / ±3년: 0점"]
        S5["활동 시간대 (5점)<br/>주말형 vs 평일형 일치: 5점"]
    end

    SCORE --> RANK["점수 내림차순 정렬<br/>상위 5명 후보 선정"]

    RANK --> SHOW["전우 후보 카드 표시<br/>프로필 + 매칭도 % + 꿈"]

    SHOW --> ACCEPT{"수락?"}

    ACCEPT -->|"수락"| COUNT{"클루 4명<br/>모였나?"}
    ACCEPT -->|"거절"| NEXT["다음 후보 표시"]
    NEXT --> ACCEPT

    COUNT -->|"No"| WAIT["대기 + 알림<br/>'전우 3/4명 모집 중'"]
    COUNT -->|"Yes"| CREATE["클루 생성<br/>① 클루 이름 설정<br/>② 공동 목표 선언<br/>③ 채팅방 자동 생성<br/>④ 프로젝트 보드 자동 생성"]

    WAIT --> COUNT
    CREATE --> CLUE_START["클루 활동 시작"]

    style SCORE fill:#1ABC9C,color:#fff
    style CREATE fill:#7BC67E,color:#fff
```

---

### 3.2 프로젝트 상태 머신

```mermaid
stateDiagram-v2
    [*] --> 준비 : 클루 결성

    state 준비 {
        [*] --> 공동목표선언
        공동목표선언 --> 프로젝트유형선택
        프로젝트유형선택 --> 기간설정
        기간설정 --> [*]
    }

    준비 --> 기획단계 : 준비 완료 자동전환

    state 기획단계 {
        [*] --> 기획서작성
        기획서작성 --> 역할분담
        역할분담 --> 일정표작성
        일정표작성 --> 기획인증요청
        기획인증요청 --> 기획인증완료 : 완성도 70% 이상
    }

    note right of 기획단계
        필수입력 항목
        프로젝트명 목적 타겟 일정
    end note

    기획단계 --> 설계단계 : 기획 인증 완료

    state 설계단계 {
        [*] --> 와이어프레임작성
        와이어프레임작성 --> 기술스택선택
        기술스택선택 --> 중간점검회의
        중간점검회의 --> 설계인증요청
        설계인증요청 --> 설계인증완료 : 와이어프레임 첨부
    }

    설계단계 --> 제작단계 : 설계 인증 완료

    state 제작단계 {
        [*] --> 각자파트개발
        각자파트개발 --> 주간진행체크 : 매주 자동 트리거
        주간진행체크 --> 각자파트개발 : 계속 진행
        주간진행체크 --> QA문의 : 막힘 발생
        QA문의 --> 각자파트개발 : 문의 해결
        각자파트개발 --> 통합테스트
        통합테스트 --> 제작인증요청
        제작인증요청 --> 제작인증완료 : 진행 화면 캡처 첨부
    }

    제작단계 --> 배포단계 : 제작 인증 완료

    state 배포단계 {
        [*] --> MVP완성
        MVP완성 --> 배포URL등록
        배포URL등록 --> 배포URL검증 : 자동 크롤링 확인
        배포URL검증 --> 배포인증완료 : URL 유효성 확인
        배포인증완료 --> 포트폴리오자동생성
    }

    배포단계 --> 완성 : 배포 인증 완료

    state 완성 {
        [*] --> DreamFestival출품자격
        DreamFestival출품자격 --> 포트폴리오확인
        포트폴리오확인 --> [*]
    }

    준비 --> 중단 : 클루 해산 또는 기간 초과
    기획단계 --> 중단
    설계단계 --> 중단
    제작단계 --> 중단

    note right of 중단
        개인 포트폴리오에
        진행 경험으로 자동 기록
    end note
```

#### 단계 전환 조건 상세표

| 전환 | 조건 | 검증 방법 | 실패 시 처리 |
|------|------|---------|------------|
| 준비 → 기획 | 공동 목표 선언 완료 | 텍스트 입력 확인 | 입력 유도 팝업 |
| 기획 → 설계 | 기획서 완성도 70%+ | 필수 항목 7개 중 5개+ 입력 | 미완성 항목 하이라이트 |
| 설계 → 제작 | 와이어프레임 or 플로우차트 첨부 | 이미지/링크 존재 확인 | Figma 템플릿 추천 |
| 제작 → 배포 | 진행 캡처 첨부 + 전원 체크인 | 이미지 존재 + 모든 멤버 확인 | 미체크인 멤버 알림 |
| 배포 인증 | 배포 URL 유효성 | HTTP 200 응답 확인 | 배포 가이드 링크 제공 |

---

### 3.3 칸반 보드 상태 관리

#### 카드 생명주기

```mermaid
flowchart LR
    CREATE["카드 생성<br/>+ 담당자 지정<br/>+ 마감일 설정"]

    CREATE --> TODO["📋 기획 완료<br/>(할 일)"]

    TODO -->|"작업 시작"| INPROGRESS["🔄 진행 중"]

    INPROGRESS -->|"완료"| DONE["✅ 완료"]

    INPROGRESS -->|"막힘 (D-3일)"| WARN["⚠️ 경고<br/>전우에게 알림 전송"]

    WARN -->|"해결"| INPROGRESS
    WARN -->|"미해결 (D-Day)"| OVERDUE["🔴 기한 초과<br/>클루 전체 알림"]

    OVERDUE -->|"완료"| DONE
    OVERDUE -->|"재조정"| TODO

    DONE -->|"전원 확인"| VERIFIED["✅ 검증 완료<br/>공동 목표 게이지 +%"]

    style CREATE fill:#4A90D9,color:#fff
    style DONE fill:#7BC67E,color:#fff
    style WARN fill:#F5A623,color:#fff
    style OVERDUE fill:#E74C3C,color:#fff
```

#### 공동 목표 게이지 계산

```mermaid
flowchart TD
    subgraph Gauge["공동 목표 게이지 계산"]
        G1["단계별 가중치 설정<br/>기획 완료: 20%<br/>설계 완료: 20%<br/>제작 완료: 30%<br/>배포 완료: 30%"]
        G2["칸반 완료 카드 비율<br/>= 완료 카드 수 / 전체 카드 수"]
        G3["게이지 = 단계 가중치 × 완료 비율<br/>+ 이전 단계 누적"]
        G4["전우별 기여도<br/>= 내가 완료한 카드 수 / 전체 카드 수"]
    end

    G1 --> G3
    G2 --> G3
    G3 --> DISPLAY["게이지 UI 업데이트<br/>실시간 애니메이션"]
    G4 --> DISPLAY
```

---

### 3.4 문의 라우팅 알고리즘

```mermaid
flowchart TD
    Q["문의 작성 완료<br/>제목 + 내용 + 카테고리"]

    Q --> URGENT{"긴급 문의<br/>선택?"}

    URGENT -->|"Yes"| EMERGENCY["🔥 긴급 라우팅<br/>① 클루 전원 푸시 알림<br/>② 전체 게시판 상단 고정<br/>③ 30분 내 미답변 시 AI 자동 답변 트리거"]

    URGENT -->|"No"| SCOPE{"공개 범위?"}

    SCOPE -->|"클루 내부"| CLUE_ONLY["클루 Q&A에 게시<br/>전우들만 볼 수 있음<br/>클루원 알림 전송"]

    SCOPE -->|"전체 공개"| PUBLIC["전체 게시판 게시<br/>모든 유저 열람 가능<br/>관심 태그 유저 알림"]

    PUBLIC --> AUTO_MATCH["AI 자동 매칭<br/>유사 해결된 Q&A 검색<br/>→ 유사 문의 3개 링크 표시"]

    AUTO_MATCH --> ANSWERED{"48시간 내<br/>답변?"}

    ANSWERED -->|"Yes"| REWARD["답변 보상<br/>질문자: +30 XP<br/>답변자: +80 XP<br/>채택 시 +150 XP"]

    ANSWERED -->|"No"| EXPERT["전문가 Q&A 큐<br/>현직 멘토에게 전달<br/>(유료 기능)"]

    EXPERT --> EXPERT_ANS["전문가 답변<br/>48시간 이내"]

    REWARD --> FAQ_CHECK{"동일 질문<br/>5회 이상?"}

    FAQ_CHECK -->|"Yes"| FAQ["FAQ 아카이브 자동 등록<br/>다음 유저가 물어보기 전에<br/>미리 검색 결과에 표시"]

    style EMERGENCY fill:#E74C3C,color:#fff
    style REWARD fill:#F5A623,color:#fff
    style FAQ fill:#7BC67E,color:#fff
```

---

### 3.5 배포 인증 알고리즘

```mermaid
flowchart TD
    START["배포 인증 요청<br/>유저가 URL 제출"]

    START --> TYPE{"프로젝트 타입<br/>선택"}

    TYPE -->|"웹"| WEB_CHECK["URL 유효성 검사<br/>① HTTP GET 요청<br/>② 200 응답 확인<br/>③ 콘텐츠 존재 확인"]

    TYPE -->|"디자인"| DESIGN_CHECK["Figma/Behance 링크<br/>① 도메인 검증 (figma.com/behance.net)<br/>② 공개 설정 확인<br/>③ 링크 유효성 확인"]

    TYPE -->|"기획서"| DOC_CHECK["Notion/PDF<br/>① 도메인 or 파일 확인<br/>② 공개 접근 가능 여부<br/>③ 콘텐츠 분량 확인 (최소 3페이지)"]

    TYPE -->|"콘텐츠"| CONTENT_CHECK["YouTube/블로그<br/>① URL 유효성<br/>② 공개 여부 확인"]

    WEB_CHECK & DESIGN_CHECK & DOC_CHECK & CONTENT_CHECK --> VALIDATE{"검증 통과?"}

    VALIDATE -->|"Yes"| SCREENSHOT["스크린샷 확인<br/>유저 제출 스크린샷 존재 여부"]

    VALIDATE -->|"No"| FAIL["인증 실패<br/>오류 메시지 + 배포 가이드 링크"]

    SCREENSHOT --> CERT["배포 인증 완료!<br/>① 인증 스탬프 발급<br/>② +500 XP 지급<br/>③ 전설 뱃지 '첫 배포' 지급<br/>④ 포트폴리오 자동 생성 트리거<br/>⑤ DreamFestival 출품 자격 부여"]

    FAIL --> RETRY["재시도 권유<br/>'배포 가이드' 링크 제공"]

    style CERT fill:#7BC67E,color:#fff
    style FAIL fill:#E74C3C,color:#fff
```

---

### 3.6 포트폴리오 자동 생성 알고리즘

```mermaid
flowchart TD
    TRIGGER["포트폴리오 생성 트리거<br/>① 배포 인증 완료<br/>② 분기별 자동 업데이트<br/>③ 사용자 수동 요청"]

    TRIGGER --> COLLECT["전체 활동 데이터 수집"]

    subgraph COLLECT["수집 항목"]
        C1["2단계 탐험 기록<br/>시뮬 완료 직업 목록<br/>현실지수·핵심스킬 태그"]
        C2["커리어 패스 데이터<br/>목표 직업·달성도·보완 액션"]
        C3["3단계 프로젝트 기록<br/>기획서·일정표·배포 URL<br/>역할·기여도"]
        C4["문의 활동 기록<br/>질문 횟수·답변 횟수·채택 횟수"]
        C5["뱃지·XP·레벨 기록"]
    end

    COLLECT --> FORMAT["포트폴리오 포맷 적용"]

    subgraph FORMAT["섹션 자동 구성"]
        F1["① 나는 이런 사람<br/>RIASEC 유형 + 강점 키워드"]
        F2["② 직업 탐험 여정<br/>살아본 직업 + 현실지수 비교"]
        F3["③ 커리어 방향<br/>목표 직업 + 합격자 대비 달성도"]
        F4["④ 완성한 프로젝트<br/>배포 URL + 역할 + 기여도"]
        F5["⑤ 성장 타임라인<br/>시간순 주요 이정표 자동 정렬"]
        F6["⑥ 자소서 소재 추천<br/>AI가 활동 데이터에서 추출한<br/>자소서 활용 가능 경험 3개"]
    end

    FORMAT --> OUTPUT{"출력 형태"}

    OUTPUT -->|"앱 내 보기"| APP_VIEW["앱 내 포트폴리오 탭<br/>실시간 업데이트 뷰"]

    OUTPUT -->|"PDF 저장 (Lv5+)"| PDF["PDF 생성<br/>A4 2~4페이지<br/>자소서용 포맷"]

    OUTPUT -->|"공유 링크"| SHARE["읽기 전용 URL 생성<br/>부모·교사에게 공유"]

    style COLLECT fill:#4A90D9,color:#fff
    style FORMAT fill:#6C5CE7,color:#fff
    style OUTPUT fill:#7BC67E,color:#fff
```

---

## 4. 2단계·3단계 전체 관계도 (통합)

### 4.1 2단계 내부 컴포넌트 관계도

```mermaid
flowchart TD
    RIASEC["RIASEC 결과<br/>(1단계에서 입력)"]

    subgraph Engine2["2단계 핵심 엔진"]
        REC_ENGINE["추천 엔진<br/>매칭도 % 계산"]
        SWIPE_LOG["스와이프 로그<br/>행동 데이터"]
        WEIGHT_TABLE["가중치 테이블<br/>실시간 갱신"]
        SIM_ENGINE["시뮬레이션 엔진<br/>분기 스토리 실행"]
        PATH_ENGINE["패스 생성 엔진<br/>학년 기반 체크리스트"]
        GAP_ENGINE["갭 분석 엔진<br/>사용자 vs 합격자"]
    end

    subgraph DB2["2단계 데이터"]
        JOB_DB["직업 DB<br/>200개 직업 정보"]
        CAREER_DB["커리어 패스 DB<br/>직업별 표준 템플릿"]
        VPASS_DB["합격자 패스 DB<br/>직업×전형별 프로필"]
        SCORE_DB["XP/레벨 DB<br/>사용자별 누적 점수"]
    end

    subgraph Output2["2단계 결과물"]
        CARD_QUEUE["카드 큐 (20장)"]
        MY_PATH["나의 커리어 패스"]
        GAP_RESULT["갭 분석 결과"]
        LEVEL_STATE["레벨 상태"]
    end

    RIASEC --> REC_ENGINE
    SWIPE_LOG --> WEIGHT_TABLE
    WEIGHT_TABLE --> REC_ENGINE
    REC_ENGINE --> CARD_QUEUE

    CARD_QUEUE --> SIM_ENGINE
    JOB_DB --> SIM_ENGINE
    SIM_ENGINE --> SCORE_DB

    CAREER_DB --> PATH_ENGINE
    SIM_ENGINE --> PATH_ENGINE
    PATH_ENGINE --> MY_PATH

    VPASS_DB --> GAP_ENGINE
    MY_PATH --> GAP_ENGINE
    GAP_ENGINE --> GAP_RESULT

    SCORE_DB --> LEVEL_STATE
    LEVEL_STATE -->|"Lv6 달성"| STAGE3_UNLOCK["3단계 잠금 해제"]
```

### 4.2 3단계 내부 컴포넌트 관계도

```mermaid
flowchart TD
    MY_PATH["나의 커리어 패스<br/>(2단계 결과)"]
    LEVEL6["Lv6 달성<br/>(2단계 조건)"]

    subgraph Engine3["3단계 핵심 엔진"]
        MATCH_ENGINE["클루 매칭 엔진<br/>가중치 점수 계산"]
        STATE_MACHINE["프로젝트 상태 머신<br/>기획→설계→제작→배포"]
        KANBAN_ENGINE["칸반 보드 엔진<br/>카드 상태 관리"]
        QA_ROUTER["문의 라우터<br/>채널 분배"]
        DEPLOY_CHECK["배포 인증기<br/>URL 유효성 검사"]
        PORT_GEN["포트폴리오 생성기<br/>데이터 자동 조합"]
    end

    subgraph DB3["3단계 데이터"]
        CLUE_DB["클루 DB<br/>멤버·상태·기여도"]
        PROJECT_DB["프로젝트 DB<br/>기획서·일정·단계"]
        QA_DB["Q&A DB<br/>문의·답변·채택"]
        CERT_DB["인증 DB<br/>배포 URL·타임스탬프"]
    end

    subgraph Output3["3단계 결과물"]
        CLUE_BOARD["클루 보드<br/>공동 목표 게이지"]
        KANBAN_VIEW["칸반 보드 뷰"]
        QA_FEED["Q&A 피드"]
        PORTFOLIO["포트폴리오<br/>(자동 생성)"]
        FESTIVAL["DreamFestival<br/>출품 자격"]
    end

    MY_PATH & LEVEL6 --> MATCH_ENGINE
    MATCH_ENGINE --> CLUE_DB
    CLUE_DB --> STATE_MACHINE
    STATE_MACHINE --> PROJECT_DB
    PROJECT_DB --> KANBAN_ENGINE
    KANBAN_ENGINE --> KANBAN_VIEW
    KANBAN_ENGINE --> CLUE_BOARD

    STATE_MACHINE --> QA_ROUTER
    QA_ROUTER --> QA_DB
    QA_DB --> QA_FEED

    STATE_MACHINE -->|"배포 단계"| DEPLOY_CHECK
    DEPLOY_CHECK --> CERT_DB
    CERT_DB --> PORT_GEN
    PORT_GEN --> PORTFOLIO
    PORT_GEN --> FESTIVAL
```

### 4.3 2단계 → 3단계 연결 관계도

```mermaid
flowchart LR
    subgraph S2["2단계 출력"]
        S2A["나의 커리어 패스<br/>목표 직업 + 달성도"]
        S2B["RIASEC 유형 + 행동 패턴"]
        S2C["Lv6 달성"]
        S2D["시뮬 완료 직업 목록"]
    end

    subgraph Connect["연결 데이터"]
        C1["클루 매칭 기준 데이터<br/>커리어 방향 + 유형"]
        C2["프로젝트 방향 데이터<br/>어떤 직업 분야의 프로젝트?"]
        C3["포트폴리오 씨앗<br/>2단계 탐험 기록 → 3단계 포폴의 도입부"]
    end

    subgraph S3["3단계 입력"]
        S3A["클루 매칭 조건"]
        S3B["프로젝트 유형 추천"]
        S3C["포트폴리오 자동 인계"]
    end

    S2A --> C1 --> S3A
    S2B --> C1
    S2C --> S3A
    S2A --> C2 --> S3B
    S2D --> C3 --> S3C

    style S2 fill:#F5A623,color:#fff
    style Connect fill:#6C5CE7,color:#fff
    style S3 fill:#1ABC9C,color:#fff
```

---

## 5. 화면 전환 플로우 (앱 내비게이션)

### 5.1 전체 내비게이션 구조

```mermaid
flowchart TD
    SPLASH["스플래시 화면<br/>로고 + 로딩"]

    SPLASH --> AUTH{"로그인<br/>여부?"}

    AUTH -->|"신규"| ONBOARD["온보딩<br/>① 닉네임 입력<br/>② 학년 선택<br/>③ 적성 검사 안내"]

    AUTH -->|"기존"| HOME

    ONBOARD --> QUIZ["1단계: 적성 검사<br/>20문항"]

    QUIZ --> RESULT["검사 결과 화면<br/>유형 카드 + TOP10"]

    RESULT --> HOME["홈 (Dream Dashboard)<br/>탭바: 홈·탐험·패스·클루·포폴"]

    subgraph TAB["탭 내비게이션 (5탭)"]
        T1["🏠 홈<br/>오늘의 추천 + 미션 + 클루 요약"]
        T2["🎮 탐험<br/>카드 스와이프 + 시뮬레이션"]
        T3["🗺️ 패스<br/>기본패스 + 합격자패스 + 나의패스"]
        T4["⚔️ 클루<br/>클루 보드 + 프로젝트 + Q&A"]
        T5["📁 포폴<br/>포트폴리오 + PDF + 공유"]
    end

    HOME --> TAB

    subgraph MODAL["모달/오버레이"]
        M1["시뮬레이션 풀스크린<br/>탭바 숨김"]
        M2["기획서 작성 풀스크린<br/>탭바 숨김"]
        M3["XP/뱃지 팝업<br/>반투명 오버레이"]
        M4["합격자 비교 바텀시트<br/>하단 60%"]
    end

    T2 --> M1
    T4 --> M2
    T2 & T3 & T4 --> M3
    T3 --> M4
```

### 5.2 2단계 화면 전환 흐름

```mermaid
flowchart TD
    HOME_CARD["홈의 '오늘의 추천 체험' 카드"]
    EXPLORE_TAB["탐험 탭 직접 진입"]

    HOME_CARD --> EXPLORE
    EXPLORE_TAB --> EXPLORE

    EXPLORE["탐험 메인<br/>필터 + 진행도 + 카드 스택"]

    EXPLORE --> SWIPE["카드 스와이프 모드<br/>20장 연속"]

    SWIPE -->|"관심 저장"| L2["L2 확장 팝업<br/>연봉곡선 + 하루일과"]

    L2 -->|"시뮬 해보기"| SIM_FULL["시뮬레이션 풀스크린<br/>(탭바 숨김)"]

    SIM_FULL --> SIM_RESULT["시뮬 결산 화면<br/>XP + 현실지수 + 핵심스킬"]

    SIM_RESULT -->|"커리어 패스 보기"| PATH_TAB["패스 탭 이동"]
    SIM_RESULT -->|"관심 저장"| INTEREST["관심함"]
    SIM_RESULT -->|"다시 해보기"| SIM_FULL
    SIM_RESULT -->|"다음 직업"| SWIPE

    PATH_TAB --> BASIC_PATH["기본 커리어 패스<br/>학년별 타임라인"]

    BASIC_PATH -->|"합격자 보기"| VPASS["가상 합격자 패스<br/>전형 선택 → 프로필"]

    VPASS --> COMPARE["비교 오버레이<br/>나 vs 합격자 갭"]

    COMPARE --> ACTION["보완 액션 추천<br/>TOP3 다음 행동"]

    ACTION --> MY_PATH["나의 커리어 패스<br/>자동 업데이트"]

    MY_PATH -->|"Lv6 + '전우 찾기'"| STAGE3["3단계 진입"]
```

### 5.3 3단계 화면 전환 흐름

```mermaid
flowchart TD
    CLUE_TAB["클루 탭 진입"]

    CLUE_TAB --> CHECK{"클루<br/>있음?"}

    CHECK -->|"없음"| MATCH_START["클루 매칭 시작 화면<br/>'팀으로? 혼자?'"]

    CHECK -->|"있음"| CLUE_BOARD["클루 보드<br/>공동 목표 게이지 + 멤버"]

    MATCH_START -->|"팀"| CANDIDATE["전우 후보 카드<br/>3~5명 순차 표시"]
    MATCH_START -->|"솔로"| SOLO_BOARD["솔로 프로젝트 보드"]

    CANDIDATE --> CLUE_CREATE["클루 결성 화면<br/>이름 설정 + 공동 목표 선언"]

    CLUE_CREATE --> CLUE_BOARD

    CLUE_BOARD --> PROJ_BOARD["프로젝트 보드<br/>현재 단계 + 칸반"]

    PROJ_BOARD --> KANBAN["칸반 보드<br/>할 일 / 진행 중 / 완료"]

    KANBAN --> PLANNING["기획서 작성 풀스크린<br/>(기획 단계만 활성)"]
    KANBAN --> QA_BOARD["Q&A 게시판<br/>클루 내부 + 전체"]

    QA_BOARD --> QA_WRITE["문의 작성 화면<br/>카테고리 + 내용"]
    QA_BOARD --> QA_DETAIL["문의 상세/답변 화면"]

    PROJ_BOARD -->|"배포 단계"| DEPLOY_CERT["배포 인증 화면<br/>URL 입력 + 스크린샷"]

    DEPLOY_CERT -->|"인증 완료"| CELEBRATION["배포 완료 축하 화면<br/>파티클 + 전설 뱃지 팝업"]

    CELEBRATION --> PORTFOLIO["포트폴리오 탭 이동<br/>자동 생성 확인"]
    CELEBRATION --> FESTIVAL["DreamFestival 출품 화면"]
```

---

## 6. 알림(Push) 트리거 알고리즘

```mermaid
flowchart TD
    subgraph Triggers["알림 트리거"]
        T1["⏰ 리텐션 알림<br/>48시간 미접속 시<br/>'새 직업 카드가 기다려!'"]
        T2["📅 마일스톤 알림<br/>커리어 패스 기한 D-7<br/>'이번 주 공모전 마감이야!'"]
        T3["⚔️ 클루 알림<br/>전우 활동 발생 시<br/>'지민이 칸반 완료했어!'"]
        T4["🔥 긴급 문의 알림<br/>전우가 긴급 문의 올림<br/>'도움이 필요해! +80XP'"]
        T5["🏆 배포 완료 알림<br/>클루원이 배포 인증<br/>'우리 클루 목표 달성!'"]
        T6["⚡ XP 보너스 알림<br/>연속 출석 7일 임박<br/>'내일 접속하면 7일 연속!'"]
    end

    subgraph Rule["발송 규칙"]
        R1["1일 최대 알림: 3개<br/>우선순위: 긴급>배포>마일스톤>클루>리텐션"]
        R2["야간 발송 금지<br/>22:00 ~ 08:00 큐잉 후 아침 발송"]
        R3["알림 OFF 유저 제외<br/>설정에서 카테고리별 끄기 가능"]
    end

    Triggers --> Rule
```

---

*작성일: 2026년 2월 | DreamPath 알고리즘 설계서 V1*
*참조 문서: DreamPath_상세기획서_V2_상.md / DreamPath_상세기획서_V2_하.md*
