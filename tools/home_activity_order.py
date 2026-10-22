"""Keep the homepage activity order identical across languages and viewports."""
from pathlib import Path
import re

ACTIVITY_ORDER = [
    '/festival/skating/',
    '/festival/music/',
    '/festival/warmth/',
    '/festival/market/',
    '/festival/ski-lessons/',
    '/winter-run/',
    '/festival/skiing/',
    '/festival/sports/',
    '/festival/horse-riding/',
    '/festival/family/',
]


def sort_home_activities(text):
    cards = list(re.finditer(r'<article class="activity\b[^"]*"[^>]*>.*?</article>', text, re.S))
    if not cards:
        raise ValueError('Homepage activity cards not found')

    def rank(card):
        route = re.search(r'data-site-route="([^"]+)"', card[0])[1]
        return ACTIVITY_ORDER.index(route) if route in ACTIVITY_ORDER else len(ACTIVITY_ORDER)

    return text[:cards[0].start()] + ''.join(c[0] for c in sorted(cards, key=rank)) + text[cards[-1].end():]


if __name__ == '__main__':
    docs = Path(__file__).resolve().parent.parent / 'docs'
    for lang in ('', 'et', 'en'):
        file = docs / lang / 'index.html'
        file.write_text(sort_home_activities(file.read_text()))
        print(f'{lang or "ru"}: homepage activities reordered')
