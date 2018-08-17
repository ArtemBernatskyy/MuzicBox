from django.conf.urls import url

from .views import LogoutView


app_name = 'accounts'


urlpatterns = [
    url(r'^logout/$', LogoutView.as_view(), name='logout'),
]
