import json

from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.staticfiles import finders
from py_w3c.validators.html.validator import HTMLValidator


class LandingTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('landing:main_page')
        self.validator = HTMLValidator()

    def ignore(self, error_message):
        """
            Ignoring minor errors in W3C specifications
        """
        if "for attribute “media” on element “link”: Expected a CSS media feature but saw" in error_message:
            return True
        else:
            return False

    def test_valid_html(self):
        """
            Checking that we have valid html
        """
        response = self.client.get(self.url)
        self.validator.validate_fragment(str(response.content, encoding='utf8'))
        filtered_errors = [msg for msg in self.validator.errors if not self.ignore(msg['message'])]
        self.assertFalse(filtered_errors)     # Empty lists/dicts evaluate to False

    def test_valid_manifest(self):
        """
            Testing that manifest is valid and accessible
        """
        # import ipdb;ipdb.set_trace()
        manifest_path = finders.find('manifest.json')
        with open(manifest_path, 'r') as manifest:
            self.assertTrue(json.load(manifest))
