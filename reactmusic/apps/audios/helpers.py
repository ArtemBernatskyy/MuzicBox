from django.conf import settings
from django.core.cache import cache
from django.db.models import Case, When

from reactmusic.apps.audios.models import Audio


def cache_users_audios(qs, user_id, tag_name=None):
    """
        caching random query's id in order to paginate it later
    """
    # cached_dict = { 'ids': [Audio.id, Audio.id], 'tag': TAG_NAME }

    cached_dict = cache.get(
        'user_{}_audios_random'.format(user_id), {'ids': None, 'tag': None})
    if not cached_dict['ids'] or tag_name != cached_dict['tag']:
        # here we'r creating cached query's id in cache
        cached_ids_list = list(qs.order_by('?').values_list('id', flat=True))   # not efficent :)
        cached_dict = {'ids': cached_ids_list, 'tag': tag_name}
        cache.set('user_{}_audios_random'.format(user_id), cached_dict, settings.AUDIO_CACHING_TIMEOUT)

    preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(cached_dict['ids'])])
    cached_audios = Audio.objects.filter(
        pk__in=cached_dict['ids']
    ).order_by(preserved).select_related('artist').prefetch_related('tags')
    return cached_audios
