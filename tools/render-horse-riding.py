"""Render the horse-riding activity, using the site's existing language shells."""
from pathlib import Path
import html
import json
import re
from home_activity_order import sort_home_activities

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / 'docs'
BASE = '/narva-joesuu-winter-fest'
ORIGIN = 'https://www.winterfest.ee'
ROUTE = '/festival/horse-riding/'
ASSET = BASE + '/assets/'

COPY = {
    'ru': {
        'name': 'Катание на лошадях и пони',
        'title': 'Катание<br>на лошадях<span>и пони</span>',
        'description': 'Катание на лошадях и пони на Winter Fest 23 января 2027 в Нарва-Йыэсуу. Для детей и взрослых. 5 € за катание, оплата на месте.',
        'intro': 'Зимний день, настоящие лошади и вы в седле. Приезжайте кататься всей семьёй.',
        'back': 'Все активности', 'date': '23 января 2027',
        'action': 'Как покататься', 'cost': 'Посчитать стоимость',
        'price': 'с человека за катание', 'pay': 'Оплата на месте',
        'photo': 'Ребёнок верхом на лошади в заснеженном лесу',
        'open': 'Открыть фотографию', 'close': 'Закрыть фотографию',
        'pet': 'Прокатить лошадку по странице', 'tip': 'Нажмите на лошадку',
        'when': 'Когда', 'who': 'Для кого', 'audience': 'Дети и взрослые', 'how': 'Участие',
        'onsite': 'На месте',
        'plan': 'Кто едет<br>с вами?',
        'planText': 'Выберите, сколько человек хочет прокатиться. На фестивале подойдите к зоне катания и оплатите прогулку на месте.',
        'adults': 'Взрослые', 'children': 'Дети', 'less': 'Уменьшить количество', 'more': 'Увеличить количество',
        'sum': 'Общая стоимость', 'costNote': 'Расчёт для одного катания на человека. Оплата на месте.',
        'herd': 'Три лошади.<br>И один пони.',
        'herdText': 'Они приедут на Winter Fest 23 января. Детям и взрослым найдётся компания для прогулки.',
        'horse': 'Лошадь', 'pony': 'Пони', 'herdTip': 'Коснитесь любой фигурки',
        'programme': 'Программа фестиваля', 'cardDescription': 'Дети и взрослые · 5 € · Оплата на месте',
    },
    'et': {
        'name': 'Hobuse- ja ponisõit',
        'title': 'Hobuse-<span>ja ponisõit</span>',
        'description': 'Hobuse- ja ponisõit Winter Festil 23. jaanuaril 2027 Narva-Jõesuus. Lastele ja täiskasvanutele. Üks sõit 5 €, tasumine kohapeal.',
        'intro': 'Talvine päev, päris hobused ja sina sadulas. Tulge kogu perega ratsutama.',
        'back': 'Kõik tegevused', 'date': '23. jaanuar 2027',
        'action': 'Kuidas osaleda', 'cost': 'Arvuta hind',
        'price': 'inimese kohta sõidu eest', 'pay': 'Tasumine kohapeal',
        'photo': 'Laps hobuse seljas lumises metsas',
        'open': 'Ava foto', 'close': 'Sulge foto',
        'pet': 'Pane hobune lehel liikuma', 'tip': 'Vajuta hobusele',
        'when': 'Millal', 'who': 'Kellele', 'audience': 'Lastele ja täiskasvanutele', 'how': 'Osalemine',
        'onsite': 'Kohapeal',
        'plan': 'Kes tuleb<br>sinuga?',
        'planText': 'Vali, mitu inimest soovib sõita. Festivalil tule hobuste juurde ja tasu sõidu eest kohapeal.',
        'adults': 'Täiskasvanud', 'children': 'Lapsed', 'less': 'Vähenda arvu', 'more': 'Suurenda arvu',
        'sum': 'Kokku', 'costNote': 'Arvestus ühe sõidu kohta inimesele. Tasumine kohapeal.',
        'herd': 'Kolm hobust.<br>Ja üks poni.',
        'herdText': 'Nad tulevad Winter Festile 23. jaanuaril. Ratsutama on oodatud nii lapsed kui ka täiskasvanud.',
        'horse': 'Hobune', 'pony': 'Poni', 'herdTip': 'Puuduta mõnda figuuri',
        'programme': 'Festivali programm', 'cardDescription': 'Lastele ja täiskasvanutele · 5 € · Tasumine kohapeal',
    },
    'en': {
        'name': 'Horse and pony rides',
        'title': 'Horse<span>&amp; pony rides</span>',
        'description': 'Horse and pony rides at Winter Fest on 23 January 2027 in Narva-Jõesuu. For children and adults. €5 per ride, paid on site.',
        'intro': 'A winter day, real horses and you in the saddle. Bring the family along for a ride.',
        'back': 'All activities', 'date': '23 January 2027',
        'action': 'How to take part', 'cost': 'Calculate the cost',
        'price': 'per person, per ride', 'pay': 'Pay on site',
        'photo': 'A child riding a horse in a snow-covered forest',
        'open': 'Open photograph', 'close': 'Close photograph',
        'pet': 'Make the horse move across the page', 'tip': 'Tap the horse',
        'when': 'When', 'who': 'For whom', 'audience': 'Children and adults', 'how': 'Taking part',
        'onsite': 'On site',
        'plan': 'Who is coming<br>with you?',
        'planText': 'Choose how many people would like a ride. At the festival, head to the riding area and pay there.',
        'adults': 'Adults', 'children': 'Children', 'less': 'Decrease number', 'more': 'Increase number',
        'sum': 'Total cost', 'costNote': 'One ride per person. Payment is on site.',
        'herd': 'Three horses.<br>And one pony.',
        'herdText': 'Meet them at Winter Fest on 23 January. Rides are available for children and adults.',
        'horse': 'Horse', 'pony': 'Pony', 'herdTip': 'Tap any figure',
        'programme': 'Festival programme', 'cardDescription': 'Children and adults · €5 · Pay on site',
    },
}


