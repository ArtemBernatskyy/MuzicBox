import uuid
import json

from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.db.models.signals import post_save
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _

from slugify import UniqueSlugify
from imagekit.processors import Adjust, ResizeToFill
from imagekit.models import ProcessedImageField, ImageSpecField
from django_countries.fields import CountryField

from reactmusic.utils.models_helpers import UploadToPathAndRename


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    SEX_CHOICES = (
        (1, _('man')),
        (0, _('woman')),
        (None, _("don't show"))
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    sex = models.IntegerField(choices=SEX_CHOICES, blank=True, null=True, verbose_name=_('gender'))
    slug = models.SlugField(
        unique=True, max_length=100, help_text=_("automatically generated, don't change manually !"),
    )
    address_line1 = models.CharField(verbose_name=_("address line1"), max_length=200, blank=True, null=True)
    address_line2 = models.CharField(verbose_name=_("address line2"), max_length=200, blank=True, null=True)
    city = models.CharField(_("city"), max_length=200, blank=True, null=True)
    state = CountryField(blank=True, null=True, blank_label=_('(select country)'))
    postal = models.CharField(_("postal"), max_length=200, blank=True, null=True)
    dob = models.DateField(null=True, blank=True, verbose_name=_('birthday'))
    phone = models.CharField(
        max_length=50,
        verbose_name=_("phone"),
        blank=True,
        null=True,
    )
    cell = models.CharField(
        max_length=20,
        verbose_name=_("cell number"),
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message=_("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
            )
        ]
    )
    profile_image = ProcessedImageField(upload_to=UploadToPathAndRename('profile_images'),
                                        processors=[
                                            ResizeToFill(400, 400),
                                            Adjust(sharpness=1.1, contrast=1.1)],
                                        format='JPEG',
                                        options={'quality': 90}, null=True, blank=True)

    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-id',)

    def __str__(self):
        return self.user.username

    @property
    def user_container(self):
        # be carefull this data is exposed to frontend to user :)
        context = {
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email
        }
        return json.dumps(context)

    # thumbnail for admin interface
    def admin_image_thumb(self):
        if self.profile_image:
            return mark_safe(
                '<img src="{0}{1}" width="100" height="100" />'.format(settings.MEDIA_URL, self.profile_image)
            )
        else:
            return mark_safe(
                '<img src="{0}accounts/default-avatar.jpg" width="100" height="100" />'.format(settings.STATIC_URL)
            )

    # small thumbnail and method for it
    profile_image_thumbnail_sm = ImageSpecField(
        source='profile_image',
        processors=[ResizeToFill(155, 155)],
        format='JPEG',
        options={'quality': 80}
    )

    def get_avatar_sm(self):
        if self.profile_image:
            return self.profile_image_thumbnail_sm.url
        else:
            return '{}accounts/default-avatar_sm.jpg'.format(settings.STATIC_URL)

    # extra small thumbnail and method for it
    profile_image_thumbnail_xs = ImageSpecField(
        source='profile_image',
        processors=[ResizeToFill(48, 48)],
        format='JPEG',
        options={'quality': 80}
    )

    def get_avatar_xs(self):
        if self.profile_image:
            return self.profile_image_thumbnail_xs.url
        else:
            return '{}accounts/default-avatar_xs.jpg'.format(settings.STATIC_URL)


def my_unique_check(text, uids):
    if text in uids:
        return False
    return not Profile.objects.filter(slug=text).exists()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        slugify_unique = UniqueSlugify(
            unique_check=my_unique_check,
            separator='_',
            to_lower=True,
            max_length=100
        )
        slug = slugify_unique(instance.username)
        Profile.objects.create(user=instance, slug=slug)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
