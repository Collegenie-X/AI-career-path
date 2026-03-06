#!/bin/bash

# DreamPath 앱 완전 리셋 스크립트

echo "🧹 DreamPath 앱 데이터 완전 삭제 중..."

# iOS 시뮬레이터 앱 데이터 삭제
echo "📱 iOS 시뮬레이터 앱 삭제 중..."
xcrun simctl uninstall booted com.dreampath.app 2>/dev/null || echo "iOS 앱이 설치되어 있지 않거나 시뮬레이터가 실행 중이 아닙니다."

# Android 에뮬레이터 앱 데이터 삭제
echo "🤖 Android 에뮬레이터 앱 데이터 삭제 중..."
adb shell pm clear com.dreampath.app 2>/dev/null || echo "Android 에뮬레이터가 실행 중이 아니거나 앱이 설치되어 있지 않습니다."

# Metro 번들러 캐시 삭제
echo "🗑️  Metro 캐시 삭제 중..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-map-* 2>/dev/null

# node_modules/.cache 삭제
echo "📦 node_modules 캐시 삭제 중..."
rm -rf node_modules/.cache 2>/dev/null

echo ""
echo "✅ 완료! 이제 다음 명령어로 앱을 실행하세요:"
echo ""
echo "   npm start"
echo ""
echo "그 다음 'i' (iOS) 또는 'a' (Android)를 눌러 앱을 실행하세요."
echo ""
