import random
import factory

from reactmusic.apps.artists.models import Artist


class ArtistFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: 'artist{0}'.format(n))
    mbid = factory.Faker('uuid4')
    playcount = factory.Faker('random_int', min=100, max=100000)
    content = factory.Faker('paragraph')

    class Meta:
        model = Artist

    @factory.post_generation
    def tags(self, create, extracted, **kwargs):
        if extracted:
            for tag in extracted:
                self.tags.add(tag)
        elif create:
            from reactmusic.apps.audios.tests.factories import TagFactory
            factory_tags = TagFactory.create_batch(random.randint(1, 3))
            for tag in factory_tags:
                self.tags.add(tag)
