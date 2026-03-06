# DreamPath - Expo 앱 실행 가이드

## 프로젝트 개요

DreamPath는 Next.js 웹 앱을 Expo React Native로 변환한 모바일 앱입니다. 적성 검사부터 직업 체험까지 게임처럼 즐기는 진로 탐색 앱입니다.

---

## 시스템 요구사항

### 필수 설치 항목

1. **Node.js** (v18 이상)
   ```bash
   node --version  # v18.0.0 이상 확인
   ```

2. **npm** 또는 **yarn**
   ```bash
   npm --version  # 9.0.0 이상 권장
   ```

3. **Expo CLI** (자동 설치됨)
   - 프로젝트 실행 시 자동으로 설치됩니다

### 플랫폼별 추가 요구사항

#### iOS 개발 (Mac 전용)
- **Xcode** (최신 버전)
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```
- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```

#### Android 개발
- **Android Studio**
- **Android SDK** (API 34 이상)
- **Java Development Kit (JDK)** 17

---

## 설치 및 실행

### 1. 프로젝트 디렉토리로 이동

```bash
cd /Users/kimjongphil/Documents/GitHub/AI-career-path/app/dreampath-app
```

### 2. 의존성 설치 (이미 완료됨)

처음 설치가 필요한 경우:
```bash
npm install
```

### 3. 앱 실행

#### 개발 서버 시작
```bash
npm start
```

실행하면 QR 코드와 함께 다음과 같은 옵션이 표시됩니다:

```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

#### iOS 시뮬레이터에서 실행
```bash
npm run ios
```

또는 개발 서버 실행 후 `i` 키를 누릅니다.

#### Android 에뮬레이터에서 실행
```bash
npm run android
```

또는 개발 서버 실행 후 `a` 키를 누릅니다.

#### 웹 브라우저에서 실행 (테스트용)
```bash
npm run web
```

또는 개발 서버 실행 후 `w` 키를 누릅니다.

---

## 실제 디바이스에서 테스트

### Expo Go 앱 사용 (가장 빠른 방법)

1. **Expo Go 앱 설치**
   - iOS: [App Store에서 Expo Go 다운로드](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store에서 Expo Go 다운로드](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **개발 서버 시작**
   ```bash
   npm start
   ```

3. **QR 코드 스캔**
   - iOS: 카메라 앱으로 QR 코드 스캔
   - Android: Expo Go 앱에서 QR 코드 스캔

4. **앱 자동 로드**
   - 코드 변경 시 자동으로 새로고침됩니다

---

## 프로젝트 구조

```
dreampath-app/
├── App.tsx                    # 앱 진입점
├── app.json                   # Expo 설정
├── package.json               # 의존성 관리
├── tsconfig.json              # TypeScript 설정
└── src/
    ├── config/                # 설정 파일
    │   ├── theme.ts          # 색상, 간격, 폰트 크기
    │   └── labels.ts         # UI 텍스트, 라벨
    ├── lib/                   # 비즈니스 로직
    │   ├── types.ts          # TypeScript 타입
    │   ├── storage.ts        # AsyncStorage 래퍼
    │   └── xp.ts             # XP/레벨 시스템
    ├── data/                  # JSON 콘텐츠
    │   ├── levels.json       # 레벨 정의
    │   └── stars/            # 별 데이터 (4개)
    ├── components/            # 재사용 컴포넌트
    │   ├── TabBar.tsx        # 하단 탭 바
    │   ├── FloatingParticles.tsx
    │   ├── GradientBackground.tsx
    │   └── home/             # 홈 화면 섹션들
    ├── screens/               # 화면
    │   ├── SplashScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── JobsExploreScreen.tsx
    │   ├── CareerPathScreen.tsx
    │   └── LaunchpadScreen.tsx
    └── navigation/            # 네비게이션
        ├── AppNavigator.tsx
        └── MainTabNavigator.tsx
