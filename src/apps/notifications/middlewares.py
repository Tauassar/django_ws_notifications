import logging
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.middleware import BaseMiddleware
from channels.security.websocket import WebsocketDenier
from django.db import close_old_connections
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.exceptions import TokenError

from apps.users.tokens import IdentityToken


logger = logging.getLogger(__name__)


class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom token JWT auth middleware
    """

    async def __call__(self, scope, receive, send):

        # Close old database connections to prevent usage of timed out connections
        close_old_connections()

        # Get the token
        try:
            token = parse_qs(scope['query_string'].decode('utf8'))['token'][0]
        except (AttributeError, IndexError):
            # Deny the connection
            denier = WebsocketDenier()
            return await denier(scope, receive, send)

        # Try to authenticate the user
        try:
            # This will automatically validate the token and raise an error if token is invalid
            jwt_auth = JWTAuthentication()

            try:
                validated_token = IdentityToken(token)
            except TokenError as e:
                raise TokenError(
                    {
                        'token_class': IdentityToken.__name__,
                        'token_type': IdentityToken.token_type,
                        'message': e.args[0],
                    },
                ) from e

            user = await sync_to_async(
                jwt_auth.get_user,
            )(validated_token)
            user.expires_at = validated_token.get('exp')

        except (InvalidToken, TokenError, AuthenticationFailed) as e:
            # Token is invalid
            logger.warning(e)
            # Deny the connection
            denier = WebsocketDenier()
            return await denier(scope, receive, send)
        else:
            logger.warning(f'User {user} authorized using JWT to use channels notifications')

        return await self.inner(dict(scope, user=user), receive, send)


class RoomNameValidateUserIdMiddleware(BaseMiddleware):
    """
    Custom token JWT auth middleware
    """

    async def __call__(self, scope, receive, send):

        # Close old database connections to prevent usage of timed out connections
        close_old_connections()

        # Get the token
        try:
            url_path = scope['path']
            user_id = int(
                list(
                    filter(lambda item: item.isdigit(), filter(len, url_path.split('/'))),
                )[0],
            )
        except (AttributeError, IndexError):
            # Deny the connection
            denier = WebsocketDenier()
            return await denier(scope, receive, send)

        # Try to autorize the user
        aut_res = scope['user'].id == user_id
        logger.info(f"{scope['user'].id = } {type(scope['user'].id)}")
        logger.info(f'{user_id = } {type(user_id)}')

        if aut_res:
            return await self.inner(scope, receive, send)
        else:
            logger.warning(
                f'User id {scope["user"].id} does not satisfy '
                f'required user id {user_id} {aut_res}'
                ' to connect to requested channel',
            )
            # Deny the connection
            denier = WebsocketDenier()
            return await denier(scope, receive, send)
