from django.core.management.base import BaseCommand

from apps.notifications.rabbitmq_consumer import SendNotificationListener


class Command(BaseCommand):
    help = 'Launches Listener for user_created message : RaabitMQ'

    def handle(self, *args, **options):
        td = SendNotificationListener()
        td.start()
        td.join()
        self.stdout.write("Started Consumer Thread")
