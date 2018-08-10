import os
import stat
import string

from django.utils.crypto import get_random_string

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SECRET_KEY_FILE = os.path.join(SCRIPT_DIR, 'secret_key.txt')
SECRET_KEY_LENGTH = 70


def get_secret_key():
    """
    Try to read SECRET_KEY from file first. If the file does not exist,
    generate the new SECRET_KEY value, and write it to the file.
    """
    if os.path.isfile(SECRET_KEY_FILE):
        secret_key = open(SECRET_KEY_FILE).read().strip()
        assert len(secret_key) >= SECRET_KEY_LENGTH, \
               'SECRET_KEY is too short, minimum length: %s' % SECRET_KEY_LENGTH
    else:
        # Generate new SECRET_KEY
        print('Generating new SECRET_KEY...')
        chars = (
            string.ascii_letters +
            string.digits +
            string.punctuation.translate('"\'`\\/')
        )
        secret_key = get_random_string(SECRET_KEY_LENGTH, chars)

        # Write to the file
        with open(SECRET_KEY_FILE, 'w') as secret_fh:
            secret_fh.write(secret_key + "\n")

        # Adjust file permissions: remove all 'others' permissions
        # See http://stackoverflow.com/a/25988623/1181370
        current_mode = stat.S_IMODE(os.lstat(SECRET_KEY_FILE).st_mode)
        os.chmod(SECRET_KEY_FILE, current_mode & ~stat.S_IRWXO)

    return secret_key
