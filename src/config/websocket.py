from channels.routing import URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

import apps.notifications.routing
from apps.notifications.middlewares import RoomNameValidateUserIdMiddleware
from apps.notifications.middlewares import TokenAuthMiddleware


websocket_application = AllowedHostsOriginValidator(
    TokenAuthMiddleware(
        RoomNameValidateUserIdMiddleware(
            URLRouter(
                apps.notifications.routing.websocket_url_patterns,
            ),
        ),
    ),
)
