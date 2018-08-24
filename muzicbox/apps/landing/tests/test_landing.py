from django.urls import reverse
from rest_framework.test import APITestCase
from py_w3c.validators.html.validator import HTMLValidator


class LandingTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('landing:main_page')
        self.validator = HTMLValidator()

    def test_valid_html(self):
        """
            Checking that we have valid html
        """
        response = self.client.get(self.url)
        self.validator.validate_fragment(str(response.content, encoding='utf8'))
        self.assertFalse(self.validator.errors)     # Empty lists/dicts evaluate to False
