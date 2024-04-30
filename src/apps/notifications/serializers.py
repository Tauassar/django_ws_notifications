from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()

class SendNotificationSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='id')
    payload = serializers.JSONField(label="Сообщение для отправки")

    class Meta:
        model = User
        fields = (
            'user_id',
            'payload',
        )

class ErrorDetail(serializers.Serializer):
    detail = serializers.CharField()
