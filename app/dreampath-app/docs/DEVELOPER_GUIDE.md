# DreamPath - 개발자 가이드

## 개발 환경 설정

### 필수 도구 설치

```bash
# Node.js 버전 확인
node --version  # v18+ 필요

# Expo CLI 글로벌 설치 (선택)
npm install -g expo-cli

# Watchman 설치 (Mac, 파일 변경 감지 성능 향상)
brew install watchman
```

### 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone <repository-url>
cd AI-career-path/app/dreampath-app

# 의존성 설치
npm install

# 개발 서버 시작
npm start
```

---

## 프로젝트 아키텍처

### 디렉토리 구조 원칙

```
src/
├── config/          # 설정 파일 (theme, labels)
├── lib/             # 비즈니스 로직 (storage, xp, types)
├── data/            # JSON 콘텐츠 (추후 API로 대체)
├── components/      # 재사용 컴포넌트
│   └── [feature]/  # 기능별 하위 폴더 (예: home/)
├── screens/         # 화면 컴포넌트
├── navigation/      # React Navigation 설정
└── hooks/           # 커스텀 훅 (추후 추가)
```

### 파일 크기 제한

- **400줄 이하**: 하나의 파일은 400줄을 넘지 않도록 분리
- **컴포넌트 분리**: 큰 화면은 섹션별로 컴포넌트 분리
- **예시**: `HomeScreen.tsx` → `home/HeroSection.tsx`, `home/CareerPathSection.tsx` 등

---

## 코딩 컨벤션

### 네이밍 규칙

```typescript
// 컴포넌트: PascalCase
export function HeroSection() {}
export function CareerPathSection() {}

// 함수: camelCase (명확하고 길게)
function getUserProfileFromStorage() {}
function calculateXPProgressForCurrentLevel() {}
function handleCareerPathNavigationButtonPress() {}

// 변수: camelCase (명확하고 길게)
const currentUserNickname = 'Kim';
const savedCareerPathPlans = [];
const totalExperiencePointsEarned = 1000;

// 상수: UPPER_SNAKE_CASE
const RIASEC_META = {};
const HOME_LABELS = {};
const XP_REWARDS = {};

// 타입/인터페이스: PascalCase
interface UserProfile {}
type RIASECType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
```

### TypeScript 원칙

```typescript
// ✅ 모든 함수에 타입 명시
function calculateXP(amount: number, multiplier: number): number {
  return amount * multiplier;
}

// ✅ Props는 interface로 정의
interface HeroSectionProps {
  nickname: string;
  level: LevelDefinition;
  progress: { current: number; max: number; percentage: number };
  onSettings: () => void;
}

// ✅ any 사용 금지 (unknown 또는 구체적 타입 사용)
// ❌ const data: any = await fetch();
// ✅ const data: UserProfile = await fetch();

// ✅ optional chaining & nullish coalescing
const nickname = user?.nickname ?? 'Guest';
const xp = xpLog?.totalXP ?? 0;
```

### 클린 코드 원칙

#### 1. Early Return 패턴

```typescript
// ✅ Good
function processUser(user: UserProfile | null) {
  if (!user) return null;
  if (!user.onboardingCompleted) return null;
  
  return user.nickname;
}

// ❌ Bad
function processUser(user: UserProfile | null) {
  if (user) {
    if (user.onboardingCompleted) {
      return user.nickname;
    }
  }
  return null;
}
```

#### 2. 배열 메서드 활용

```typescript
// ✅ Good
const activePlans = savedPlans.filter(plan => plan.type === 'activity');
const planTitles = savedPlans.map(plan => plan.title);
const totalXP = xpHistory.reduce((sum, entry) => sum + entry.xp, 0);

// ❌ Bad
const activePlans = [];
for (let i = 0; i < savedPlans.length; i++) {
  if (savedPlans[i].type === 'activity') {
    activePlans.push(savedPlans[i]);
  }
}
```

#### 3. 설정 기반 렌더링

```typescript
// ✅ Good - config 파일에서 관리
const STATS_CONFIG = [
  { type: 'activity', emoji: '⚡', color: '#3B82F6', label: '활동' },
  { type: 'award', emoji: '🏆', color: '#FBBF24', label: '수상' },
  { type: 'certification', emoji: '📜', color: '#22C55E', label: '자격증' },
];

