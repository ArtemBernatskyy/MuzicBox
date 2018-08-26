from django.db import migrations

from muzicbox.utils.models_helpers import Color


def fix_color(apps, schema_editor):
    """
        Populates `background_color` and `top_background_color` from `artist.image`
    """
    Artist = apps.get_model('artists', 'Artist')
    for artist in Artist.objects.all():
        if artist.image:
            color_manipulator = Color(artist.image.path)
            color_manipulator.sort_brightest_color()
            color_manipulator.process_colors()
            color_manipulator.quit()
            artist.background_color = color_manipulator.background_color
            artist.top_background_color = color_manipulator.top_background_color
            artist.save(update_fields=['background_color', 'top_background_color'])


def de_fix_color(apps, schema_editor):
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
        ('artists', '0004_populate_color'),
    ]

    operations = [
        migrations.RunPython(fix_color, de_fix_color),
    ]
