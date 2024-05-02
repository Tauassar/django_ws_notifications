import logging

from django.contrib.auth import get_user_model
from rest_framework_simplejwt import serializers as simplejwt_serializers

from .tokens import IdentityToken


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

        identity = IdentityToken()
        refresh = self.get_token(self.user)

        identity.set_exp(from_time=refresh.current_time)
        no_copy = refresh.no_copy_claims

        for claim, value in refresh.payload.items():
            if claim in no_copy:
                continue
            identity[claim] = value

        attrs['identity'] = str(identity)
        return attrs


class TokenRefreshSerializer(
    simplejwt_serializers.TokenRefreshSerializer,
):
    def validate(self, attrs):
        refresh = self.token_class(attrs['refresh'])
        attrs = super().validate(attrs)

        identity = IdentityToken()

        identity.set_exp(from_time=refresh.current_time)
        no_copy = refresh.no_copy_claims

        for claim, value in refresh.payload.items():
            if claim in no_copy:
                continue
            identity[claim] = value

        attrs['identity'] = str(identity)
        return attrs
