import json
import logging

import pika
import threading

from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError

from apps.notifications.serializers import SendNotificationSerializer
from apps.notifications.services import notify_user_by_id

ROUTING_KEY = 'notifications.send'
RESULT_ROUTING_KEY = 'notifications.result'
EXCHANGE = 'notifications_exchange'
THREADS = 2
User = get_user_model()

logger = logging.getLogger(__name__)

class SendNotificationListener(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=settings.RABBIT_HOST,
                port=settings.RABBIT_PORT,
            ),
        )
        self.channel = connection.channel()
        self.channel.exchange_declare(exchange=EXCHANGE, exchange_type='direct')
        # self.channel.queue_declare(queue=QUEUE_NAME, auto_delete=False)
        result = self.channel.queue_declare(queue='', exclusive=True)
        queue_name = result.method.queue
        self.channel.queue_bind(queue=queue_name, exchange=EXCHANGE, routing_key=ROUTING_KEY)
        self.channel.basic_qos(prefetch_count=THREADS * 10)
        self.channel.basic_consume(queue=queue_name, on_message_callback=self.callback)

    def callback(self, channel, method, properties, body):
        try:
            serializer = SendNotificationSerializer(data=json.loads(body))
            try:
                serializer.is_valid(raise_exception=True)
            except ValidationError as err:
                channel.basic_publish(
                    exchange=EXCHANGE,
                    routing_key=RESULT_ROUTING_KEY,
                    body=json.dumps({
                        "error": f"Error during payload validation: {str(err)}",
                    }),
                )
                raise

            obj = User.objects.all().get(
                id=serializer.data.get('user_id'),
            )

            notify_user_by_id(obj.id, serializer.data.get("payload"))

            channel.basic_ack(delivery_tag=method.delivery_tag)
            channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=RESULT_ROUTING_KEY,
                body=json.dumps(serializer.data),
            )
        except ObjectDoesNotExist:
            channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=RESULT_ROUTING_KEY,
                body=json.dumps({
                    "error": 'No %s matches the given query.' % User.model._meta.object_name,
                }),
            )
            logger.warning(('No %s matches the given query.' % User.model._meta.object_name), exc_info=True)

        except ValidationError as err:
            channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=RESULT_ROUTING_KEY,
                body=json.dumps({
                    "error": f"Error during payload validation: {str(err)}",
                }),
            )
            logger.warning("Error during payload validation", exc_info=True)

        except Exception as err:
            channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=RESULT_ROUTING_KEY,
                body=json.dumps({
                    "error": str(err),
                }),
            )
            logger.warning("Unknown error", exc_info=True)

    def run(self):
        logger.info('Inside LogginService:  Created Listener ')
        self.channel.start_consuming()