def langpath(lang):
    return '' if lang == 'ru' else '/' + lang


def local(lang, route):
    return BASE + langpath(lang) + route


def esc(value):
    return html.escape(value, quote=True)


def main(lang, c):
    return f'''<main id="main" class="horse-page">
    <section class="horse-hero" aria-labelledby="horse-title">
      <div class="horse-meta"><a class="horse-back" href="{local(lang, '/festival/')}"><span aria-hidden="true">←</span>{c['back']}</a><time datetime="2027-01-23">23.01.2027 · NARVA-JÕESUU</time></div>
      <div class="horse-hero-grid">
        <div class="horse-intro"><h1 class="horse-title" id="horse-title">{c['title']}</h1>
          <div class="horse-intro-track"><button class="horse-pet" type="button" aria-label="{c['pet']}"><img src="{ASSET}horse-ribbon.webp" width="768" height="512" alt=""></button></div>
        </div>
        <figure class="horse-frame"><div class="horse-photo"><img src="{ASSET}horse-riding.webp" width="990" height="614" alt="{c['photo']}" fetchpriority="high"></div><figcaption class="horse-price"><strong>5 €</strong><span>{c['price']}<br>{c['pay']}</span></figcaption></figure>
      </div>
    </section>
    <dl class="horse-facts"><div><dt>{c['when']}</dt><dd>{c['date']}</dd></div><div><dt>{c['who']}</dt><dd>{c['audience']}</dd></div><div><dt>{c['how']}</dt><dd>{c['pay']}</dd></div></dl>
    <nav class="horse-related" aria-label="{c['back']}"><a href="{local(lang, '/festival/')}">{c['back']}<span class="brand-arrow" aria-hidden="true"></span></a><a href="{local(lang, '/programme/')}?day=23">{c['programme']}<span class="brand-arrow" aria-hidden="true"></span></a></nav>
    </main>'''


def card(lang, c, homepage=False):
    if homepage:
        return f'''<article class="activity activity-horse" data-reveal=""><a class="activity-card-link" href="{local(lang, ROUTE)}" data-site-route="{ROUTE}"><div class="photo-wrap"><img src="{ASSET}horse-riding.webp" width="990" height="614" alt="{c['photo']}" data-alt="horseRidingAlt" loading="lazy"></div><div class="activity-caption"><h3 data-i18n="horseRidingTitle">{c['name']}</h3><img class="activity-figure" src="{ASSET}horse-ribbon.webp" width="100" height="86" alt="" loading="lazy"><span class="activity-arrow" aria-hidden="true">↗</span></div></a></article>'''
    return f'''<article class="experience-tile tile-horse" data-category="family"><a href="{local(lang, ROUTE)}"><div class="tile-photo"><img src="{ASSET}horse-riding.webp" width="990" height="614" alt="{c['photo']}" loading="lazy" decoding="async"></div><div class="tile-caption"><h2>{c['name']}</h2><img class="activity-figure" src="{ASSET}horse-ribbon.webp" width="100" height="86" alt="" loading="lazy"><span class="tile-arrow" aria-hidden="true">↗</span></div></a></article>'''


