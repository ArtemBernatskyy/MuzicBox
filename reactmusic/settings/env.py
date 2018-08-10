import environ

env = environ.Env(DEBUG=(bool, False),)
env.read_env('environment')
