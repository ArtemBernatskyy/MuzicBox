import uuid

from django.db import models
from django.utils.translation import ugettext_lazy as _

from autoslug import AutoSlugField

from muzicbox.apps.audios.models import Audio


class Playlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    audios = models.ManyToManyField(Audio, through='PlaylistSong', related_name='playlist_audios')

    slug = AutoSlugField(
        populate_from='name', unique_with=['name'],
        help_text=_('Suggested value automatically generated from name. Must be unique.')
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class PlaylistSong(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audio = models.ForeignKey(Audio, on_delete=models.CASCADE)
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)

    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_date']

    def __str__(self):
        return self.audio.name + self.playlist.name
