"""Append missing catalogue activities to the existing mobile homepage strip."""
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser
import json
import re
from home_activity_order import sort_home_activities

DOCS = Path(__file__).resolve().parent.parent / 'docs'
BASE = '/narva-joesuu-winter-fest'
translations = {}


class Attributes(HTMLParser):
    def handle_starttag(self, tag, attrs):
        self.values = dict(attrs)


def attributes(tag):
    parser = Attributes()
    parser.feed(tag)
    return parser.values


for lang in ('ru', 'et', 'en'):
    folder = DOCS if lang == 'ru' else DOCS / lang
    home = folder / 'index.html'
    text = re.sub(r'<article\b[^>]*data-mobile-activity="true"[^>]*>.*?</article>', '', home.read_text(), flags=re.S)
    originals = list(re.finditer(r'<article class="activity\b[^"]*"[^>]*>.*?</article>', text, re.S))
    if not originals:
        raise ValueError(f'Homepage activity strip missing: {home}')
    existing = {re.search(r'<a\b[^>]*href="([^"]+)"', m[0])[1] for m in originals}
    additions = []
    copy = {}
    catalogue = (folder / 'festival/index.html').read_text()
    for tile in re.findall(r'<article class="experience-tile\b[^"]*"[^>]*>.*?</article>', catalogue, re.S):
        href = re.search(r'<a\b[^>]*href="([^"]+)"', tile)[1]
        if href in existing:
            continue
        route = href.removeprefix(BASE).removeprefix('' if lang == 'ru' else '/' + lang)
        slug = route.strip('/').split('/')[-1]
        key = 'mobileActivity' + ''.join(part.title() for part in slug.split('-'))
        title = unescape(re.sub('<[^>]*>', '', re.search(r'<h2\b[^>]*>(.*?)</h2>', tile, re.S)[1]))
        photo = attributes(re.search(r'<img\b[^>]*>', tile)[0])
        src = photo['src']
        smaller = src.replace('-1600.', '-800.')
        if (DOCS / smaller.removeprefix(BASE + '/')).exists():
            src = smaller
        if src.endswith('/ski-lessons.jpg'):
            src = BASE + '/assets/ski-lessons-1600.webp'
        figure = re.search(r'<img\b[^>]*class="activity-figure"[^>]*>', tile)
        figure = figure[0] if figure else f'<img class="activity-figure" src="{BASE}/assets/21-finish-arch.webp" width="100" height="86" alt="" loading="lazy">'
        additions.append(f'<article class="activity activity-{slug} mobile-extra" data-mobile-activity="true" data-reveal=""><a class="activity-card-link" href="{href}" data-site-route="{route}"><div class="photo-wrap"><img src="{src}" width="{photo.get("width", "800")}" height="{photo.get("height", "450")}" alt="{escape(photo.get("alt", title), quote=True)}" data-alt="{key}Alt" loading="lazy"></div><div class="activity-caption"><h3 data-i18n="{key}Title">{escape(title)}</h3>{figure}<span class="activity-arrow" aria-hidden="true">↗</span></div></a></article>')
        copy[key + 'Title'] = title
        copy[key + 'Alt'] = photo.get('alt', title)
        existing.add(href)
    end = originals[-1].end()
    home.write_text(sort_home_activities(text[:end] + ''.join(additions) + text[end:]))
    translations[lang] = copy
    print(f'{lang}: added {len(additions)} mobile cards')

dictionary = DOCS / 'translations.js'
text = re.sub(r'\n// BEGIN mobile activity catalogue\n.*?// END mobile activity catalogue\n', '', dictionary.read_text(), flags=re.S)
text += '\n// BEGIN mobile activity catalogue\n'
for lang in ('et', 'en'):
    text += f'Object.assign(window.WF_TRANSLATIONS.{lang},' + json.dumps(translations[lang], ensure_ascii=False) + ');\n'
text += '// END mobile activity catalogue\n'
dictionary.write_text(text)
