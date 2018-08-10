import os
import raven
from .env import env


RAVEN_CONFIG = {
    'dsn': env.str('SENTRY_DSN', default=None),
    # If you are using git, you can also automatically configure the
    # release based on the git info.
    'release': raven.fetch_git_sha(os.path.dirname(os.pardir)),
}
