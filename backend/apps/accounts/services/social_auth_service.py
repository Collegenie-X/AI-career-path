"""
Social authentication service for Google, Kakao, Naver
"""

import requests
from django.conf import settings
from common.exceptions import ServiceException
from rest_framework import status


class SocialAuthService:
    """
    Service class for handling social authentication
    """
    
    @staticmethod
    def get_google_user_info(code: str) -> dict:
        """
        Exchange Google authorization code for user info
        """
        token_url = 'https://oauth2.googleapis.com/token'
        user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        
        token_data = {
            'code': code,
            'client_id': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            'client_secret': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
            'redirect_uri': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
        
        try:
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            access_token = token_response.json()['access_token']
            
            user_info_response = requests.get(
                user_info_url,
                headers={'Authorization': f'Bearer {access_token}'}
            )
            user_info_response.raise_for_status()
            user_info = user_info_response.json()
            
            return {
                'email': user_info['email'],
                'name': user_info.get('name', ''),
                'social_uid': user_info['id'],
                'profile_image_url': user_info.get('picture', ''),
            }
        except requests.RequestException as e:
            raise ServiceException(
                f'Google authentication failed: {str(e)}',
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    @staticmethod
    def get_kakao_user_info(code: str) -> dict:
        """
        Exchange Kakao authorization code for user info
        """
        token_url = 'https://kauth.kakao.com/oauth/token'
        user_info_url = 'https://kapi.kakao.com/v2/user/me'
        
        token_data = {
            'code': code,
            'client_id': settings.SOCIAL_AUTH_KAKAO_KEY,
            'client_secret': settings.SOCIAL_AUTH_KAKAO_SECRET,
            'redirect_uri': settings.SOCIAL_AUTH_KAKAO_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
        
        try:
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            access_token = token_response.json()['access_token']
            
            user_info_response = requests.get(
                user_info_url,
                headers={'Authorization': f'Bearer {access_token}'}
            )
            user_info_response.raise_for_status()
            user_info = user_info_response.json()
            
            kakao_account = user_info.get('kakao_account', {})
            profile = kakao_account.get('profile', {})
            
            return {
                'email': kakao_account.get('email', ''),
                'name': profile.get('nickname', ''),
                'social_uid': str(user_info['id']),
                'profile_image_url': profile.get('profile_image_url', ''),
            }
        except requests.RequestException as e:
            raise ServiceException(
                f'Kakao authentication failed: {str(e)}',
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    @staticmethod
    def get_naver_user_info(code: str) -> dict:
        """
        Exchange Naver authorization code for user info
        """
        token_url = 'https://nid.naver.com/oauth2.0/token'
        user_info_url = 'https://openapi.naver.com/v1/nid/me'
        
        token_data = {
            'code': code,
            'client_id': settings.SOCIAL_AUTH_NAVER_KEY,
            'client_secret': settings.SOCIAL_AUTH_NAVER_SECRET,
            'redirect_uri': settings.SOCIAL_AUTH_NAVER_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
        
        try:
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            access_token = token_response.json()['access_token']
            
            user_info_response = requests.get(
                user_info_url,
                headers={'Authorization': f'Bearer {access_token}'}
            )
            user_info_response.raise_for_status()
            user_info = user_info_response.json()
            
            response = user_info.get('response', {})
            
            return {
                'email': response.get('email', ''),
                'name': response.get('name', ''),
                'social_uid': response.get('id', ''),
                'profile_image_url': response.get('profile_image', ''),
            }
        except requests.RequestException as e:
            raise ServiceException(
                f'Naver authentication failed: {str(e)}',
                status_code=status.HTTP_400_BAD_REQUEST
            )
