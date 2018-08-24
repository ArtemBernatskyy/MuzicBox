import re
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from django.conf import settings


class ArtistParser:
    '''
        class responsible for artist data parsing
    '''

    def __init__(self):
        self.artist = None
        self.image_url = None
        self.tags = []
        self.mbid = None
        self.playcount = 0
        self.content = None
        self.s = requests.Session()
        retries = Retry(total=5,
                        backoff_factor=1.5,
                        status_forcelist=[500, 502, 503, 504])
        self.s.mount('https://', HTTPAdapter(max_retries=retries))

    def parse_info(self):
        '''
            method for getting artist image from last.fm
        '''
        image_url = None
        # artist.getinfo => getting artist info
        url = "https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist={artist}&api_key={key}&autocorrect=1&format=json".format(                # noqa
            key=settings.LAST_FM_KEY, artist=self.artist)
        data = self.s.get(url)
        try:
            data_dict = data.json()['artist']
            # getting corrected artist name
            try:
                self.artist = data_dict['name']
            except KeyError:
                pass
            # geting image url
            try:
                image_url = next(
                    filter(lambda cover: cover['size'] == 'mega', data_dict['image']))['#text']
            except (KeyError, StopIteration):
                try:
                    image_url = next(filter(
                        lambda cover: cover['size'] == 'extralarge', data_dict['image']))['#text']
                except (KeyError, StopIteration):
                    pass
        except KeyError:
            return None
        # getting playcount
        try:
            self.playcount = data_dict['stats']['playcount']
        except KeyError:
            pass
        # getting content
        try:
            self.content = data_dict['bio']['content']
            self.content = self.content.replace(
                """User-contributed text is available under the Creative Commons By-SA License; additional terms may apply.""", "")         # noqa
            self.content = re.sub(
                '<[^>]*>', '', self.content).replace("Read more on Last.fm.", "").replace("\n", "<br>")
        except KeyError:
            pass
        # getting mbid
        try:
            self.mbid = data_dict['mbid']
        except KeyError:
            pass
        # getting tags
        try:
            self.tags = data_dict['tags']['tag']
        except KeyError:
            pass
        # at this point we should have valid image_url
        self.image_url = image_url

    def quit(self):
        self.s.close()

    def parse(self, artist):
        self.artist = artist
        self.parse_info()
        self.quit()
        return {
            'artist': self.artist,
            'image_url': self.image_url,
            'tags': self.tags,
            'mbid': self.mbid,
            'playcount': self.playcount,
            'content': self.content,
        }
