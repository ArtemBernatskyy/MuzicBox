from django.urls import reverse
from rest_framework import status
from parameterized import parameterized
from rest_framework.test import APITestCase

from reactmusic.apps.accounts.tests.factories import UserFactory
from .factories import AudioFactory


# TODO mock external APIs here and make tests fully unittest compatible


class AudioListCreateViewSetTestCase(APITestCase):

    def setUp(self):
        self.url = reverse('audios:audios_list_create')
        self.user = UserFactory()
        self.PERSONAL_AUDIOS_COUNT = 6
        self.PRESENTATION_AUDIOS_COUNT = 4
        AudioFactory.create_batch(self.PRESENTATION_AUDIOS_COUNT, is_presentation=True)
        AudioFactory.create_batch(self.PERSONAL_AUDIOS_COUNT, is_presentation=False, owner=self.user)

    @parameterized.expand([
        (True, ),
        (False, ),
    ])
    def test_list_audios(self, is_anonymous):
        """
            Checking if we can list audios for logged in and logged out users
        """
        if is_anonymous:
            audios_count = self.PRESENTATION_AUDIOS_COUNT
        else:
            audios_count = self.PERSONAL_AUDIOS_COUNT
            self.client.force_authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(response.json()['count'], audios_count)

    @parameterized.expand([
        (True, False),  # is_anonymous, allowed
        (False, True),
    ])
    def test_create_audio_permissions(self, is_anonymous, allowed):
        """
            Checking if we can create audios for logged in and can't for logged out users
        """
        if not is_anonymous:
            self.client.force_authenticate(self.user)
        with open('reactmusic/apps/audios/tests/fixtures/with_id3.mp3', 'rb') as audio_file:
            response = self.client.post(
                self.url,
                data={'audio_file': audio_file},
                format='multipart',
            )
        expected = status.HTTP_201_CREATED if allowed else status.HTTP_403_FORBIDDEN
        self.assertEqual(response.status_code, expected)

    def test_create_fail_audio_without_id3_and_naming(self):
        """
            Checking that we can't create audio which doesn't have both ID3 and correct naming
        """
        self.client.force_authenticate(self.user)
        with open('reactmusic/apps/audios/tests/fixtures/without_id3.mp3', 'rb') as audio_file:
            response = self.client.post(
                self.url,
                data={'audio_file': audio_file},
                format='multipart',
            )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_success_audio_without_id3_but_naming(self):
        """
            Checking that we can't create audio which doesn't have ID3 tags but have correct naming
        """
        self.client.force_authenticate(self.user)
        with open('reactmusic/apps/audios/tests/fixtures/Dan Croll - Swim.mp3', 'rb') as audio_file:
            response = self.client.post(
                self.url,
                data={'audio_file': audio_file},
                format='multipart',
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class AudioDetailViewSetTestCase(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.not_presentation_but_owner_audio = AudioFactory(is_presentation=False, owner=self.user)
        self.not_presentation_not_owner_audio = AudioFactory(is_presentation=False)
        self.presentation_audio = AudioFactory(is_presentation=True)

    @parameterized.expand([
        (True, ),
        (False, ),
    ])
    def test_detail_audio_success(self, is_anonymous):
        """
            Checking is that we can get detailed info about audio for logged in (user is owner)
            and logged out users (audio is in presentation mode)
        """
        if is_anonymous:
            audio_id = self.presentation_audio.id
        else:
            self.client.force_authenticate(self.user)
            audio_id = self.not_presentation_but_owner_audio.id
        url = reverse('audios:audio_detail', kwargs={'pk': str(audio_id)})
        response = self.client.get(url)
        self.assertEqual(status.HTTP_200_OK, response.status_code)

    @parameterized.expand([
        (True, ),
        (False, ),
    ])
    def test_detail_audio_failure(self, is_anonymous):
        """
            Checking is that we can't get detailed info about audio for logged in (user isn't owner)
            and logged out users (audio isn't in presentation mode)
        """
        if not is_anonymous:
            self.client.force_authenticate(self.user)
        audio_id = self.not_presentation_not_owner_audio.id
        url = reverse('audios:audio_detail', kwargs={'pk': str(audio_id)})
        response = self.client.get(url)
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)
