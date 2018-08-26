import os
import uuid
import errno
import tempfile
import requests

from django.db import models
from django.conf import settings
from autoslug import AutoSlugField
from ckeditor.fields import RichTextField
from requests.adapters import HTTPAdapter
from imagekit.processors import ResizeToFill
from django.core.validators import RegexValidator
from requests.packages.urllib3.util.retry import Retry
from django.utils.translation import ugettext_lazy as _
from imagekit.models import ImageSpecField, ProcessedImageField

from muzicbox.utils.models_helpers import UploadToPathAndRename, Color


class ArtistQuerySet(models.QuerySet):
    def for_presentation(self):
        return self.filter(audios__is_presentation=True)


class Artist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    mbid = models.CharField(max_length=50, null=True, blank=True)
    playcount = models.PositiveIntegerField(null=False, blank=True, default=0)
    slug = AutoSlugField(
        unique=True,
        populate_from='name',
        help_text=_(
            'Suggested value automatically generated from name. Must be unique.')
    )
    image = ProcessedImageField(
        upload_to=UploadToPathAndRename('artists'),
        format='JPEG',
        options={'quality': 90},
        null=True,
        blank=True
    )
    background_color = models.CharField(
        default='#8c8c8c', max_length=9,
        help_text=_("Most common color for artist's background"),
        validators=[
            RegexValidator(
                regex='^#(?:[0-9a-fA-F]{3}){1,2}$',
                message=_('Plz specify correct color'),
            ),
        ]
    )
    top_background_color = models.CharField(
        default='#8c8c8c', max_length=9,
        help_text=_("Most common color for top border in artist's page"),
        validators=[
            RegexValidator(
                regex='^#(?:[0-9a-fA-F]{3}){1,2}$',
                message=_('Plz specify correct color'),
            ),
        ]
    )
    content = RichTextField(blank=True, null=True)

    tags = models.ManyToManyField('audios.Tag', blank=True)

    objects = ArtistQuerySet.as_manager()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    small_image_thumbnail = ImageSpecField(
        source='image',
        processors=[ResizeToFill(200, 200)],
        format='JPEG',
        options={'quality': 80}
    )

    def save_most_common_colors(self, image_path):
        color_manipulator = Color(image_path)
        color_manipulator.sort_brightest_color()
        color_manipulator.process_colors()
        color_manipulator.quit()
        self.background_color = color_manipulator.background_color
        self.top_background_color = color_manipulator.top_background_color
        self.save(update_fields=['background_color', 'top_background_color'])

    def save_image_from_url(self, image_url):
        s = requests.Session()
        retries = Retry(total=5,
                        backoff_factor=1.5,
                        status_forcelist=[500, 502, 503, 504])
        s.mount('https://', HTTPAdapter(max_retries=retries))
        response = s.get(image_url, stream=True)
        folder_name = Artist.image.field.upload_to.sub_path
        random_name = uuid.uuid4().hex + ".png"
        # creating folder if it doen't exist
        try:
            os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name))
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise
        # loading image to tmp location and saving it
        tmp = tempfile.NamedTemporaryFile(delete=True)
        try:
            tmp.write(response.raw.read())
            self.save_most_common_colors(tmp.name)
            with open(tmp.name, 'rb') as f:
                self.image.save(random_name, f)
        finally:
            tmp.close()
