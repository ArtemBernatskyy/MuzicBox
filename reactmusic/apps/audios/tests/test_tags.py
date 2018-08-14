from django.urls import reverse
from rest_framework import status
from parameterized import parameterized
from rest_framework.test import APITestCase

from reactmusic.apps.accounts.tests.factories import UserFactory
from .factories import AudioFactory, TagFactory


class TagModelViewSetTestCase(APITestCase):

    def setUp(self):
        self.url = reverse('audios:tags_list')
        self.user = UserFactory()
        self.PERSONAL_TAGS_COUNT = 4
        self.PRESENTATION_TAGS_COUNT = 6
        user_tags = TagFactory.create_batch(self.PERSONAL_TAGS_COUNT)
        presentation_tags = TagFactory.create_batch(self.PRESENTATION_TAGS_COUNT)
        AudioFactory.create_batch(12, is_presentation=True, tags=user_tags)
        AudioFactory.create_batch(12, is_presentation=False, owner=self.user, tags=presentation_tags)

    @parameterized.expand([
        (True, ),
        (False, ),
    ])
    def test_list_tags(self, is_anonymous):
        """
            Checking if we can list tags for logged in and logged out users
        """
        if is_anonymous:
            tags_count = self.PERSONAL_TAGS_COUNT
        else:
            self.client.force_authenticate(self.user)
            tags_count = self.PRESENTATION_TAGS_COUNT
        response = self.client.get(self.url)
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(len(response.json()), tags_count)
