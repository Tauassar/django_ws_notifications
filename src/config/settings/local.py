import os  # noqa

from .base import *  # noqa
from .base import env


ALLOWED_HOSTS = ['localhost', '0.0.0.0', '127.0.0.1']

if DEBUG:  # noqa F405
    ALLOWED_HOSTS += ['*']


INSTALLED_APPS = ['whitenoise.runserver_nostatic'] + INSTALLED_APPS  # noqa F405


INTERNAL_IPS = ['127.0.0.1']
if env('USE_DOCKER', default='yes') == 'yes':
    import socket

    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS += ['.'.join(ip.split('.')[:-1] + ['1']) for ip in ips]

INSTALLED_APPS += ['django_extensions']  # noqa F405

CELERY_TASK_EAGER_PROPAGATES = True

REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'apps.notifications.channel_layers'
                   '.RedisChannelLayerGroupPersistence',
        'CONFIG': {
            'hosts': [REDIS_URL],
        },
    },
}