```

---

## 주요 기술 스택

| 기술 | 버전 | 용도 |
|---|---|---|
| **Expo** | ~55.0.5 | React Native 개발 플랫폼 |
| **React Native** | 0.83.2 | 모바일 UI 프레임워크 |
| **React** | 19.2.0 | UI 라이브러리 |
| **TypeScript** | ~5.9.2 | 타입 안정성 |
| **React Navigation** | ^7.x | 화면 네비게이션 |
| **AsyncStorage** | 2.2.0 | 로컬 데이터 저장 |
| **Expo Linear Gradient** | ~55.0.8 | 그라디언트 UI |
| **React Native Reanimated** | 4.2.1 | 애니메이션 |

---

## 개발 명령어

### 기본 명령어

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

### 유용한 명령어

```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 캐시 삭제 후 시작
npx expo start --clear

# 터널 모드 (외부 네트워크에서 접근)
npx expo start --tunnel

# 프로덕션 모드
npx expo start --no-dev --minify
```

---

## 빌드 및 배포

### 개발 빌드 (Development Build)

```bash
# iOS 개발 빌드
npx expo run:ios

# Android 개발 빌드
npx expo run:android
```

### EAS Build (프로덕션)

1. **EAS CLI 설치**
   ```bash
   npm install -g eas-cli
   ```

2. **Expo 계정 로그인**
   ```bash
   eas login
   ```

3. **프로젝트 설정**
   ```bash
   eas build:configure
   ```

4. **빌드 실행**
   ```bash
   # iOS 빌드
   eas build --platform ios

   # Android 빌드
   eas build --platform android

   # 모든 플랫폼
   eas build --platform all
   ```

5. **앱 스토어 제출**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

---

## 문제 해결

### 1. Metro bundler 오류

```bash
# 캐시 삭제
npx expo start --clear

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. iOS 시뮬레이터가 열리지 않을 때

```bash
# Xcode 시뮬레이터 수동 실행
open -a Simulator

# CocoaPods 재설치
cd ios
pod install
cd ..
```

### 3. Android 에뮬레이터 연결 안 될 때

```bash
# ADB 재시작
adb kill-server
adb start-server

# 연결된 디바이스 확인
adb devices
```

### 4. TypeScript 오류

```bash
# 타입 체크
npx tsc --noEmit

# tsconfig 재생성
npx expo customize tsconfig.json
```

### 5. 의존성 버전 충돌

```bash
# Expo SDK 호환 버전으로 자동 수정
npx expo install --fix
```

---

## 데이터 관리

### AsyncStorage 키 목록

앱은 다음 키로 로컬 데이터를 저장합니다:

- `dreampath_user_profile` - 사용자 프로필 (닉네임, 학년)
- `dreampath_riasec_result` - RIASEC 적성 검사 결과
- `dreampath_xp_log` - XP 및 레벨 로그
- `dreampath_earned_badges` - 획득한 배지 목록
- `dreampath_favorite_jobs` - 즐겨찾기 직업
- `career_plans` - 저장된 커리어 패스

### 데이터 초기화

개발 중 데이터를 초기화하려면:

```typescript
import { storage } from './src/lib/storage';

// 모든 데이터 삭제
await storage.reset();
```

---

## 성능 최적화

### 1. 프로덕션 빌드 최적화

```bash
# Hermes 엔진 활성화 (기본값)
# app.json에서 확인:
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

### 2. 이미지 최적화

- 이미지는 `assets/` 폴더에 저장
- WebP 포맷 권장
- 큰 이미지는 `expo-image` 사용 권장

### 3. 번들 크기 줄이기

```bash
# 사용하지 않는 의존성 제거
npm uninstall <package-name>

# 번들 분석
npx expo export --dump-sourcemap
```

---

## 디버깅

### React Native Debugger

1. **설치**
   ```bash
   brew install --cask react-native-debugger
   ```

2. **실행**
   - React Native Debugger 앱 실행
   - 앱에서 개발자 메뉴 열기 (흔들기 또는 Cmd+D)
   - "Debug" 선택

### Flipper (권장)

1. **설치**
   ```bash
   brew install --cask flipper
   ```

2. **실행**
   - Flipper 앱 실행
   - 앱 자동 연결
   - Layout Inspector, Network Inspector 등 사용

### 로그 확인

```bash
# iOS 로그
npx react-native log-ios

