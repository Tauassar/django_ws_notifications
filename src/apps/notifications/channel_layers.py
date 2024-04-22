import json

from channels.exceptions import ChannelFull
from channels_redis.core import RedisChannelLayer


class RedisChannelLayerGroupPersistence(RedisChannelLayer):

    async def publish_server_notification(self, group, payload):
        async with self.connection(self.consistent_hash(group)) as connection:
            await connection.hset(
                f'{group}_pers',
                payload['key'],
                json.dumps(payload),
            )
        await self.group_send(group, payload)

    async def join_notifications_list(
        self,
        group,
        channel,
    ):
        await self.group_add(group, channel)
        await self.send_pending_messages(
            group,
            channel,
        )

    async def send_pending_messages(
        self,
        group,
        channel,
    ):
        async with self.connection(self.consistent_hash(group)) as connection:
            messages = await connection.hgetall(f'{group}_pers')

            for message_id in messages:
                try:
                    await self.send(channel, json.loads(messages[message_id].decode('utf-8')))
                except ChannelFull:
                    pass

    async def acknowledge_message(self, group, key):
        async with self.connection(self.consistent_hash(group)) as connection:
            await connection.hdel(f'{group}_pers', key)
