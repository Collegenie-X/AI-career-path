# DreamPath - 진로 탐색 앱

React Native (Expo) 기반 진로 탐색 모바일 앱

## 🚀 빠른 시작

```bash
cd app/dreampath-app
npm install
npm start
```

그 다음 터미널에서:
- `i` - iOS 시뮬레이터 실행
- `a` - Android 에뮬레이터 실행
- `w` - 웹 브라우저 실행

## 🔄 온보딩 화면으로 돌아가기

앱이 홈 화면으로 바로 넘어가나요?

### 가장 빠른 방법:
1. **iOS 시뮬레이터에서 DreamPath 앱 아이콘 길게 누르기**
2. **앱 삭제**
3. 터미널에서 `i` 입력 → 앱 재설치 및 실행

### 터미널 명령어:
```bash
npm run reset:ios    # iOS 앱 삭제
npm start            # 개발 서버 시작
i                    # iOS 실행
```

📖 자세한 내용: [RESET_ONBOARDING_NOW.md](./RESET_ONBOARDING_NOW.md)

## 📚 문서

- [RESET_ONBOARDING_NOW.md](./RESET_ONBOARDING_NOW.md) - 온보딩 리셋 가이드 ⭐
- [EXPO_SHORTCUTS.md](./docs/EXPO_SHORTCUTS.md) - Expo 키보드 단축키
- [README.md](./docs/README.md) - 전체 앱 문서
- [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) - 개발자 가이드

## 🛠 개발자 메뉴

스플래시 화면에서 우상단 🛠 아이콘 클릭:
- 📊 저장된 데이터 확인
- 🔄 온보딩 리셋
- 🗑️ 전체 데이터 삭제

## 🎯 주요 기능

- ✨ 스플래시 & 온보딩
- 🧠 RIASEC 적성 검사 (30문항)
- 🏠 홈 화면 (레벨, XP, 미션)
- 🔭 직업 탐색
- 🎯 커리어 패스
- 🚀 런치패드

## 📱 스크린 구조

```
Splash → Onboarding → QuizIntro → Quiz → QuizResults → Main
                                                          ├─ Home
                                                          ├─ Jobs
                                                          ├─ Career
                                                          └─ Launchpad
```

## 🔧 유용한 명령어

```bash
npm start              # 개발 서버 시작
npm start:fresh        # 캐시 클리어하고 시작
npm run reset:ios      # iOS 앱 삭제
npm run reset:android  # Android 앱 데이터 삭제
```

## 💡 개발 팁

### 온보딩 플로우 테스트
1. 시뮬레이터에서 앱 삭제
2. `npm start` → `i`

### 퀴즈 플로우 테스트
1. 온보딩 완료
2. 개발자 메뉴 → 온보딩 리셋
3. 앱 재시작

### 캐시 문제 해결
```bash
# 터미널에서 개발 서버 실행 중
c  # 캐시 클리어
r  # 새로고침
```

## 🎨 디자인 시스템

- **배경색**: `#0E0E1C` (매우 어두운 네이비)
- **별 파티클**: 흰색 1-2px 점들
- **카드**: 영역별 색상 테마
  - 성격 🧠: `#6C5CE7` (보라)
  - 흥미 ❤️: `#E74C3C` (빨강)
  - 강점 💪: `#27AE60` (초록)
  - 가치관 🌈: `#F39C12` (주황)
  - 학습 📚: `#3498DB` (파랑)

## 🏗 프로젝트 구조

```
src/
├── components/        # 재사용 가능한 컴포넌트
├── screens/          # 화면 컴포넌트
├── navigation/       # 네비게이션 설정
├── config/           # 설정 (테마, 라벨)
├── data/             # JSON 데이터
├── lib/              # 유틸리티 (storage, types, xp, riasec)
└── assets/           # 이미지, 아이콘
```

## 📦 주요 의존성

- React Native 0.83.2
- Expo ~55.0.5
- React Navigation 7.x
- AsyncStorage 2.2.0
- TypeScript 5.9.2

## ⚠️ 주의사항

1. **앱 재시작**: 개발자 메뉴에서 리셋 후 앱을 완전히 종료하고 재실행
2. **캐시 클리어**: `--clear`는 Metro 캐시만 지우고 AsyncStorage는 유지됨
3. **앱 삭제**: 가장 확실한 리셋 방법은 시뮬레이터에서 앱 삭제

## 🤝 기여

이 프로젝트는 Next.js 웹 앱을 Expo로 마이그레이션한 것입니다.

---

Made with ❤️ for career exploration
