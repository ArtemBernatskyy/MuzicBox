from django.conf import settings
from django.contrib import admin
from django.conf.urls import url, include


urlpatterns = [
    url(r'^oauth/', include('social_django.urls', namespace='social')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^ckeditor/', include('ckeditor_uploader.urls')),
    url(r'^api/v0/', include('muzicbox.apps.audios.urls', namespace='base')),
    url(r'^api/v0/accounts/', include('muzicbox.apps.accounts.urls', namespace='accounts')),
    url(r'^api/v0/artists/', include('muzicbox.apps.artists.urls', namespace='artists')),
    url(r'^admin/', admin.site.urls),
    url(r'^(?:.*)/?$', include('muzicbox.apps.landing.urls', namespace='landing')),
]


if settings.DEBUG:  # pragma: no cover
    from django.conf.urls.static import static

    urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + urlpatterns
    urlpatterns = static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + urlpatterns

#     import debug_toolbar
#     urlpatterns = [
#         url(r'^__debug__/', include(debug_toolbar.urls)),
#     ] + urlpatterns
