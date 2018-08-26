import os
from uuid import uuid4
from django.utils.deconstruct import deconstructible

from colorthief import ColorThief


@deconstructible
class UploadToPathAndRename(object):

    def __init__(self, path):
        self.sub_path = path

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = '{}.{}'.format(uuid4().hex, ext)
        return os.path.join(self.sub_path, filename)


class Color:
    """
        Class for color related manipulations
    """

    def __init__(self, image_path):
        self.palette = None
        self.sorted_colors = []
        self.background_color = None
        self.top_background_color = None
        self.color_thief = ColorThief(image_path)

    def _rgb_to_hsl(self, color):
        # https://gist.github.com/mathebox/e0805f72e7db3269ec22
        r, g, b = color
        r = float(r)
        g = float(g)
        b = float(b)
        high = max(r, g, b)
        low = min(r, g, b)
        h, s, v = ((high + low) / 2,) * 3

        if high == low:
            h = 0.0
            s = 0.0
        else:
            d = high - low
            s = d / (2 - high - low) if low > 0.5 else d / (high + low)  # noqa
            h = {
                r: (g - b) / d + (6 if g < b else 0),
                g: (b - r) / d + 2,
                b: (r - g) / d + 4,
            }[high]
            h /= 6
        # return h, s, v
        return v

    def _clamp(cls, val, minimum=0, maximum=255):
        if val < minimum:
            return minimum
        if val > maximum:
            return maximum
        return val

    def _colorscale(self, hexstr, scalefactor):
        """
        Scales a hex string by ``scalefactor``. Returns scaled hex string.

        To darken the color, use a float value between 0 and 1.
        To brighten the color, use a float value greater than 1.

        >>> _colorscale("#DF3C3C", .5)
        #6F1E1E
        >>> _colorscale("#52D24F", 1.6)
        #83FF7E
        >>> _colorscale("#4F75D2", 1)
        #4F75D2
        """

        hexstr = hexstr.strip('#')

        if scalefactor < 0 or len(hexstr) != 6:
            return hexstr

        r, g, b = int(hexstr[:2], 16), int(hexstr[2:4], 16), int(hexstr[4:], 16)

        r = int(self._clamp(r * scalefactor))
        g = int(self._clamp(g * scalefactor))
        b = int(self._clamp(b * scalefactor))

        return "#%02x%02x%02x" % (r, g, b)

    def sort_brightest_color(self):
        self.palette = self.color_thief.get_palette(color_count=2, quality=1)
        self.sorted_colors = sorted(self.palette, key=self._rgb_to_hsl, reverse=True)

    def process_colors(self):
        self.background_color = '#%02x%02x%02x' % self.sorted_colors[0]
        color = '#%02x%02x%02x' % self.sorted_colors[0]
        self.top_background_color = self._colorscale(color, 0.3)

    def quit(self):
        self.color_thief.image.close()
