import unittest

from muzicbox.utils.models_helpers import Color


class ColorTestCase(unittest.TestCase):
    def setUp(self):
        self.color_manipulator = Color('muzicbox/apps/artists/tests/fixtures/test_photo.jpg')

    def test_sort_brightest_color(self):
        self.color_manipulator.sort_brightest_color()
        self.assertEqual(self.color_manipulator.palette, [(202, 189, 189), (112, 67, 52), (114, 89, 94)])
        self.assertEqual(self.color_manipulator.sorted_colors, [(202, 189, 189), (114, 89, 94), (112, 67, 52)])

    def test_process_colors(self):
        self.color_manipulator.sort_brightest_color()
        self.color_manipulator.process_colors()
        self.assertEqual(self.color_manipulator.background_color, '#cabdbd')
        self.assertEqual(self.color_manipulator.top_background_color, '#3c3838')

    def tearDown(self):
        self.color_manipulator.quit()
