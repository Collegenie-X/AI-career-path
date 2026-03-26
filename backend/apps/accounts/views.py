"""
Views for authentication and user profile management
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from rest_framework import serializers as drf_serializers

from .serializers import (
    UserSerializer,
    UserProfileUpdateSerializer,
    SocialLoginRequestSerializer,
    SocialLoginResponseSerializer,
    TokenRefreshRequestSerializer,
    TokenRefreshResponseSerializer,
)
from .services.social_auth_service import SocialAuthService
from .services.jwt_service import JWTService
from common.exceptions import ServiceException

User = get_user_model()


@extend_schema(
    tags=['Authentication'],
    request=SocialLoginRequestSerializer,
    responses={
        200: SocialLoginResponseSerializer,
        400: OpenApiResponse(description='Invalid request'),
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def social_login_view(request):
    """
    Social login endpoint (Google, Kakao, Naver)
    """
    serializer = SocialLoginRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    provider = serializer.validated_data['provider']
    code = serializer.validated_data['code']
    
    try:
        if provider == 'google':
            user_info = SocialAuthService.get_google_user_info(code)
        elif provider == 'kakao':
            user_info = SocialAuthService.get_kakao_user_info(code)
        elif provider == 'naver':
            user_info = SocialAuthService.get_naver_user_info(code)
        else:
            return Response(
                {'error': 'Invalid provider'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user, created = User.objects.get_or_create(
            email=user_info['email'],
            defaults={
                'name': user_info['name'],
                'social_provider': provider,
                'social_uid': user_info['social_uid'],
                'profile_image_url': user_info.get('profile_image_url', ''),
            }
        )
        
        if not created:
            user.social_provider = provider
            user.social_uid = user_info['social_uid']
            user.profile_image_url = user_info.get('profile_image_url', user.profile_image_url)
            user.save()
        
        tokens = JWTService.generate_tokens_for_user(user)
        
        return Response({
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'user': UserSerializer(user).data,
            'is_new_user': created,
        }, status=status.HTTP_200_OK)
    
    except ServiceException as e:
        return Response(
            {'error': str(e)},
            status=e.status_code
        )


@extend_schema(
    tags=['Authentication'],
    request=TokenRefreshRequestSerializer,
    responses={200: TokenRefreshResponseSerializer}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh_view(request):
    """
    Refresh JWT access token
    """
    serializer = TokenRefreshRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        tokens = JWTService.refresh_access_token(
            serializer.validated_data['refresh_token']
        )
        return Response(tokens, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@extend_schema(
    tags=['Authentication'],
    request=inline_serializer(
        name='LogoutRequest',
        fields={
            'refresh_token': drf_serializers.CharField(help_text='블랙리스트할 refresh_token'),
        },
    ),
    responses={200: OpenApiResponse(description='Logout successful')}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user by blacklisting refresh token
    """
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        JWTService.blacklist_token(refresh_token)
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete user profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer
    
    @extend_schema(
        tags=['Authentication'],
        responses={200: UserSerializer}
    )
    def get(self, request, *args, **kwargs):
        """Get current user profile"""
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Authentication'],
        request=UserProfileUpdateSerializer,
        responses={200: UserSerializer}
    )
    def patch(self, request, *args, **kwargs):
        """Update user profile"""
        return super().patch(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Authentication'],
        responses={204: OpenApiResponse(description='User deleted')}
    )
    def delete(self, request, *args, **kwargs):
        """Delete user account"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(
            {'message': 'Account deactivated successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
