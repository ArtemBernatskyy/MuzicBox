import mock
from datetime import datetime
from django.urls import reverse
from rest_framework import status
from django.core.cache import cache
from parameterized import parameterized
from rest_framework.test import APITestCase

from muzicbox.apps.audios.models import Audio
from muzicbox.apps.accounts.tests.factories import UserFactory
from muzicbox.apps.artists.tests.factories import ArtistFactory
from .factories import AudioFactory, TagFactory


class AudioListCreateViewSetTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse('audios:audios_list_create')
        cls.user = UserFactory()
        cls.PERSONAL_AUDIOS_COUNT = 2
        cls.PRESENTATION_AUDIOS_COUNT = 3
        cls.tag = TagFactory()
        cls.artist = ArtistFactory()
        AudioFactory.create_batch(
            cls.PRESENTATION_AUDIOS_COUNT, is_presentation=True,
            artist=cls.artist, tags=[cls.tag],
        )
        AudioFactory.create_batch(cls.PERSONAL_AUDIOS_COUNT, is_presentation=False, owner=cls.user)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        AudioFactory.tear_down_files()

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

    def test_filtering_via_author(self):
        """
            Testing that filtering via author works
        """
        artist_name = self.artist.name
        self.url += '?search={}&author=true'.format(artist_name)
        response = self.client.get(self.url)
        for song in response.json()['results']:
            self.assertEqual(song['artist']['name'], artist_name)

    def test_filtering_via_tag(self):
        """
            Testing that filtering via tag works
        """
        tag_slug = self.tag.slug
        self.url += '?tag={}'.format(tag_slug)
        response = self.client.get(self.url)
        has_tag = False
        for song in response.json()['results']:
            for tag in song['tags']:
                if tag['slug'] == tag_slug:
                    has_tag = True
        self.assertTrue(has_tag)

    def test_sorting_via_popularity(self):
        """
            Testing that sorting via popularity works
            (we are testing that next song has smaller playcount then previous)
        """
        self.url += '?o={}'.format('popularity')
        response = self.client.get(self.url)
        previous_playcount = None
        for song in response.json()['results']:
            current_playcount = song['playcount']
            if previous_playcount:  # skipping comparison for the first song
                self.assertGreater(previous_playcount, current_playcount)
            previous_playcount = current_playcount

    def test_sorting_via_uploaded_date(self):
        """
            Testing that sorting via uploaded_date works
            This is a default sorting that's why we aren't modifying url
        """
        response = self.client.get(self.url)
        previous_date = None
        for song in response.json()['results']:
            current_date = datetime.strptime(song['created_date'], '%Y-%m-%dT%H:%M:%S.%fZ')
            if previous_date:  # skipping comparison for the first song
                self.assertGreater(previous_date, current_date)
            previous_date = current_date

    def test_sorting_via_random(self):
        """
            Testing that sorting via random works
            We are ensuring that we are storing sorted data in cache
        """
        self.url += '?o={}'.format('random')
        self.client.get(self.url)
        cached_dict = cache.get('user_{}_audios_random'.format(None))
        self.assertTrue(len(cached_dict['ids']))

    def test_sorting_via_random_tag_invalidation(self):
        """
            Testing that when sorting via random and changing tag then cache invalidates
        """
        self.client.get(self.url + '?o=random')     # tag will be None
        first_cached_dict = cache.get('user_{}_audios_random'.format(None))
        self.client.get(self.url + '?o={}&tag={}'.format('random', self.tag.slug))
        second_cached_dict = cache.get('user_{}_audios_random'.format(None))
        self.assertNotEqual(first_cached_dict, second_cached_dict)

    def test_simple_search_via_artist(self):
        """
            Testing that simple search works
            (aka when found with similiar artist_name)
        """
        artist_name = self.artist.name
        self.url += '?search={}'.format(artist_name)
        response = self.client.get(self.url)
        for song in response.json()['results']:
            self.assertEqual(song['artist']['name'], artist_name)

    def test_simple_search_via_song_name(self):
        """
            Testing that simple search works
            (aka when found with similiar song_name)
        """
        song_name = Audio.objects.for_presentation()[0].name
        self.url += '?search={}'.format(song_name)
        response = self.client.get(self.url)
        for song in response.json()['results']:
            self.assertEqual(song['name'], song_name)

    def test_complex_search(self):
        """
            Testing that simple complex works
            (aka when providing part of the artist's name and part of the song's name)
        """
        song = Audio.objects.for_presentation()[0]
        song_part = song.name[:-1]
        artist_part = song.artist.name[:-1]
        search_input = '{} {}'.format(artist_part, song_part)
        self.url += '?search={}'.format(search_input)
        response = self.client.get(self.url)
        for song in response.json()['results']:
            self.assertTrue(song_part in song['name'] or artist_part in song['artist']['name'])

    @parameterized.expand([
        (True, False),  # is_anonymous, allowed
        (False, True),
    ])
    @mock.patch('muzicbox.apps.audios.parsers.song_parser.SongParser.parse')
    @mock.patch('muzicbox.apps.artists.parsers.artist_parser.ArtistParser.parse')
    def test_create_audio_permissions(self, is_anonymous, allowed, m_art_parser, m_song_parser):
        """
            Checking if we can create audios for logged in and can't for logged out users
        """
        if not is_anonymous:
            self.client.force_authenticate(self.user)
            m_song_parser.return_value = {
                'album': 'Tomorrow Never Knows', 'lyrics': None,
                'album_mbid': 'f172d1bf-575b-483c-9de1-bfbfef9b66bf',
                'song': 'Savoy Truffle', 'artist': 'The Beatles',
                'tags': [
                    {'url': 'https://www.last.fm/tag/rock', 'name': 'rock'},
                    {'url': 'https://www.last.fm/tag/classic+rock', 'name': 'classic rock'},
                    {'url': 'https://www.last.fm/tag/60s', 'name': '60s'},
                    {'url': 'https://www.last.fm/tag/The+Beatles', 'name': 'The Beatles'},
                    {'url': 'https://www.last.fm/tag/pop', 'name': 'pop'},
                ], 'mbid': '2eb16581-560c-4a4d-82af-6f33e38fffad', 'playcount': '1179498',
                'image': None,
            }
            m_art_parser.return_value = {
                'mbid': 'b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d', 'content': None,
                'tags': [
                    {'url': 'https://www.last.fm/tag/classic+rock', 'name': 'classic rock'},
                    {'url': 'https://www.last.fm/tag/rock', 'name': 'rock'},
                    {'url': 'https://www.last.fm/tag/british', 'name': 'british'},
                    {'url': 'https://www.last.fm/tag/60s', 'name': '60s'},
                    {'url': 'https://www.last.fm/tag/pop', 'name': 'pop'},
                ], 'artist': 'The Beatles', 'playcount': '501772761',
                'image_url': 'https://lastfm-img2.akamaized.net/i/u/300x300/774177d77ee348e198bee6d223a22ff3.png',
            }
        with open('muzicbox/apps/audios/tests/fixtures/with_id3.mp3', 'rb') as audio_file:
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
        with open('muzicbox/apps/audios/tests/fixtures/without_id3.mp3', 'rb') as audio_file:
            response = self.client.post(
                self.url,
                data={'audio_file': audio_file},
                format='multipart',
            )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_fail_audio_wrong_file(self):
        """
            Checking that we can't create audio which isn't an MP3 audio
        """
        self.client.force_authenticate(self.user)
        with open('muzicbox/apps/audios/tests/fixtures/wrong_file.mp3', 'rb') as audio_file:
            response = self.client.post(
                self.url,
                data={'audio_file': audio_file},
                format='multipart',
            )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @mock.patch('muzicbox.apps.audios.parsers.song_parser.SongParser.parse')
    @mock.patch('muzicbox.apps.artists.parsers.artist_parser.ArtistParser.parse')
    def test_create_success_audio_without_id3_but_naming(self, m_art_parser, m_song_parser):
        """
            Checking that we can create audio which doesn't have ID3 tags but have correct naming
        """
        self.client.force_authenticate(self.user)
        m_song_parser.return_value = {
            'mbid': None, 'song': 'Swim', 'playcount': '30202', 'artist': 'Dan Croll',
            'tags': [
                {'name': 'british', 'url': 'https://www.last.fm/tag/british'},
                {'name': 'FM4', 'url': 'https://www.last.fm/tag/FM4'},
                {'name': '2016 single', 'url': 'https://www.last.fm/tag/2016+single'},
            ], 'lyrics': '<p class="verse">lorem ipsum</p>',
            'album_mbid': None, 'image': None,
            'album': 'Emerging Adulthood',
        }
        m_art_parser.return_value = {
            'content': None, 'artist': 'Dan Croll', 'mbid': '480801c6-bd47-4d0d-b9fc-c20289529760',
            'playcount': '2689156',
            'image_url': 'https://lastfm-img2.akamaized.net/i/u/300x300/1622306ea93c4efe9c5ec5842806432e.png',
            'tags': [
                {'url': 'https://www.last.fm/tag/indie+pop', 'name': 'indie pop'},
                {'url': 'https://www.last.fm/tag/indie', 'name': 'indie'},
                {'url': 'https://www.last.fm/tag/electronic', 'name': 'electronic'},
                {'url': 'https://www.last.fm/tag/seen+live', 'name': 'seen live'},
                {'url': 'https://www.last.fm/tag/pop', 'name': 'pop'},
            ],
        }
        with open('muzicbox/apps/audios/tests/fixtures/Dan Croll - Swim.mp3', 'rb') as audio_file:
            response = self.client.post(
                self.url,
                data={'audio_file': audio_file},
                format='multipart',
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['name'], 'Swim')
        self.assertEqual(response.json()['artist']['name'], 'Dan Croll')


class AudioDetailViewSetTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.not_presentation_but_owner_audio = AudioFactory(is_presentation=False, owner=cls.user)
        cls.not_presentation_not_owner_audio = AudioFactory(is_presentation=False)
        cls.presentation_audio = AudioFactory(is_presentation=True)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        AudioFactory.tear_down_files()

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
            audio_id = str(self.presentation_audio.id)
        else:
            self.client.force_authenticate(self.user)
            audio_id = str(self.not_presentation_but_owner_audio.id)
        url = reverse('audios:audio_detail', kwargs={'pk': audio_id})
        response = self.client.get(url)
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(response.json()['id'], audio_id)

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


class AudioLyricsViewSetTestCase(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.not_presentation_but_owner_audio = AudioFactory(is_presentation=False, owner=cls.user)
        cls.not_presentation_not_owner_audio = AudioFactory(is_presentation=False)
        cls.presentation_audio = AudioFactory(is_presentation=True)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        AudioFactory.tear_down_files()

    @parameterized.expand([
        (True, ),
        (False, ),
    ])
    def test_detail_lyrics_success(self, is_anonymous):
        """
            Checking is that we can get lyrics for audio for logged in (user is owner)
            and logged out users (audio is in presentation mode)
        """
        if is_anonymous:
            audio_id = str(self.presentation_audio.id)
        else:
            self.client.force_authenticate(self.user)
            audio_id = str(self.not_presentation_but_owner_audio.id)
        url = reverse('audios:audio_lyrics', kwargs={'pk': audio_id})
        response = self.client.get(url)
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(response.json()['id'], audio_id)

    @parameterized.expand([
        (True, ),
        (False, ),
    ])
    def test_detail_lyrics_failure(self, is_anonymous):
        """
            Checking is that we can't get lyrics for audio for logged in (user isn't owner)
            and logged out users (audio isn't in presentation mode)
        """
        if not is_anonymous:
            self.client.force_authenticate(self.user)
        audio_id = self.not_presentation_not_owner_audio.id
        url = reverse('audios:audio_lyrics', kwargs={'pk': str(audio_id)})
        response = self.client.get(url)
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)