STATS_CONFIG.map(stat => (
  <StatItem key={stat.type} {...stat} />
));

// ❌ Bad - 하드코딩
<StatItem type="activity" emoji="⚡" color="#3B82F6" label="활동" />
<StatItem type="award" emoji="🏆" color="#FBBF24" label="수상" />
<StatItem type="certification" emoji="📜" color="#22C55E" label="자격증" />
```

---

## 컴포넌트 작성 가이드

### 컴포넌트 구조 템플릿

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';

interface MyComponentProps {
  title: string;
  description?: string;
  onPress: () => void;
}

export function MyComponent({ title, description, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
```

### StyleSheet 작성 원칙

```typescript
// ✅ config에서 값 가져오기
const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,           // ✅ 16
    borderRadius: BORDER_RADIUS.md, // ✅ 12
    backgroundColor: COLORS.cardBackground,
  },
});

// ❌ 하드코딩
const styles = StyleSheet.create({
  container: {
    padding: 16,                    // ❌
    borderRadius: 12,               // ❌
    backgroundColor: 'rgba(255,255,255,0.04)', // ❌
  },
});
```

### 조건부 렌더링

```typescript
// ✅ Good - Early return
if (!userData) return null;
if (loading) return <LoadingSpinner />;

return <MainContent data={userData} />;

// ✅ Good - 삼항 연산자 (간단한 경우)
{hasPlans ? <PlanList plans={plans} /> : <EmptyState />}

// ✅ Good - && 연산자 (조건부 표시)
{showModal && <Modal />}
{errorMessage && <ErrorText message={errorMessage} />}

// ❌ Bad - 중첩된 삼항 연산자
{loading ? <Spinner /> : error ? <Error /> : data ? <Content /> : <Empty />}
```

---

## 상태 관리

### AsyncStorage 사용 패턴

```typescript
// ✅ Good - storage 래퍼 사용
import { storage } from '../lib/storage';

const user = await storage.user.get();
await storage.user.set(newUser);

// ❌ Bad - 직접 AsyncStorage 호출
import AsyncStorage from '@react-native-async-storage/async-storage';
const user = await AsyncStorage.getItem('user');
```

### useState 패턴

```typescript
// ✅ Good - 명확한 초기값
const [userData, setUserData] = useState<UserProfile | null>(null);
const [currentXP, setCurrentXP] = useState(0);
const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

// ✅ Good - 로딩 상태 분리
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// ❌ Bad - 타입 불명확
const [data, setData] = useState<any>(null);
```

### useEffect 패턴

```typescript
// ✅ Good - 명확한 의존성
useEffect(() => {
  loadUserData();
}, []);

// ✅ Good - cleanup 함수
useEffect(() => {
  const interval = setInterval(updateXP, 1000);
  return () => clearInterval(interval);
}, []);

// ❌ Bad - 의존성 누락 (ESLint 경고)
useEffect(() => {
  processData(userData);
}, []); // userData가 의존성에 없음
```

---

## 네비게이션 가이드

### 화면 이동

```typescript
import { useNavigation } from '@react-navigation/native';

function MyComponent() {
  const navigation = useNavigation<any>();

  // 화면 이동
  navigation.navigate('HomeTab');
  navigation.navigate('CareerTab');

  // 뒤로 가기
  navigation.goBack();

  // 스택 교체 (뒤로 가기 불가)
  navigation.replace('Main');
}
```

### 파라미터 전달

```typescript
// 파라미터와 함께 이동
navigation.navigate('JobDetail', { jobId: 'doctor', starId: 'explore' });

// 파라미터 받기
import { useRoute } from '@react-navigation/native';

function JobDetailScreen() {
  const route = useRoute<any>();
  const { jobId, starId } = route.params;
}
```

---

## 스타일링 가이드

### 그라디언트 사용

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../config/theme';

<LinearGradient
  colors={GRADIENTS.primary}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.gradient}
>
  <Text>Content</Text>
</LinearGradient>
```

### 그림자 효과

```typescript
// iOS
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

