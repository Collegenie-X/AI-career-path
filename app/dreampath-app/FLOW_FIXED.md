# ✅ 플로우 수정 완료

## 🎯 올바른 사용자 플로우 (Frontend와 동일)

```
Splash Screen
    ↓
    ├─ user === null → Onboarding (신규 사용자)
    ├─ user 있고 onboardingCompleted: false → QuizIntro (프로필만 생성, 퀴즈 미완료)
    └─ onboardingCompleted: true → Main (모든 과정 완료)
         
Onboarding (프로필 생성)
    ↓
    onboardingCompleted: false 저장
    ↓
QuizIntro (검사 안내)
    ↓
Quiz (30문항)
    ↓
    onboardingCompleted: true 업데이트
    ↓
QuizResults (결과 확인)
    ↓
Main (홈 화면)
```

---

## 🔧 수정 사항

### 1. OnboardingScreen.tsx
**변경**: `onboardingCompleted: true` → `onboardingCompleted: false`

```typescript
// 온보딩에서 프로필 저장 시
await storage.user.set({
  id: `user_${Date.now()}`,
  nickname: nickname.trim(),
  grade: selectedGrade,
  createdAt: new Date().toISOString(),
  onboardingCompleted: false,  // ← 퀴즈를 완료해야 true가 됨
});
```

**이유**: 프로필만 생성했을 뿐, 아직 퀴즈를 완료하지 않았으므로 `false`

---

### 2. AppNavigator.tsx
**추가**: 퀴즈 완료 시 `onboardingCompleted: true` 업데이트

```typescript
onComplete={async (answers) => {
  const result = generateRIASECResultFromQuizAnswers(
    quizQuestionsData as any,
    answers
  );
  await storage.riasec.set(result);
  await storage.xp.add(100, '적성 검사 완료', 'quiz');

  // ← 여기서 onboardingCompleted를 true로 설정
  const currentUser = await storage.user.get();
  if (currentUser) {
    await storage.user.set({
      ...currentUser,
      onboardingCompleted: true,
    });
  }

  props.navigation.replace('QuizResults');
}}
```

**이유**: 퀴즈를 완료해야 비로소 온보딩이 완료된 것으로 간주

---

### 3. SplashScreen.tsx
**추가**: 3가지 상태 분기 처리

```typescript
const user = await storage.user.get();
if (user?.onboardingCompleted) {
  onFinish('home');           // 모든 과정 완료 → 홈
} else if (user && !user.onboardingCompleted) {
  onFinish('quiz');           // 프로필만 생성 → 퀴즈
} else {
  onFinish('onboarding');     // 신규 사용자 → 온보딩
}
```

**이유**: 프로필은 있지만 퀴즈를 완료하지 않은 경우 QuizIntro로 보내야 함

---

## 🎮 사용자 시나리오

### 시나리오 1: 신규 사용자 (처음 설치)
```
1. 앱 실행
2. Splash → Onboarding
3. 닉네임/학년 입력 → QuizIntro
4. 퀴즈 시작 → 30문항 완료 → QuizResults
5. 홈으로 가기 → Main
6. ✅ 다음부터 앱 실행 시 바로 Main으로 이동
```

### 시나리오 2: 온보딩만 완료하고 앱 종료
```
1. 앱 실행
2. Splash → Onboarding
3. 닉네임/학년 입력 → QuizIntro
4. 앱 종료 (퀴즈 안 함)
5. ✅ 다음 실행 시: Splash → QuizIntro (이어서 진행)
```

### 시나리오 3: 퀴즈 중간에 앱 종료
```
1. QuizIntro에서 퀴즈 시작
2. 10문항 답변 후 앱 종료
3. ❌ 현재: 답변 저장 안 됨 (추후 개선 가능)
4. ✅ 다음 실행 시: Splash → QuizIntro (처음부터 다시)
```

---

## 🔍 AsyncStorage 상태별 동작

| AsyncStorage 상태 | 동작 |
|---|---|
| `user === null` | Onboarding |
| `user.onboardingCompleted === false` | QuizIntro |
| `user.onboardingCompleted === true` | Main |

---

## 🛠 개발 중 테스트 방법

### 온보딩 플로우 테스트
```bash
# 1. 앱 삭제
npm run reset:ios

# 2. 앱 실행
npm start
i

# 결과: Splash → Onboarding
```

### 퀴즈 플로우만 테스트
```bash
# 1. 온보딩 완료 (프로필 생성)
# 2. 앱 종료
# 3. 앱 재실행

# 결과: Splash → QuizIntro
```

### 홈 화면 테스트
```bash
# 1. 온보딩 + 퀴즈 모두 완료
# 2. 앱 종료
# 3. 앱 재실행

# 결과: Splash → Main
```

---

## 📦 추가된 패키지

```json
"expo-keep-awake": "~55.0.1"
```

이 패키지는 개발 중 화면이 꺼지지 않도록 하는 Expo 기본 기능입니다.

---

## ✅ 수정 완료 체크리스트

- [x] OnboardingScreen: `onboardingCompleted: false` 저장
- [x] AppNavigator: 퀴즈 완료 시 `onboardingCompleted: true` 업데이트
- [x] SplashScreen: 3가지 상태 분기 처리
- [x] expo-keep-awake 패키지 추가
- [x] TypeScript 에러 없음

---

## 🚀 지금 테스트하기

```bash
# 1. 앱 삭제 (기존 데이터 제거)
npm run reset:ios

# 2. 개발 서버 시작
npm start

# 3. iOS 실행
i

# 4. 플로우 확인
# Splash → Onboarding → QuizIntro → Quiz → QuizResults → Main ✅
```

---

## 💡 Frontend와의 차이점

Frontend (Next.js)와 Expo 앱이 이제 **완전히 동일한 플로우**로 동작합니다:

| 단계 | Frontend | Expo | 동일 여부 |
|---|---|---|---|
| Splash 라우팅 | `router.replace()` | `navigation.replace()` | ✅ |
| 온보딩 완료 판단 | 퀴즈 완료 시 | 퀴즈 완료 시 | ✅ |
| 저장소 | localStorage | AsyncStorage | ✅ (동일 구조) |
| 프로필 저장 | `onboardingCompleted: false` | `onboardingCompleted: false` | ✅ |
| 퀴즈 완료 | `onboardingCompleted: true` | `onboardingCompleted: true` | ✅ |

이제 완벽하게 동작합니다! 🎉
