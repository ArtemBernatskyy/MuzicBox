from django.contrib import admin

from reactmusic.apps.audios.models import Audio

from .models import Artist


class AudioInline(admin.StackedInline):
    model = Audio
    extra = 0


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    search_fields = ['name']
    list_display = ['name']
    list_filter = ['tags']
    filter_horizontal = ['tags']
    inlines = [AudioInline]
    readonly_fields = ['slug']
