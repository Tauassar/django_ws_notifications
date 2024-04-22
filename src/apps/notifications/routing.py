from django.urls import re_path

from .consumers import NotificationsConsumer


websocket_url_patterns = [
    re_path(
        r'ws/notifications/(?P<room_name>\w+)/$',
        NotificationsConsumer.as_asgi(),
        name='notification-room',
    ),
]