for lang, c in COPY.items():
    folder = DOCS / langpath(lang).lstrip('/')
    source = (folder / 'festival/ski-lessons/index.html').read_text()
    source = re.sub(r'<main\b.*?</main>', main(lang, c), source, flags=re.S)
    source = source.replace('ski-lessons.css', 'horse-riding.css').replace('ski-lessons.js', 'horse-riding.js')
    source = source.replace('/festival/ski-lessons/', ROUTE)
    source = source.replace('class="subpage "', 'class="subpage horse-activity-page"')
    source = re.sub(r'<script type="application/ld\+json"[^>]*>.*?</script>', '', source, flags=re.S)
    source = re.sub(r'<title>.*?</title>', f'<title>{c["name"]} | Winter Fest 2027</title>', source)
    source = re.sub(r'<meta name="description"[^>]*>', f'<meta name="description" content="{esc(c["description"])}">', source)
    source = re.sub(r'<meta property="og:title"[^>]*>', f'<meta property="og:title" content="{esc(c["name"])} | Winter Fest 2027">', source)
    source = re.sub(r'<meta property="og:description"[^>]*>', f'<meta property="og:description" content="{esc(c["description"])}">', source)
    source = re.sub(r'<meta property="og:image"[^>]*>', f'<meta property="og:image" content="{ORIGIN}/assets/horse-riding.webp">', source)
    event = {'@context': 'https://schema.org', '@type': 'Event', 'name': c['name'], 'description': c['description'], 'startDate': '2027-01-23', 'endDate': '2027-01-23', 'url': ORIGIN + langpath(lang) + ROUTE, 'image': ORIGIN + '/assets/horse-riding.webp', 'inLanguage': lang, 'isAccessibleForFree': False, 'eventStatus': 'https://schema.org/EventScheduled', 'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode', 'location': {'@type': 'Place', 'name': 'Winter Fest, Narva-Jõesuu', 'address': {'@type': 'PostalAddress', 'addressLocality': 'Narva-Jõesuu', 'addressCountry': 'EE'}}, 'organizer': {'@type': 'Organization', 'name': 'MTÜ Noorteaeg', 'url': ORIGIN}, 'offers': {'@type': 'Offer', 'price': 5, 'priceCurrency': 'EUR', 'url': ORIGIN + langpath(lang) + ROUTE}}
    source = source.replace('</head>', '<script type="application/ld+json">' + json.dumps(event, ensure_ascii=False).replace('<', '\\u003c') + '</script></head>')
    dest = folder / ROUTE.strip('/') / 'index.html'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(source)

    for relative in ['festival/index.html', 'festival/family/index.html', 'index.html']:
        f = folder / relative
        text = f.read_text()
        # Re-running the renderer replaces only our own activity card.
        text = re.sub(r'<article class="(?:experience-tile tile-horse|activity activity-horse)".*?</article>', '', text, flags=re.S)
        if relative == 'festival/index.html':
            text, count = re.subn(r'(<article class="experience-tile tile-family".*?</article>)', lambda m: m[0] + card(lang, c), text, count=1, flags=re.S)
        elif relative == 'festival/family/index.html':
            text, count = re.subn(r'(<div class="related-grid">)', lambda m: m[0] + card(lang, c), text, count=1)
        else:
            text, count = re.subn(r'(<div class="sports-grid">)', lambda m: m[0] + card(lang, c, homepage=True), text, count=1)
        if count != 1:
            raise ValueError(f'Insertion anchor missing in {f}')
        if relative == 'index.html':
            text = sort_home_activities(text)
        f.write_text(text)

    f = folder / 'programme/index.html'
    text = f.read_text()
    text = re.sub(r'<a class="agenda-row"[^>]*href="[^"]*/festival/horse-riding/".*?</a>', '', text, flags=re.S)
    period = {'ru': 'С СЕМЬЁЙ', 'et': 'KOOS PEREGA', 'en': 'WITH FAMILY'}[lang]
    row = f'<a class="agenda-row" data-days="23" data-category="family" href="{local(lang, ROUTE)}"><img class="agenda-illustration" src="{ASSET}horse-ribbon.webp" width="96" height="96" alt="" loading="lazy"><div class="agenda-period"><span>{period}</span></div><div><h2>{c["name"]}</h2><p>{c["cardDescription"]}</p></div><span class="agenda-arrow" aria-hidden="true">↗</span></a>'
    text, count = re.subn(r'(<a class="agenda-row"[^>]*href="[^"]*/festival/family/".*?</a>)', lambda m: m[0] + row, text, count=1, flags=re.S)
    if count != 1:
        raise ValueError(f'Programme insertion anchor missing in {f}')
    f.write_text(text)

# Keep the search index current without rebuilding unrelated pages.
f = DOCS / 'sitemap.xml'
text = f.read_text()
text = re.sub(r'\s*<url><loc>[^<]*/festival/horse-riding/</loc>.*?</url>', '', text, flags=re.S)
entries = []
for lang in COPY:
    alternates = ''.join(f'<xhtml:link rel="alternate" hreflang="{other}" href="{ORIGIN}{langpath(other)}{ROUTE}"/>' for other in COPY)
    entries.append(f'  <url><loc>{ORIGIN}{langpath(lang)}{ROUTE}</loc>{alternates}<xhtml:link rel="alternate" hreflang="x-default" href="{ORIGIN}/et{ROUTE}"/></url>')
f.write_text(text.replace('</urlset>', '\n'.join(entries) + '\n</urlset>'))
print('Rendered horse-riding pages and activity links in RU, ET and EN.')
