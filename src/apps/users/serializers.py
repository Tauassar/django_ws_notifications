import logging

from django.contrib.auth import get_user_model
from rest_framework_simplejwt import serializers as simplejwt_serializers

User = get_user_model()
logger = logging.getLogger(__name__)


class TokenObtainPairWithRoleSerializer(
    simplejwt_serializers.TokenObtainPairSerializer,
):
    @classmethod
    def get_token(cls, user: 'User', otp_verified: bool = False):
        token = super().get_token(user)
        return token

    def validate(self, attrs):
        attrs = super().validate(attrs)
        return attrs
