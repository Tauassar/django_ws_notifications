import datetime
import hashlib
import json
import typing
import uuid

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction


def notify_user(chat_room: str, message: dict) -> None:
    channel_layer = get_channel_layer()
    transaction.on_commit(
        lambda: async_to_sync(channel_layer.publish_server_notification)(chat_room, {
            'type': 'server_notification',
            'key': str(hashlib.sha256(str(message).encode('utf-8')).hexdigest()),
            'value': message,
        }),
    )


def notify_user_by_id(iin: str, message: dict) -> None:
    notify_user(f'notifications_{iin}', message)
