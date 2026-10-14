#!/usr/bin/env python3
"""Keep the four primary navigation links consistent across static pages."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
BASE = '/narva-joesuu-winter-fest'
ROUTES = [
    ('/festival/', 'navFestival', ('Все активности', 'Kõik tegevused', 'All activities')),
    ('/winter-cup/', 'navCup', ('Командные соревнования', 'Võistkondlikud võistlused', 'Team competitions')),
    ('/programme/', 'navProgramme', ('Программа', 'Programm', 'Programme')),
    ('/visit/', 'navVisit', ('Практическая информация', 'Praktiline info', 'Practical information')),
]
LANGUAGES = ('ru', 'et', 'en')
MAIN_NAV = re.compile(r'(<nav class="desktop-nav"[^>]*>).*?(</nav>)', re.S)
MOBILE_NAV = re.compile(r'(<dialog[^>]*\bid="(?:site-menu|mobile-menu)"[^>]*>.*?<nav(?: class="site-menu-links")?>).*?(</nav>)', re.S)


def is_active(route: str, target: str) -> bool:
    related = ('/info/', '/traders/', '/volunteers/', '/partners/', '/contact/')
    return route.startswith(target) or (target == '/visit/' and route.startswith(related))


def links(language: str, route: str, mobile: bool) -> str:
    items = []
    for target, key, labels in ROUTES:
        href = BASE + ('' if language == 'ru' else '/' + language) + target
        label = labels[LANGUAGES.index(language)]
        css = 'site-menu-link' if mobile else 'site-nav-link'
        if is_active(route, target):
            css += ' is-active'
        current = ' aria-current="page"' if route == target else ''
        arrow = '<span class="site-menu-arrow" aria-hidden="true">↗</span>' if mobile else ''
        items.append(f'<a class="{css}" href="{href}" data-site-route="{target}"{current}>'
                     f'<span data-i18n="{key}">{label}</span>{arrow}</a>')
    return ''.join(items)


updated = 0
for file in DOCS.rglob('*.html'):
    source = file.read_text()
    match = re.search(r'<html\s+lang="(ru|et|en)"', source)
    if not match:
        continue
    language = match.group(1)
    parts = file.relative_to(DOCS).parts
    route_parts = parts[1:-1] if parts[0] in ('et', 'en') else parts[:-1]
    route = '/' + '/'.join(route_parts) + '/' if route_parts else '/'
    result, desktop_count = MAIN_NAV.subn(lambda m: m.group(1) + links(language, route, False) + m.group(2), source, count=1)
    result, mobile_count = MOBILE_NAV.subn(lambda m: re.sub(r'<nav(?: class="site-menu-links")?>$', '<nav class="site-menu-links">', m.group(1)) + links(language, route, True) + m.group(2), result, count=1)
    if desktop_count != 1 or mobile_count != 1:
        raise RuntimeError(f'Missing navigation in {file}: desktop={desktop_count}, mobile={mobile_count}')
    # The menu belongs to the two-day festival, even on pages about 23 January.
    result = result.replace('<p class="menu-meta">23.01.2027 · NARVA-JÕESUU</p>', '<p class="menu-meta">22–23.01.2027 · NARVA-JÕESUU</p>')
    result = result.replace('<div class="mobile-menu-bottom">23.01.2027<br>', '<div class="mobile-menu-bottom">22–23.01.2027<br>')
    if result != source:
        file.write_text(result)
        updated += 1

print(f'Updated navigation on {updated} pages.')
