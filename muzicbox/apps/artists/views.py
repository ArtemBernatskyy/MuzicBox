from django.conf import settings
from django.db.models import Count
from rest_framework.renderers import JSONRenderer
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from rest_framework.generics import (ListAPIView, RetrieveAPIView)

from .models import Artist
from .serialisers import ArtistListSerializer, ArtistDetailSerializer


class ArtistPageNumberPagination(PageNumberPagination):
    page_size = settings.ARTISTS_PAGE_SIZE
    page_size_query_param = 'page_size'
    max_page_size = settings.ARTISTS_MAX_PAGE_SIZE


class ArtistListView(ListAPIView):
    renderer_classes = [JSONRenderer]
    pagination_class = ArtistPageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['name']
    serializer_class = ArtistListSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # returning user's artists
            qs = Artist.objects.filter(audios__owner=self.request.user).annotate(songs_count=Count(
                'audios'))
        else:
            # returning artists from presentation songs
            qs = Artist.objects.prefetch_related(
                'audios').for_presentation().annotate(songs_count=Count('audios'))
        return qs


class ArtistDetailView(RetrieveAPIView):
    renderer_classes = [JSONRenderer]
    serializer_class = ArtistDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # returning user's artists
            qs = Artist.objects.filter(
                audios__owner=self.request.user).distinct()
        else:
            # returning artists from presentation songs
            qs = Artist.objects.for_presentation().distinct()
        return qs
