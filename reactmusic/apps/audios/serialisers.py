import re
import logging
from datetime import datetime

from rest_framework.serializers import (
    ModelSerializer, HyperlinkedModelSerializer, ImageField, BooleanField, CharField, ValidationError
)

from mutagen.mp3 import MP3, HeaderNotFoundError

from reactmusic.utils.custom_exceptions import SongDoesNotExist
from reactmusic.apps.artists.models import Artist
from reactmusic.apps.artists.parsers.artist_parser import ArtistParser
from .models import Audio, Tag, Album
from .parsers.song_parser import SongParser


std_logger = logging.getLogger(__name__)


class ArtistSerializer(HyperlinkedModelSerializer):

    class Meta:
        model = Artist
        fields = ['id', 'name', 'slug']


class TagListSerializer(ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class AudioListSerializer(ModelSerializer):
    name = CharField(max_length=255, required=False)
    artist = ArtistSerializer(required=False)
    extra_sm_image_thumbnail = ImageField(read_only=True)
    small_image_thumbnail = ImageField(read_only=True)
    has_lyrics = BooleanField(read_only=True)

    class Meta:
        model = Audio
        fields = [
            'id', 'name', 'length', 'has_lyrics', 'slug', 'bitrate',
            'small_image_thumbnail', 'audio_file', 'artist', 'extra_sm_image_thumbnail',
        ]


class AudioCreateSerializer(ModelSerializer):
    name = CharField(max_length=255, required=False)
    has_lyrics = BooleanField(read_only=True, required=False)
    artist = ArtistSerializer(required=False)
    extra_sm_image_thumbnail = ImageField(read_only=True)
    small_image_thumbnail = ImageField(read_only=True)
    owner = CharField(source='owner.id', required=False)

    class Meta:
        model = Audio
        fields = [
            'id', 'name', 'owner', 'playcount', 'has_lyrics', 'album',
            'audio_file', 'mbid', 'artist', 'tags', 'extra_sm_image_thumbnail',
            'small_image_thumbnail', 'lyrics', 'image', 'bitrate', 'length',
        ]

    def validate_audio_file(self, value):
        try:
            MP3(value)
        except HeaderNotFoundError:
            raise ValidationError('This file should be mp3')
        return value

    def validate(self, attrs):
        # prevent possible xss atacks and manipulation from front end
        attrs['lyrics'] = None
        attrs['owner'] = None

        raw_file = self.context['request'].FILES.get('audio_file')
        audio = MP3(raw_file.temporary_file_path())
        std_logger.warning("starting validation: {}".format(raw_file.name))
        # codecs hell
        try:
            try:
                name = audio['TIT2'].text[0].encode("latin-1").decode('utf-8')
            except (UnicodeDecodeError, UnicodeEncodeError):
                try:
                    name = audio['TIT2'].text[0].encode("latin-1").decode('cp1251')
                except (UnicodeDecodeError, UnicodeEncodeError):
                    name = audio['TIT2'].text[0]
        except KeyError:
            name = None
        try:
            try:
                artist = audio['TPE1'].text[0].encode("latin-1").decode('utf-8')
            except (UnicodeDecodeError, UnicodeEncodeError):
                try:
                    artist = audio['TPE1'].text[0].encode("latin-1").decode('cp1251')
                except (UnicodeDecodeError, UnicodeEncodeError):
                    artist = audio['TPE1'].text[0]
        except KeyError:
            artist = None
        try:
            year_str = str(audio['TDRC'].text[0])
            year = datetime.strptime(year_str, '%Y')
        except (ValueError, KeyError):
            year = None

        attrs['bitrate'] = int(audio.info.bitrate)
        attrs['length'] = int(audio.info.length)

        # in case of failure getting artist name and song name from file name
        if not name or not artist:
            try:
                real_name_dirty = attrs['audio_file'].name
                real_name = real_name_dirty.replace('.mp3', '')
                artist_name_dirty = real_name.split(' - ')[0]   # splitting song name by ' - '
                song_name_dirty = real_name.split(' - ')[1]     # first part should be song name
                re_name = re.findall(r'\b\w+\b', song_name_dirty)
                re_artist = re.findall(r'\b\w+\b', artist_name_dirty)
                name = " ".join(re_name)
                artist = " ".join(re_artist)
            except IndexError:
                pass
        # raising validation errors
        if not name:
            raise ValidationError('No name was found in ID3 data or in song file name')
        if not artist:
            raise ValidationError('No artist was found in ID3 data or in song file name')
        # if success then saving with name and artist
        if name and name.strip():
            attrs['name'] = name
        if name and name.strip() and artist and artist.strip():
            # parse song info
            song_parser = SongParser(artist=artist, song=name)
            try:
                song_parser.parse()
            except SongDoesNotExist:
                raise ValidationError('No artist was found in ID3 data or in song file name')
            artist = song_parser.artist
            attrs['name'] = song_parser.song
            attrs['image'] = song_parser.image
            attrs['lyrics'] = song_parser.lyrics
            attrs['mbid'] = song_parser.mbid
            attrs['playcount'] = song_parser.playcount
            api_tags = song_parser.tags
            tags = []
            for api_tag in api_tags:
                tag, created = Tag.objects.get_or_create(name=api_tag['name'])
                tags.append(tag)    # here we should get list of orm tags
            attrs['tags'] = tags

        if artist and artist.strip():
            try:
                artist_obj = Artist.objects.get(name__iexact=artist)
            except Artist.DoesNotExist:
                artist_obj = Artist(name=artist)
                artist_obj.save()
                artist_parser = ArtistParser(artist=artist)
                artist_parser.parse()
                api_tags = artist_parser.tags
                tags = []
                for api_tag in api_tags:
                    tag, created = Tag.objects.get_or_create(name=api_tag['name'])
                    tags.append(tag)    # here we should get list of orm tags
                artist_obj.tags.add(*tags)
                artist_obj.mbid = artist_parser.mbid
                artist_obj.playcount = artist_parser.playcount
                artist_obj.content = artist_parser.content
                if artist_parser.image_url:
                    artist_obj.save_image_from_url(artist_parser.image_url)
            # saving album with such artist and song
            if song_parser.album:
                try:
                    album_obj = Album.objects.get(name__iexact=song_parser.album)
                except Album.DoesNotExist:
                    album_obj = Album(name=song_parser.album, artist=artist_obj, mbid=song_parser.album_mbid)
                    album_obj.save()
                attrs['album'] = album_obj

            attrs['artist'] = artist_obj
        if year:
            attrs['year'] = year

        attrs['owner'] = self.context['request'].user
        std_logger.warning("finishing validation: {}".format(raw_file.name))
        return attrs


class AlbumSerializer(HyperlinkedModelSerializer):

    class Meta:
        model = Artist
        fields = ['id', 'name', 'slug']


class AudioDetailSerializer(ModelSerializer):
    artist = ArtistSerializer(required=False)
    album = AlbumSerializer(required=False)
    small_image_thumbnail = ImageField(read_only=True)
    extra_sm_image_thumbnail = ImageField(read_only=True)

    class Meta:
        model = Audio
        fields = [
            'id', 'name', 'album', 'audio_file',
            'length', 'artist', 'extra_sm_image_thumbnail',
            'small_image_thumbnail', 'lyrics',
        ]


class AudioLyricsSerializer(ModelSerializer):

    class Meta:
        model = Audio
        fields = ['id', 'lyrics']
