import operator
from functools import reduce
from django.db.models import Q, Count
from django.conf import settings
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import (
    ListCreateAPIView, RetrieveAPIView, ListAPIView)

from .models import Audio, Tag
from .helpers import cache_users_audios
from .serialisers import (
    AudioListSerializer, AudioCreateSerializer,
    AudioDetailSerializer, AudioLyricsSerializer,
    TagListSerializer,
)


class TagListView(ListAPIView):
    renderer_classes = [JSONRenderer]
    serializer_class = TagListSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # returning user's tags
            qs = Tag.objects.filter(audio__owner=self.request.user).active().annotate(
                audios_count=Count('audio')
            ).order_by('-audios_count')[:30]    # top 30 tags
        else:
            # returning tags from presentation songs
            qs = Tag.objects.for_presentation().annotate(
                audios_count=Count('audio')
            ).order_by('-audios_count')[:30]    # top 30 tags
        return qs


class AudioPageNumberPagination(PageNumberPagination):
    page_size = settings.AUDIO_PAGE_SIZE
    page_size_query_param = 'page_size'
    max_page_size = settings.AUDIO_MAX_PAGE_SIZE


class AudioListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = [JSONRenderer]
    pagination_class = AudioPageNumberPagination

    def get_search_filter(self):
        if 'search' in self.request.GET:
            return self.request.GET.get('search')
        else:
            return None

    def is_author_filter(self):
        if 'author' in self.request.GET and self.request.GET.get('author') == 'true':
            return True
        else:
            return None

    def get_tag_filter(self):
        if 'tag' in self.request.GET:
            return self.request.GET.get('tag')
        else:
            return None

    def get_sorting_filter(self):
        if 'o' in self.request.GET:
            return self.request.GET.get('o')
        else:
            return None

    def order_queryset(self, qs):
        sort_filter = self.get_sorting_filter()

        if sort_filter == 'popularity':
            qs = qs.order_by('-playcount')
        elif sort_filter == 'random' and not self.get_search_filter():
            # here we'r creating cached query in cache
            qs = cache_users_audios(qs, self.request.user.id, tag_name=self.get_tag_filter())
        else:
            qs = qs.order_by('-created_date')
        return qs

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # returning user's audios
            qs = Audio.objects.filter(owner=self.request.user).select_related('artist').prefetch_related('tags')
        else:
            # returning presentational audios
            qs = Audio.objects.for_presentation().select_related('artist').prefetch_related('tags')

        tag_filter = self.get_tag_filter()
        if tag_filter is not None:
            qs = qs.filter(tags__slug=tag_filter)

        search_filter = self.get_search_filter()
        if search_filter is not None:
            song = self.song_clear(search_filter)
            # checking if author only search is enabled
            is_author_only_search = self.is_author_filter()
            if is_author_only_search:
                qs = qs.filter(artist__name=song)
            else:
                # if not is_author_only_search then trying simple search
                search_results_simple = self.simple_search(song, qs)
                if search_results_simple:
                    qs = search_results_simple
                else:
                    # else trying complex search
                    qs = self.complex_search(song, qs)

        qs = self.order_queryset(qs)

        return qs

    def get_serializer_class(self):
        if self.request.method == "GET":
            return AudioListSerializer
        if self.request.method == "POST":
            return AudioCreateSerializer

    def song_clear(self, song):
        song = song.strip()     # stripping spaces from song
        return song

    def simple_search(self, song, qs):
        qs = qs.filter(Q(name__icontains=song) | Q(artist__name__icontains=song)).distinct()
        if qs.exists():
            return qs

    def complex_search(self, song, qs):
        song_parts = song.replace('-', ' ').split(' ')  # splitting into words
        # filtering for empty values
        song_parts = [x for x in song_parts if x]
        search_artist = reduce(operator.or_, (Q(artist__name__icontains=x) for x in song_parts))
        search_song = reduce(operator.or_, (Q(name__icontains=x) for x in song_parts))
        # here we should get all songs of similiar artist
        run_search_artist = qs.filter(search_artist)
        # here we should probably get similiar song :)
        run_search_song = run_search_artist.filter(search_song)
        # distinct in order to prevent duplicates
        qs = run_search_song.distinct()
        return qs


class AudioDetailView(RetrieveAPIView):
    renderer_classes = [JSONRenderer]
    serializer_class = AudioDetailSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # looking in user's audio
            qs = Audio.objects.filter(owner=self.request.user)
        else:
            # looking in presentational audios
            qs = Audio.objects.for_presentation().distinct()
        return qs


class AudioLyricsView(RetrieveAPIView):
    renderer_classes = [JSONRenderer]
    serializer_class = AudioLyricsSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # looking in user's audio
            qs = Audio.objects.filter(owner=self.request.user)
        else:
            # looking in presentational audios
            qs = Audio.objects.for_presentation()
        return qs
