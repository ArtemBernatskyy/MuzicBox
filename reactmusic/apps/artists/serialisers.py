from rest_framework.serializers import (
    ModelSerializer, ImageField, CharField, IntegerField
)

from .models import Artist


class ArtistListSerializer(ModelSerializer):
    songs_count = IntegerField()
    name = CharField(max_length=255, required=False)
    small_image_thumbnail = ImageField(read_only=True)

    class Meta:
        model = Artist
        fields = ['id', 'name', 'slug', 'playcount', 'songs_count', 'small_image_thumbnail']


class ArtistDetailSerializer(ModelSerializer):
    image = ImageField(read_only=True)

    class Meta:
        model = Artist
        fields = ['id', 'name', 'playcount', 'slug', 'image']
