import factory

from reactmusic.apps.accounts.models import User


class UserFactory(factory.django.DjangoModelFactory):
    username = factory.Sequence(lambda n: 'user{0}@example.com'.format(n))
    email = factory.Sequence(lambda n: 'user_email{0}@example.com'.format(n))
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')

    class Meta:
        model = User
