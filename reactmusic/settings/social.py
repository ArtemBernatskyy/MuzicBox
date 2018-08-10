from .env import env

LAST_FM_KEY = env.str('LAST_FM_KEY', default=None)


SOCIAL_AUTH_FACEBOOK_KEY = env.str('SOCIAL_AUTH_FACEBOOK_KEY', default=None)  # App ID
SOCIAL_AUTH_FACEBOOK_SECRET = env.str('SOCIAL_AUTH_FACEBOOK_SECRET', default=None)  # App Secret
