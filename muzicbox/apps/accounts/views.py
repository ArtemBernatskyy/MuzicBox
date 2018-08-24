from django.views.generic import RedirectView
from django.contrib.auth import logout as auth_logout


class LogoutView(RedirectView):
    """
    Provides users the ability to logout
    """

    def get(self, request, *args, **kwargs):
        auth_logout(request)
        return super(LogoutView, self).get(request, *args, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        if self.request.GET.get('next_page'):
            return self.request.GET.get('next_page')
        else:
            return "/"
