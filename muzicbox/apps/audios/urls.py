from django.conf.urls import url

from .views import (
    AudioListCreateView, AudioDetailView, AudioLyricsView, TagListView
)

app_name = 'audios'

urlpatterns = [
    url(r'^audio/$', AudioListCreateView.as_view(), name='audios_list_create'),
    url(r'^tags/$', TagListView.as_view(), name='tags_list'),
    url(r'^audio/(?P<pk>[0-9a-f-]+)/$', AudioDetailView.as_view(), name='audio_detail'),
    url(r'^audio/(?P<pk>[0-9a-f-]+)/lyrics/$', AudioLyricsView.as_view(), name='audio_lyrics'),
]
