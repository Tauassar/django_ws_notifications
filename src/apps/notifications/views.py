import logging

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.shortcuts import render
from drf_spectacular.utils import OpenApiResponse
from drf_spectacular.utils import extend_schema
from drf_spectacular.utils import extend_schema_view
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response

from . import serializers
from .services import notify_user_by_id


logger = logging.getLogger(__name__)


@extend_schema_view(
    post=extend_schema(
        responses={
            200: OpenApiResponse(
                response=serializers.SendNotificationSerializer,
            ),
            404: OpenApiResponse(
                response=serializers.ErrorDetail,
            ),
        },
    ),
)
class SendNotificationView(GenericAPIView):
    serializer_class = serializers.SendNotificationSerializer
    queryset = get_user_model().objects.all()

    def post(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = get_object_or_404(
            self.get_queryset(),
            **{
                'id': serializer.data.get('user_id'),
            },
        )

        notify_user_by_id(obj.id, serializer.data.get('payload'))
        return Response(serializer.data, status=status.HTTP_200_OK)


def room(request):
    return render(request, 'notifications/room.html', {})
