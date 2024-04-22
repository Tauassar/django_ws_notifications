from django.contrib.auth import get_user_model

from rest_framework import generics as drf_generics
from rest_framework import response as drf_response
from rest_framework import authentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


User = get_user_model()


class IsAuthenticatedView(drf_generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [
        authentication.SessionAuthentication,
        JWTAuthentication,
        authentication.TokenAuthentication,
    ]

    def get(self, request, *args, **kwargs):
        return drf_response.Response()
