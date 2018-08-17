from django.contrib import admin

from .models import (
    Audio, Tag, Album
)


class AudioInline(admin.StackedInline):
    model = Audio
    extra = 0


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    inlines = [AudioInline]


@admin.register(Audio)
class AudioAdmin(admin.ModelAdmin):
    search_fields = ['name', 'artist__name']
    list_filter = ['is_presentation', 'artist', 'tags', 'owner']
    filter_horizontal = ['tags']
    list_display = ['name', 'playcount',
                    'audio_file_player', 'artist', 'is_presentation']
    fields = [
        'name', 'id', 'is_presentation', 'owner', 'audio_file_player', 'mbid',
        'playcount', 'image', 'slug', 'bitrate', 'length', 'audio_file', 'tags',
        'album', 'year', 'artist', 'lyrics', 'created_date', 'modified_date',
    ]
    readonly_fields = ['id', 'audio_file_player',
                       'created_date', 'modified_date', 'slug']

    actions = ['presentation_on', 'presentation_off']

    def presentation_on(self, request, queryset):
        queryset.update(is_presentation=True)
    presentation_on.short_description = "Mark selected audios for presentation"

    def presentation_off(self, request, queryset):
        queryset.update(is_presentation=False)
    presentation_off.short_description = "Remove selected audios from presentation"
