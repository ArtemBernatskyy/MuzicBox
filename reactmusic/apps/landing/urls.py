from django.conf.urls import url

from .views import (
    MainPageView
)

app_name = 'landing'

urlpatterns = [
    url(r'^$', MainPageView.as_view(), name='main_page'),
]