# Android 로그
npx react-native log-android
```

---

## 환경 변수 (추후 백엔드 연동 시)

`.env` 파일 생성:

```bash
# .env
API_URL=https://api.dreampath.com
API_KEY=your_api_key_here
```

`app.json`에 추가:

```json
{
  "expo": {
    "extra": {
      "apiUrl": process.env.API_URL,
      "apiKey": process.env.API_KEY
    }
  }
}
```

코드에서 사용:

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

---

## 코드 스타일 가이드

### 파일 구조 원칙

- ✅ 하나의 파일은 **400줄 이하**로 유지
- ✅ 컴포넌트는 기능별로 분리 (예: `home/` 폴더)
- ✅ 설정은 `config/` 폴더에서 관리
- ✅ JSON 데이터는 `data/` 폴더에서 관리

### 네이밍 컨벤션

```typescript
// 파일명: PascalCase (컴포넌트)
HeroSection.tsx
CareerPathSection.tsx

// 파일명: kebab-case (유틸리티)
storage.ts
xp.ts

// 함수명: camelCase (명확하고 길게)
getUserProfile()
getLevelForXP()
handleCareerPathNavigation()

// 변수명: camelCase (명확하고 길게)
const savedCareerPlans = [];
const currentUserXPProgress = 0;

// 상수: UPPER_SNAKE_CASE
const RIASEC_META = {};
const HOME_LABELS = {};
```

### TypeScript 원칙

```typescript
// ✅ 모든 함수에 타입 명시
function calculateXP(amount: number, level: number): number {
  return amount * level;
}

// ✅ interface 사용 (type alias는 유니온/교차 타입에만)
interface UserProfile {
  id: string;
  nickname: string;
}

// ✅ Props는 interface로 정의
interface HeroSectionProps {
  nickname: string;
  level: LevelDefinition;
  onSettings: () => void;
}
```

### 클린 코드 원칙

```typescript
// ✅ Early return 사용
function processUser(user: UserProfile | null) {
  if (!user) return null;
  if (!user.onboardingCompleted) return null;
  
  return user.nickname;
}

// ✅ 배열 메서드 활용
const activePlans = savedPlans.filter(plan => plan.type === 'activity');
const planTitles = savedPlans.map(plan => plan.title);

// ✅ 반복 코드는 컴포넌트/함수로 추출
const STATS_CONFIG = [
  { type: 'activity', emoji: '⚡', color: '#3B82F6' },
  { type: 'award', emoji: '🏆', color: '#FBBF24' },
];

STATS_CONFIG.map(stat => <StatItem key={stat.type} {...stat} />);
```

---

## 다음 단계

### 구현 예정 기능

1. **직업 체험 화면** (`JobsExploreScreen`)
   - 8개 별 탐험
   - 직업 카드 상세
   - 스와이프 기능

2. **커리어 패스 빌더** (`CareerPathScreen`)
   - 목표 직업 설정
   - 활동/수상/자격증 계획
   - 타임라인 뷰

3. **런치패드** (`LaunchpadScreen`)
   - Q&A 게시판
   - 리크루팅
   - 세션 관리

4. **적성 퀴즈** (`QuizScreen`)
   - 20문항 RIASEC 검사
   - 결과 분석
   - 추천 직업

5. **직업 시뮬레이션** (`SimulationScreen`)
   - 하루 일과 체험
   - 선택지 기반 시나리오
   - XP 보상

### 백엔드 연동 준비

현재는 JSON 파일로 콘텐츠를 관리하고 있으며, 추후 백엔드 개발 시:

```typescript
// API 호출 예시 (추후 구현)
const response = await fetch(`${API_URL}/jobs`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const jobs = await response.json();
```

---

## 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [React Navigation 문서](https://reactnavigation.org/)
- [React Native 문서](https://reactnative.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/)

---

## 문의 및 지원

문제가 발생하거나 질문이 있으면:

1. GitHub Issues 등록
2. Expo 커뮤니티 포럼 검색
3. React Native 공식 Discord 참여

---

## 라이선스

이 프로젝트는 10000 Labs에서 개발되었습니다.
