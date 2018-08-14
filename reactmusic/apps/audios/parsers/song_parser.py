import os
import re
import json
import errno
import uuid
import shutil
import textile
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from django.conf import settings

from reactmusic.utils.custom_exceptions import SongDoesNotExist
from ..models import Audio


class SongParser:
    """
        class responsible for song data parsing
    """

    def __init__(self, artist, song):
        self.artist = artist
        self.song = song
        self.image = None
        self.lyrics = None
        self.mbid = None
        self.album = None
        self.album_mbid = None
        self.playcount = 0
        self.tags = []
        self.s = requests.Session()
        retries = Retry(total=5,
                        backoff_factor=1.5,
                        status_forcelist=[500, 502, 503, 504])
        self.s.mount('https://', HTTPAdapter(max_retries=retries))

    def _parse_info(self):
        """
            method for getting cover album image from last.fm
        """
        image_url = None
        try:
            # track.getInfo => trying to get album cover
            url = "https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key={key}&artist={artist}&track={name}&autocorrect=1&format=json".format(key=settings.LAST_FM_KEY, artist=self.artist, name=self.song)   # noqa
            data = self.s.get(url)
            try:
                data_dict = json.loads(data.text)['track']
            except ValueError:
                raise SongDoesNotExist
            # getting mbid
            try:
                self.mbid = data_dict['mbid']
            except KeyError:
                pass
            # getting corrected artist name
            try:
                self.artist = data_dict['artist']['name']
            except KeyError:
                pass
            # getting corrected song name
            try:
                self.song = data_dict['name']
            except KeyError:
                pass
            # getting album
            try:
                self.album = data_dict['album']['title']
            except KeyError:
                pass
            # getting album mbid
            try:
                self.album_mbid = data_dict['album']['mbid']
            except KeyError:
                pass
            # getting tags
            try:
                self.tags = data_dict['toptags']['tag']
            except KeyError:
                pass
            # getting playcount
            try:
                self.playcount = data_dict['playcount']
            except KeyError:
                pass
            try:
                image_url = next(
                    filter(lambda cover: cover['size'] == 'extralarge', data_dict['album']['image'])
                )['#text']
            except (KeyError, StopIteration):
                # here we should fail in order to start parsing from artist
                image_url = next(filter(lambda cover: cover['size'] == 'large', data_dict['album']['image']))['#text']
            if image_url == "":
                raise KeyError  # here we should fail if image is empty string
        except (KeyError, StopIteration):
            # artist.getinfo => trying to get artist cover instead of album cover
            url = "https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist={artist}&api_key={key}&autocorrect=1&format=json".format(key=settings.LAST_FM_KEY, artist=self.artist)   # noqa
            data = self.s.get(url)
            try:
                data_dict = json.loads(data.text)['artist']
                try:
                    image_url = next(filter(lambda cover: cover['size'] == 'mega', data_dict['image']))['#text']
                except (KeyError, StopIteration):
                    try:
                        image_url = next(
                            filter(lambda cover: cover['size'] == 'extralarge', data_dict['image'])
                        )['#text']
                    except (KeyError, StopIteration):
                        pass
            except KeyError:
                return None
        # at this point we should have valid image_url
        if image_url:
            response = self.s.get(image_url, stream=True)
            folder_name = Audio.image.field.upload_to.sub_path
            random_name = uuid.uuid4().hex + ".png"
            self.image = os.path.join(folder_name, random_name)
            absolute_file_path = os.path.join(settings.MEDIA_ROOT, folder_name, random_name)
            # creating folder if it doen't exist
            try:
                os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name))
            except OSError as e:
                if e.errno != errno.EEXIST:
                    raise
            with open(absolute_file_path, 'wb') as f:
                shutil.copyfileobj(response.raw, f)

    def _get_lyrics(self, keep_the=False):
        """
            helper function for get_lyrics method
        """
        artist = self.artist.lower()
        song_title = self.song.lower()
        # remove all except alphanumeric characters from artist and song_title
        artist = re.sub('[^A-Za-z0-9\']+', "-", artist)
        song_title = re.sub('[^A-Za-z0-9\']+', "-", song_title).replace(' ', '-').replace("'", '')
        if artist.startswith("the-") and not keep_the:    # remove starting 'the' from artist e.g. the who -> who
            artist = artist[4:]
        url = "http://www.metrolyrics.com/{song}-lyrics-{artist}.html".format(
            artist=artist,
            song=song_title
        )
        data = self.s.get(url)
        if data.status_code == 404:
            return None
        html = BeautifulSoup(data.text, 'html.parser')
        lyrics_raw = "".join([str(verse).replace('\n', '') for verse in html.findAll("p", {"class": 'verse'})])
        lyrics = textile.textile(lyrics_raw).replace('\t', "").replace("\n", "")
        return lyrics

    def _parse_lyrics(self):
        """
            method for getting lyrics from www.metrolyrics.com
        """
        lyrics = None
        lyrics = self._get_lyrics()
        if not lyrics:
            lyrics = self._get_lyrics(keep_the=True)
        if lyrics:
            self.lyrics = lyrics

    def _quit(self):
        self.s.close()

    def parse(self):
        self._parse_info()
        self._parse_lyrics()
        self._quit()
