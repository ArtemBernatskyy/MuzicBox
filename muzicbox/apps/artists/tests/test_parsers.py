import unittest

from muzicbox.apps.artists.parsers.artist_parser import ArtistParser


class PatchedRequest:
    def __init__(self, data):
        self.data = data

    def json(self):
        return self.data


class ArtistParserTestCase(unittest.TestCase):
    def setUp(self):
        self.artist_parser = ArtistParser()
        self.maxDiff = None

    def test_parse(self):
        """
            Checking if ArtistParser.parse works
        """
        should_be_dict = {
            'artist': 'Marc Almond',
            'mbid': 'd67e6b0a-d2c6-4e4a-ba30-7834701535a1',
            'tags': [
                {'name': 'new wave', 'url': 'https://www.last.fm/tag/new+wave'},
                {'name': '80s', 'url': 'https://www.last.fm/tag/80s'},
                {'name': 'pop', 'url': 'https://www.last.fm/tag/pop'},
                {'name': 'new romantic', 'url': 'https://www.last.fm/tag/new+romantic'},
                {'name': 'cabaret', 'url': 'https://www.last.fm/tag/cabaret'},
            ],
            'content': 'Marc Almond (born Peter Mark Sinclair Almond on 9 July 1957 in Southport, Lancashire, (now in the county of Merseyside, England) is a popular English singer, songwriter and recording artist, who originally found fame as half of the seminal synthpop/New Wave duo Soft Cell.<br><br>Marc Almond has had a long and varied career spanning almost 30 years. During this time, after a career with Soft Cell and Marc and the Mambas, he has collaborated with an extremely wide range of artists including Antony and The Johnsons, Jools Holland, Siouxsie Sioux, Nick Cave, P.J. Proby, Nico, Kelli Ali of the Sneaker Pimps, Neal X (on the albums Fantastic Star and Open All Night), Marie France, Agnes Bernelle, Lydia Lunch, Gene Pitney on the #1 UK single "Something\'s Gotten Hold of My Heart", Foetus (a.k.a. J. G. Thirlwell), Jimmy Somerville of The Communards and Bronski Beat, Psychic TV, Coil, Sally Timms of Mekons, King Roc, John Cale and David Johansen of The New York Dolls and German band Rosenstolz.<br><br>Almond initially shot to fame in the early 1980s as one half of synth duo Soft Cell, whose combination of drama and peep show sleaze set to an electronic beat gave them hits such as "Tainted Love" (UK #1), "Bedsitter" (UK #3), "Torch" (UK #2), "Say Hello Wave Goodbye" (UK #3), "Soul Inside" (UK # 16), "What?" (UK #3) and the club hit "Memorabilia". They were first spotted by David Oddie, boss of Wakefield based Ambergris Records in a Bradford club, who passed his enthusiasm onto Dead Good Records in Lincoln, famous for their Hicks From The Sticks compilation, who in turn approached Polygram, the newly formed amalgam of Polydor and Phonogram. Although Soft Cell disbanded in 1984 just before the release of fourth album, This Last Night In Sodom, the duo reunited in 2001 for live shows and in 2002 released a new album entitled Cruelty Without Beauty, from which the single "The Night" (UK #39) was taken.<br><br>His biggest UK hits as a solo artist have been cover versions; the aforementioned 1989 number one duet with Gene Pitney and another near chart-topper in 1991 with David McWilliams\' "The Days of Pearly Spencer", which peaked at #4. In 1985, he duetted with Jimmy Somerville and Bronski Beat on a cover of Donna Summer\'s "I Feel Love (Medley)" and it hit #3. The highest UK positions his self-penned singles have reached so far have been "Stories of Johnny" (#23 in 1985), "Tears Run Rings" (#28 in 1988) and "Adored and Explored" (#25 in 1995).<br><br>Almond\'s work runs the gamut from electronica and dance music to French chanson, traditional piano ballads, and Russian romance songs, as exhibited on his 2003 album Heart on Snow. Influences include David Bowie, a childhood hero of his, as well as early 1960s Northern Soul and disco. Other major influences have been Scott Walker from Walker Brothers and Jacques Brel, 12 of whose songs Almond reworked in English for his 1989 album Jacques. Almond\'s own lyrics are a creative expression of what he sees and are not to be confused with his own life. He also operates a record label, Blue Star Music, on which he has released many of his solo and collaborative records in the UK.<br><br>Almond currently lives in the Bermondsey area of south east London. In his autobiography he describes previously living in Earl\'s Court, in a converted church in Fulham and most memorably in Soho\'s Berwick Street, where he lived in a flat overlooking the Raymond Revuebar.  ',   # noqa
        }
        result = self.artist_parser.parse(artist='Marc Almond')
        # removing image and playcount because this path is UUID and it will be different every time
        self.assertTrue(result.pop('image_url', None))
        self.assertTrue(result.pop('playcount', None))
        self.assertDictEqual(result, should_be_dict)

    def test_parse_info_handling_empty_data(self):
        """
            Testing that ArtistParser.parse_info can handle empty data
            Here we are monkey patching with broken values object
        """
        return_dict = {'artist': {}}
        patched_request = PatchedRequest(return_dict)
        self.artist_parser.s.get = lambda url: patched_request
        self.artist_parser.artist = 'Marc Almond'
        result = self.artist_parser.parse_info()
        self.assertEqual(None, result)
