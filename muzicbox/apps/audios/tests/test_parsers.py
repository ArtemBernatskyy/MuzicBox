import unittest

from muzicbox.utils.custom_exceptions import SongDoesNotExist
from muzicbox.apps.audios.parsers.song_parser import SongParser


class PatchedRequest:
    def __init__(self, data):
        self.data = data

    def json(self):
        return self.data


class SongParserTestCase(unittest.TestCase):
    def setUp(self):
        self.song_parser = SongParser()
        self.maxDiff = None

    def test_parse(self):
        """
            Checking if SongParser.parse works
        """
        should_be_dict = {
            'album': '12 Years of Tears: Live at the Royal Albert Hall (Edited Highlights)',
            'tags': [
                {'url': 'https://www.last.fm/tag/synth+pop', 'name': 'synth pop'},
                {'url': 'https://www.last.fm/tag/pop', 'name': 'pop'},
                {'url': 'https://www.last.fm/tag/alternative+dance', 'name': 'alternative dance'},
                {'url': 'https://www.last.fm/tag/8+of+10+stars', 'name': '8 of 10 stars'},
                {'url': 'https://www.last.fm/tag/running', 'name': 'running'},
            ],
            'mbid': 'ba14c3e2-54f7-4ad4-acb5-a802d835d187', 'song': 'Tainted Love',
            'album_mbid': 'd6aa4236-21ed-4917-8c01-a5eae3df8791', 'artist': 'Marc Almond',
            'lyrics': '<p class="verse">Sometimes I feel I&#8217;ve got to run away<br/>I&#8217;ve got to get away<br/>From the pain you drive jnto the heart of me.<br/>fhe love we share seems to go nowhere</p><p class="verse">And I&#8217;ve lost my light for I toss and turn &#8211; I can&#8217;t sleep at night.</p><p class="verse">Once I ran to you<br/>now I&#8217;ll run from you</p><p class="verse">This tainted love you&#8217;ve given -<br/>I give you all a boy could give you.<br/>Take my tears and that&#8217;s not living &#8211; oh<br/>tainted love &#8211; tainted love.</p><p class="verse">Now I know I&#8217;ve got to run away<br/>I&#8217;ve got to get away.<br/>You don&#8217;t really want it any more from me -<br/>To make things right you need someone to hold you tight</p><p class="verse">And you&#8217;ll think love is to pray but I&#8217;m sorry I don&#8217;t pray that ws</p><p class="verse">Once I ran to you<br/>now I&#8217;ll run from you<br/>. . .</p><p class="verse">Don&#8217;t touch me please &#8211; I cannot stand the way you tease.<br/>I love you though you hurt me so</p><p class="verse">Now I&#8217;m gonna pack my things and go. Tainted love &#8211; tainted love</p>', # noqa
        }
        result = self.song_parser.parse(artist='Marc Almond', song='Tainted Love')
        # removing image and playcount because this path is UUID and it will be different every time
        self.assertTrue(result.pop('image', None))
        self.assertTrue(result.pop('playcount', None))
        self.assertDictEqual(result, should_be_dict)

    def test_artist_get_info(self):
        """
            Testing that SongParser.artist_get_info works
        """
        self.song_parser.artist = 'Marc Almond'
        self.song_parser.song = 'Tainted Love'
        result = self.song_parser.artist_get_info()
        self.assertIn('https://lastfm.freetls.fastly.net/i/u/300x300/', result)

    def test_song_does_not_exist(self):
        """
            Testing that song with wrong artist and song_name will fail
        """
        self.song_parser.artist = 'Marc Almond Wrong Artist'
        self.song_parser.song = 'Tainted WFT MZFK'
        self.assertRaises(SongDoesNotExist, self.song_parser.track_get_info)

    def test_track_get_info_handling_empty_data(self):
        """
            Testing that SongParser.track_get_info can handle empty data
            Here we are monkey patching with broken values object
        """
        return_dict = {
            'track': {
                'album': {
                    'image': [
                        {'size': 'large', '#text': 'https://lastfm.freetls.fastly.net/i/u/174s/92ef83be41694b86ac59165deda8f5e1.png'},  # noqa
                    ],
                },
            }
        }
        patched_request = PatchedRequest(return_dict)
        self.song_parser.s.get = lambda url: patched_request
        self.song_parser.artist = 'Marc Almond'
        self.song_parser.song = 'Tainted Love'
        result = self.song_parser.track_get_info()
        self.assertIn('https://lastfm.freetls.fastly.net/i/u/', result)
