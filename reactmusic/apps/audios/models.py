import os
import uuid

from django.db import models
from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from autoslug import AutoSlugField
from imagekit.processors import ResizeToFill
from imagekit.models import ImageSpecField, ProcessedImageField
from ckeditor.fields import RichTextField

from reactmusic.utils.models_helpers import UploadToPathAndRename
from reactmusic.apps.artists.models import Artist


class Album(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, db_index=True)
    mbid = models.CharField(max_length=50, null=True, blank=True)
    artist = models.ForeignKey(Artist, null=False, on_delete=models.CASCADE, blank=True,
                               related_name='albums', help_text=_("artist or band"))
    slug = AutoSlugField(
        unique=True,
        populate_from='name',
        help_text=_(
            'Suggested value automatically generated from name. Must be unique.')
    )
    image = ProcessedImageField(
        upload_to=UploadToPathAndRename('albums'),
        format='JPEG',
        options={'quality': 90},
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    small_image_thumbnail = ImageSpecField(
        source='image',
        processors=[ResizeToFill(145, 145)],
        format='JPEG',
        options={'quality': 80}
    )


class TagQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def for_presentation(self):
        return self.active().filter(audio__is_presentation=True)


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=200,
        help_text=_('Maximum 50 characters'),
        unique=True
    )
    slug = AutoSlugField(
        unique=True,
        populate_from='name',
        help_text=_(
            'Suggested value automatically generated from name. Must be unique.')
    )
    is_active = models.BooleanField(
        help_text=_(
            "Tick to make this entry live (see also the publication date). "
            "Note that administrators (like yourself) are allowed to preview "
            "inactive entries whereas the general public aren't."
        ),
        default=True,
    )
    short_description = models.CharField(max_length=300, help_text=_(
        'Maximum 250 characters'), null=True, blank=True)

    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    objects = TagQuerySet.as_manager()

    class Meta:
        ordering = ['name']
        verbose_name_plural = _('Tag')
        verbose_name_plural = _('Tags')

    def __str__(self):
        return self.name


class AudioQuerySet(models.QuerySet):
    def for_presentation(self):
        return self.filter(is_presentation=True)


class Audio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, db_index=True)
    mbid = models.CharField(max_length=50, null=True, blank=True)
    bitrate = models.PositiveIntegerField(null=True, blank=True)
    length = models.PositiveIntegerField(null=True, blank=True)
    audio_file = models.FileField(upload_to="audios/")
    playcount = models.PositiveIntegerField(null=False, blank=True, default=0)
    album = models.ForeignKey(Album, null=True, blank=True, on_delete=models.CASCADE,
                              related_name='audios', help_text=_("musical album"))
    artist = models.ForeignKey(Artist, null=False, blank=True, on_delete=models.CASCADE,
                               related_name='audios', help_text=_("artist or band"))
    tags = models.ManyToManyField(Tag, blank=True)

    is_presentation = models.BooleanField(default=False, help_text=_(
        "defines if audio will be shown for presentational purposes"))

    image = ProcessedImageField(
        upload_to=UploadToPathAndRename('covers'),
        format='JPEG',
        options={'quality': 90},
        null=True,
        blank=True
    )

    slug = AutoSlugField(
        unique=True,
        populate_from='name',
        help_text=_(
            'Suggested value automatically generated from name. Must be unique.')
    )

    year = models.DateField(null=True, blank=True)
    lyrics = RichTextField(null=True, blank=True)

    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    objects = AudioQuerySet.as_manager()

    class Meta:
        ordering = ["-created_date"]

    def __str__(self):
        return self.name

    def audio_file_player(self):
        """audio player tag for admin"""
        if self.audio_file:
            file_url = settings.MEDIA_URL + str(self.audio_file)
            player_string = '<div class="ui360 ui360-vis"><a href="{}">{}</a></div>'.format(
                file_url, os.path.basename(file_url)
            )
            return player_string
    audio_file_player.allow_tags = True
    audio_file_player.short_description = _('audio file player')

    large_image_thumbnail = ImageSpecField(
        source='image',
        processors=[ResizeToFill(400, 400)],
        format='JPEG',
        options={'quality': 80}
    )

    small_image_thumbnail = ImageSpecField(
        source='image',
        processors=[ResizeToFill(56, 56)],
        format='JPEG',
        options={'quality': 80}
    )

    extra_sm_image_thumbnail = ImageSpecField(
        source='image',
        processors=[ResizeToFill(30, 30)],
        format='JPEG',
        options={'quality': 80}
    )

    def has_lyrics(self):
        if self.lyrics:
            return True
        else:
            return False
