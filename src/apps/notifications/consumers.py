import json
import logging
import time
from datetime import datetime, timedelta
from typing import Optional

from apscheduler.job import Job
from apscheduler.jobstores.base import JobLookupError
from apscheduler.triggers.date import DateTrigger
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from websockets.exceptions import ConnectionClosed


logger = logging.getLogger(__name__)


class NotificationsConsumer(AsyncJsonWebsocketConsumer):
    expiration_task: Optional[Job]

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.room_name = None

    async def expire_connection(self):
        try:
            await self.websocket_disconnect({'code': 1000})
        except StopConsumer:
            await self.close()

    async def connect(self):
        user = self.scope["user"]
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'notifications_%s' % self.room_name

        # Join room group
        await self.channel_layer.join_notifications_list(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        logger.debug(
            f'Client connected to notification channel,'
            f'\nroom name: {self.room_name}'
            f'\ngroup_name: {self.room_group_name}',
        )

        self.expiration_task = self.scope["scheduler"].add_job(
            self.expire_connection,
            trigger=DateTrigger(
                run_date=(
                    datetime.now(self.scope["scheduler"].timezone)
                    + timedelta(seconds=user.expires_at - time.time())
                ),
            ),
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # in case of unexpected channel closure (if a client closes connection)
        try:
            self.expiration_task.remove()
        except JobLookupError:
            # if job already running .remove method raising JobLookupError, therefore we can disregard it
            ...

    async def send_message_processing_error(self, message: str):
        try:
            await self.send(
                text_data=json.dumps(
                    {
                        'type': 'message_processing_error',
                        'value': message,
                    },
                ),
            )
        except ConnectionClosed:
            logger.warning(
                'Channel already disconnected, cannot send message processing error',
            )

    async def command_ping(self):
        try:
            await self.send(
                text_data=json.dumps(
                    {
                        'type': 'command_processing_result',
                        'key': 'ping',
                        'value': 'pong',
                    },
                ),
            )
        except ConnectionClosed:
            logger.warning('Channel already disconnected, cannot send pong message')

    # Receive message from WebSocket
    async def receive_json(self, content, **kwargs):
        message_type = content['type']
        if message_type == 'message_ack':
            # Message handling logic
            value_key = content['key']
            await self.channel_layer.acknowledge_message(
                self.room_group_name,
                value_key,
            )
            logger.info(
                f'Notification with key: {content["key"]} acknowledged',
            )
        elif message_type == 'command':
            # Command handling logic
            value_key = content['key']
            handler_name = f'command_{value_key}'

            if hasattr(self, handler_name):
                command = getattr(self, handler_name)
                await command()
            else:
                await self.send_message_processing_error(
                    f'Could not recognize command {value_key}',
                )

            await self.channel_layer.acknowledge_message(
                self.room_group_name,
                value_key,
            )
            logger.info(
                f'Notification with key: {content["key"]} acknowledged',
            )
        else:
            # Default response for unmatched message type
            await self.send_message_processing_error(
                f'Unknown message type {message_type == "command"}',
            )

    # Receive message from room group
    async def server_notification(self, event):
        value = event['value']
        key = event['key']
        # Send message to WebSocket
        logger.info(event)
        try:
            await self.send(text_data=json.dumps(event))
        except ConnectionClosed:
            logger.warning(
                'Channel already disconnected, cannot send server notification message',
            )
        logger.debug(f'Sent notification with key: {key} value: {value}')
