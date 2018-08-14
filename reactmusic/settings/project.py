from .env import env

# Audio API Settings
AUDIO_PAGE_SIZE = 50
AUDIO_MAX_PAGE_SIZE = 50

# Artists API Settings
ARTISTS_PAGE_SIZE = 36
ARTISTS_MAX_PAGE_SIZE = 36

# Audio random querysets caching
AUDIO_CACHING_TIMEOUT = 60 * 60 * 4    # 4 hours

LAST_FM_KEY = env.str('LAST_FM_KEY')

SOCIAL_AUTH_FACEBOOK_KEY = env.str('SOCIAL_AUTH_FACEBOOK_KEY', default=None)  # App ID
SOCIAL_AUTH_FACEBOOK_SECRET = env.str('SOCIAL_AUTH_FACEBOOK_SECRET', default=None)  # App Secret
