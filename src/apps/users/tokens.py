from rest_framework_simplejwt.tokens import AccessToken


class IdentityToken(AccessToken):
    token_type = "identity"
