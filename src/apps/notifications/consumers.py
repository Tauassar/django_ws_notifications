import json
import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer


logger = logging.getLogger(__name__)


class NotificationsConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.room_name = None

    async def connect(self):
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

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    # Receive message from WebSocket
    async def receive_json(self, content, **kwargs):
        message_type = content['type']
        if message_type == 'message_ack':
            value_key = content['key']
            await self.channel_layer.acknowledge_message(
                self.room_group_name,
                value_key,
            )
            logger.info(
                f'Notification with key: {content["key"]} acknowledged',
            )

    # Receive message from room group
    async def server_notification(self, event):
        value = event['value']
        key = event['key']
        # Send message to WebSocket
        logger.info(event)
        await self.send(text_data=json.dumps(event))
        logger.debug(f'Sent notification with key: {key} value: {value}')

    async def step_status(self, event):
        # Send message to WebSocket
        logger.info(event)
        await self.send(text_data=json.dumps(event))
