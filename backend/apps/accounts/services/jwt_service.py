"""
JWT token generation and validation service
"""

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTService:
    """
    Service class for JWT token operations
    """
    
    @staticmethod
    def generate_tokens_for_user(user: User) -> dict:
        """
        Generate access and refresh tokens for a user
        """
        refresh = RefreshToken.for_user(user)
        
        return {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> dict:
        """
        Generate new access token from refresh token
        """
        try:
            refresh = RefreshToken(refresh_token)
            
            return {
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }
        except Exception as e:
            raise ValueError(f'Invalid refresh token: {str(e)}')
    
    @staticmethod
    def blacklist_token(refresh_token: str) -> None:
        """
        Blacklist a refresh token (logout)
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            raise ValueError(f'Failed to blacklist token: {str(e)}')