// Android
const styles = StyleSheet.create({
  card: {
    elevation: 8,
  },
});

// 통합 (Platform 분기)
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
```

### 반응형 디자인

```typescript
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,  // 화면 너비의 90%
    maxWidth: 430,              // 최대 430px (모바일 기준)
  },
});
```

---

## 데이터 관리

### JSON 데이터 구조

```typescript
// src/data/stars/explore-star.json
{
  "id": "explore",
  "name": "탐구의 별",
  "emoji": "🔬",
  "color": "#4A90D9",
  "jobs": [
    {
      "id": "doctor",
      "name": "의사",
      "icon": "🩺",
      "shortDesc": "생명을 살리는 사람",
      "holland": "I+S",
      "salaryRange": "6,000~20,000만원/년",
      "futureGrowth": 5,
      "aiRisk": "낮음"
    }
  ]
}
```

### 데이터 import

```typescript
// ✅ Good - 타입 캐스팅
import exploreStar from '../data/stars/explore-star.json';
import type { StarData } from '../lib/types';

const star = exploreStar as unknown as StarData;

// ✅ Good - 배열 합치기
const ALL_STARS = [
  exploreStar,
  createStar,
  techStar,
  connectStar,
] as unknown as StarData[];
```

### AsyncStorage 래퍼 확장

```typescript
// src/lib/storage.ts 확장 예시

export const storage = {
  // 기존 메서드들...
  
  // 새 기능 추가
  simulations: {
    getAll: () => getItem<SimulationLog[]>('dreampath_simulations', []),
    add: async (log: SimulationLog) => {
      const logs = await getItem<SimulationLog[]>('dreampath_simulations', []);
      logs.push(log);
      await setItem('dreampath_simulations', logs);
    },
  },
};
```

---

## 새 화면 추가하기

### 1. 화면 컴포넌트 생성

```typescript
// src/screens/QuizScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../config/theme';

export function QuizScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>적성 퀴즈</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
});
```

### 2. 네비게이터에 추가

```typescript
// src/navigation/AppNavigator.tsx
import { QuizScreen } from '../screens/QuizScreen';

<Stack.Screen name="Quiz" component={QuizScreen} />
```

### 3. 화면 이동

```typescript
// 다른 컴포넌트에서
navigation.navigate('Quiz');
```

---

## 새 컴포넌트 추가하기

### 1. 컴포넌트 파일 생성

```typescript
// src/components/BadgeCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/theme';

interface BadgeCardProps {
  badgeId: string;
  name: string;
  emoji: string;
  rarity: 'normal' | 'rare' | 'epic' | 'legend';
}

