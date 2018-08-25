from django.urls import reverse
from rest_framework import status
from parameterized import parameterized
from rest_framework.test import APITestCase

from muzicbox.apps.accounts.tests.factories import UserFactory
from .factories import AudioFactory, TagFactory


class TagModelViewSetTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse('audios:tags_list')
        cls.user = UserFactory()
        cls.PERSONAL_TAGS_COUNT = 2
        cls.PRESENTATION_TAGS_COUNT = 3
        user_tags = TagFactory.create_batch(cls.PERSONAL_TAGS_COUNT)
        presentation_tags = TagFactory.create_batch(cls.PRESENTATION_TAGS_COUNT)
        AudioFactory.create_batch(3, is_presentation=True, tags=user_tags)
        AudioFactory.create_batch(3, is_presentation=False, owner=cls.user, tags=presentation_tags)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        AudioFactory.tear_down_files()

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
