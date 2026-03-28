#!/usr/bin/env python3
"""
JWT 테스트 토큰 생성 스크립트

Usage:
    cd backend
    source venv/bin/activate
    python3 generate_test_token.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework_simplejwt.tokens import AccessToken
from apps.accounts.models import User


def main():
    # 테스트 유저 생성 또는 조회
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'name': '테스트 유저',
            'emoji': '🧪',
            'grade': 'high_1',
        }
    )

    # 스크립트로만 만든 계정은 비밀번호가 없을 수 있음 — 로그인 페이지 안내와 맞춤
    user.set_password('password123')
    user.save(update_fields=['password'])

    if created:
        print(f"\n✅ 새 테스트 유저 생성됨: {user.name} ({user.email})")
    else:
        print(f"\n✅ 기존 테스트 유저 사용: {user.name} ({user.email})")
        print("   (비밀번호를 password123 으로 맞춰 두었습니다.)")
    
    # JWT 토큰 생성
    token = AccessToken.for_user(user)
    token_str = str(token)
    
    print(f"\n{'='*70}")
    print(f"JWT Access Token:")
    print(f"{'='*70}")
    print(token_str)
    print(f"{'='*70}\n")
    
    print("브라우저 콘솔에서 실행하세요:")
    print(f"{'='*70}")
    print(f"localStorage.setItem('dreampath_access_token', '{token_str}');")
    print(f"location.reload();")
    print(f"{'='*70}\n")
    
    print("또는 Postman 환경 변수에 설정:")
    print(f"{'='*70}")
    print(f"access_token = {token_str}")
    print(f"{'='*70}\n")


if __name__ == '__main__':
    main()
