from django.contrib import admin

from .models import Playlist, PlaylistSong


class PlaylistSongInline(admin.TabularInline):
    model = PlaylistSong
    extra = 1


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    inlines = [PlaylistSongInline]