export function BadgeCard({ name, emoji, rarity }: BadgeCardProps) {
  const rarityColor = RARITY_COLORS[rarity];

  return (
    <View style={[styles.container, { borderColor: rarityColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const RARITY_COLORS: Record<string, string> = {
  normal: COLORS.textMuted,
  rare: COLORS.blue,
  epic: COLORS.purple,
  legend: COLORS.yellow,
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
```

### 2. 컴포넌트 사용

```typescript
import { BadgeCard } from '../components/BadgeCard';

<BadgeCard
  badgeId="first_quiz"
  name="첫 퀴즈 완료"
  emoji="🧩"
  rarity="rare"
/>
```

---

## 애니메이션 가이드

### Animated API 사용

```typescript
import { Animated } from 'react-native';

function AnimatedComponent() {
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text>Fade In</Text>
    </Animated.View>
  );
}
```

### React Native Reanimated (고급)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function ReanimatedComponent() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.2);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Text>Press me</Text>
    </Animated.View>
  );
}
```

---

## 테스트 가이드

### Jest 설정 (추후)

```bash
# Jest 설치
npm install --save-dev jest @testing-library/react-native

# 테스트 실행
npm test
```

### 테스트 작성 예시

```typescript
// __tests__/xp.test.ts
import { getLevelForXP, getXPProgress } from '../src/lib/xp';

describe('XP System', () => {
  test('getLevelForXP returns correct level', () => {
    expect(getLevelForXP(0).level).toBe(1);
    expect(getLevelForXP(300).level).toBe(2);
    expect(getLevelForXP(5500).level).toBe(6);
  });

  test('getXPProgress calculates correctly', () => {
    const progress = getXPProgress(150);
    expect(progress.current).toBe(150);
    expect(progress.max).toBe(299);
    expect(progress.percentage).toBe(50);
  });
});
```

---

## 성능 최적화

### 1. useMemo 활용

```typescript
// ✅ Good - 비싼 계산 메모이제이션
const recommendedJobs = useMemo(() => {
  const allJobs = getAllJobs();
  return allJobs
    .filter(job => matchesRiasec(job, riasec))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}, [riasec]);

// ❌ Bad - 매 렌더링마다 재계산
const recommendedJobs = getAllJobs()
  .filter(job => matchesRiasec(job, riasec))
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
```

### 2. useCallback 활용

```typescript
// ✅ Good - 함수 메모이제이션
const handleJobClick = useCallback((jobId: string) => {
  navigation.navigate('JobDetail', { jobId });
}, [navigation]);

// ❌ Bad - 매 렌더링마다 새 함수 생성
const handleJobClick = (jobId: string) => {
  navigation.navigate('JobDetail', { jobId });
};
```

### 3. FlatList 최적화

```typescript
<FlatList
  data={jobs}
  renderItem={({ item }) => <JobCard job={item} />}
  keyExtractor={(item) => item.id}
  // 성능 최적화
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  // 구분선
  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
/>
```

---

## 디버깅 팁

### 1. Console.log 대신 Debugger 사용

```typescript
// ✅ Good - 조건부 로깅
if (__DEV__) {
  console.log('[HomeScreen] User data:', userData);
}

// ✅ Good - 디버거 중단점
debugger;

// ❌ Bad - 프로덕션에 남은 로그
console.log('User:', user);
```

### 2. React DevTools

```bash
# 개발 서버 실행 중
# 앱에서 Cmd+D (iOS) 또는 Cmd+M (Android)
# "Debug" 선택
# Chrome DevTools 자동 열림
```

### 3. Flipper 활용

- Layout Inspector: UI 계층 구조 확인
- Network Inspector: API 호출 모니터링
- AsyncStorage Inspector: 저장된 데이터 확인
- Logs: 실시간 로그 확인

---

## Git 워크플로우

### 브랜치 전략

```bash
# 기능 개발
git checkout -b feature/quiz-screen
git commit -m "feat: Add quiz screen with 20 questions"
git push origin feature/quiz-screen

# 버그 수정
git checkout -b fix/xp-calculation
git commit -m "fix: Correct XP calculation for level 5"
git push origin fix/xp-calculation
```

### 커밋 메시지 규칙

```
feat: Add new feature
fix: Fix bug
refactor: Refactor code
style: Update styling
docs: Update documentation
test: Add tests
chore: Update dependencies
```

---

## 백엔드 연동 준비

### API 클라이언트 구조 (예시)

```typescript
// src/lib/api.ts
const API_URL = 'https://api.dreampath.com';

export const api = {
  jobs: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/jobs`);
      return response.json();
    },
    getById: async (jobId: string) => {
      const response = await fetch(`${API_URL}/jobs/${jobId}`);
      return response.json();
    },
  },
  user: {
    getProfile: async (userId: string) => {
      const response = await fetch(`${API_URL}/users/${userId}`);
      return response.json();
    },
    updateProfile: async (userId: string, data: Partial<UserProfile>) => {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
};
```

### 데이터 마이그레이션

```typescript
// JSON → API 전환 시
// Before (JSON)
import jobsData from '../data/jobs.json';
const jobs = jobsData;

// After (API)
import { api } from '../lib/api';
const jobs = await api.jobs.getAll();
```

---

## 배포 체크리스트

### 빌드 전 확인사항

- [ ] TypeScript 타입 체크 통과 (`npx tsc --noEmit`)
- [ ] 모든 console.log 제거 또는 `__DEV__` 조건 추가
- [ ] 하드코딩된 API URL 제거 (환경 변수 사용)
- [ ] 민감한 정보 (API 키 등) 제거
- [ ] app.json 버전 업데이트
- [ ] 아이콘 및 스플래시 이미지 준비
- [ ] iOS/Android 권한 설정 확인

### EAS Build 설정

```bash
# eas.json 생성
eas build:configure

# 빌드 프로필 설정
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

---

## 문제 해결

### 자주 발생하는 오류

#### 1. "Unable to resolve module"

```bash
# 해결: 캐시 삭제 및 재시작
npx expo start --clear
```

#### 2. "Invariant Violation: requireNativeComponent"

```bash
# 해결: 네이티브 모듈 재설치
rm -rf node_modules
npm install
npx expo prebuild --clean
```

#### 3. AsyncStorage 오류

```bash
# 해결: 패키지 재설치
npx expo install @react-native-async-storage/async-storage
```

#### 4. Navigation 타입 오류

```typescript
// 해결: 타입 정의 추가
type RootStackParamList = {
  Home: undefined;
  JobDetail: { jobId: string };
};

const navigation = useNavigation<NavigationProp<RootStackParamList>>();
```

---

## 코드 리뷰 체크리스트

### 제출 전 확인

- [ ] TypeScript 타입 체크 통과
- [ ] 파일 크기 400줄 이하
- [ ] 함수/변수명 명확하고 길게 작성
- [ ] config 파일에서 라벨/색상 관리
- [ ] Early return 패턴 사용
- [ ] 배열 메서드 활용 (map, filter, reduce)
- [ ] 주석 없이 코드만으로 이해 가능
- [ ] 하드코딩 제거 (config/data 파일 활용)

### 리뷰 시 확인사항

- 코드 가독성
- 재사용 가능성
- 성능 최적화 (useMemo, useCallback)
- 에러 핸들링
- 타입 안정성
- 일관된 스타일

---

## 유용한 VSCode 확장

### 필수 확장

- **ES7+ React/Redux/React-Native snippets**: 코드 스니펫
- **Prettier**: 코드 포매팅
- **ESLint**: 코드 린팅
- **React Native Tools**: 디버깅
- **TypeScript Import Sorter**: import 정리

### 권장 설정 (settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

---

## 참고 자료

### 공식 문서
- [Expo 문서](https://docs.expo.dev/)
- [React Native 문서](https://reactnative.dev/)
- [React Navigation 문서](https://reactnavigation.org/)
- [TypeScript 문서](https://www.typescriptlang.org/)

### 커뮤니티
- [Expo Discord](https://chat.expo.dev/)
- [React Native Discord](https://discord.gg/react-native)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### 학습 자료
- [React Native Express](https://www.reactnative.express/)
- [Expo Examples](https://github.com/expo/examples)
- [React Navigation Playground](https://reactnavigation.org/docs/getting-started)

---

## 다음 단계

### 구현 우선순위

1. **적성 퀴즈 화면** (QuizScreen)
   - 20문항 질문 UI
   - 선택지 처리
   - 결과 계산 및 저장

2. **직업 탐험 화면** (JobsExploreScreen)
   - 8개 별 그리드
   - 별별 직업 목록
   - 직업 상세 모달

3. **커리어 패스 화면** (CareerPathScreen)
   - 목표 직업 선택
   - 활동/수상/자격증 추가
   - 타임라인 뷰

4. **시뮬레이션 화면** (SimulationScreen)
   - 시나리오 UI
   - 선택지 처리
   - 결과 화면

---

## 기여 가이드

### Pull Request 작성

1. Feature 브랜치 생성
2. 코드 작성 및 테스트
3. TypeScript 타입 체크
4. PR 제출 (템플릿 사용)

### PR 템플릿

```markdown
## 변경 사항
- [ ] 새 기능 추가
- [ ] 버그 수정
- [ ] 리팩토링
- [ ] 문서 업데이트

## 설명
(변경 사항 상세 설명)

## 테스트
- [ ] iOS 시뮬레이터 테스트
- [ ] Android 에뮬레이터 테스트
- [ ] TypeScript 타입 체크 통과

## 스크린샷
(UI 변경 시 스크린샷 첨부)
```

---

## 문의

개발 관련 질문이나 제안은 GitHub Issues에 등록해주세요.

**Happy Coding! 🚀**
