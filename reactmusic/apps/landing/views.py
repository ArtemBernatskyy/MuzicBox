from django.conf import settings
from django.views.generic import TemplateView


class MainPageView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(MainPageView, self).get_context_data(**kwargs)
        context['debug'] = settings.DEBUG
        return context
