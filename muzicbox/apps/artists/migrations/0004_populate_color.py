from django.db import migrations

from colorthief import ColorThief


def populate_color(apps, schema_editor):
    """
        Populates `background_color` and `top_background_color` from `artist.image`
    """
    Artist = apps.get_model('artists', 'Artist')
    for artist in Artist.objects.all():
        color_thief = ColorThief(artist.image.path)
        palette = color_thief.get_palette(color_count=2, quality=1)
        color_thief.image.close()
        artist.background_color = '#%02x%02x%02x' % palette[1]
        artist.top_background_color = '#%02x%02x%02x' % palette[0]
        artist.save(update_fields=['background_color', 'top_background_color'])


def depopulate_color(apps, schema_editor):
    """
        Reverses `background_color` and `top_background_color` to previous migration
    """
    Artist = apps.get_model('artists', 'Artist')
    for artist in Artist.objects.all():
        artist.background_color = '#8c8c8c'
        artist.top_background_color = '#8c8c8c'
        artist.save(update_fields=['background_color', 'top_background_color'])


class Migration(migrations.Migration):

    dependencies = [
        ('artists', '0003_auto_20180825_1419'),
    ]

    operations = [
        migrations.RunPython(populate_color, depopulate_color),
    ]
