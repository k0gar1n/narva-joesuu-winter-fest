#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render the three-language Winter Run section. Existing festival shell is reused."""
from pathlib import Path
import re, json, html
ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/'docs'
BASE='/narva-joesuu-winter-fest'
DOMAIN='https://www.winterfest.ee'
SLUGS=['','programme/','route/','participant-info/','rules/']
D=json.loads((ROOT/'tools/winter-run-content.json').read_text())

def h(s): return html.escape(str(s),quote=True)
def path(lang,slug=''): return ('/' if lang=='ru' else f'/{lang}/')+'winter-run/'+slug
def href(lang,slug=''): return BASE+path(lang,slug)
def site(lang,slug): return BASE+('/' if lang=='ru' else f'/{lang}/')+slug

def render(lang,d,idx):
    template=(DOCS/('' if lang=='ru' else lang)/'festival/ski-lessons/index.html').read_text()
    shell=template[template.index('<body'):template.index('<main')]
    shell=shell.replace('class="subpage "','class="subpage run-page"').replace('/festival/ski-lessons/', '/winter-run/'+SLUGS[idx])
    shell=shell.replace(' aria-current="page" data-i18n="navFestival"',' data-i18n="navFestival"')
    url=DOMAIN+path(lang,SLUGS[idx]); title='Winter Run · '+(d['title'] if idx==0 else d['nav'][idx])
    core=template[template.index('<meta charset'):template.index('<title>')]
    alternates=''.join(f'<link rel="alternate" hreflang="{l}" href="{DOMAIN+path(l,SLUGS[idx])}">' for l in D)
    head=f'<!DOCTYPE html><html lang="{lang}"><head>{core}<title>{h(title)} | Winter Fest</title><meta name="description" content="{h(d["desc"])}"><link rel="canonical" href="{url}">{alternates}<link rel="alternate" hreflang="x-default" href="{DOMAIN+path("et",SLUGS[idx])}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="website"><meta property="og:title" content="{h(title)}"><meta property="og:description" content="{h(d["desc"])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{DOMAIN}/assets/winter-run-wide.webp"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="{BASE}/winter-run.css"><script defer src="{BASE}/winter-run.js"></script><script>window.fientaSettings={{link_selector:"a.fienta-embed",background:"rgba(7,27,57,.78)",border_radius:"0"}};</script><script defer src="https://fienta.com/embed.js"></script>'
    schema={'@context':'https://schema.org','@type':'SportsEvent' if idx==0 else 'WebPage','name':title,'description':d['desc'],'url':url,'inLanguage':lang}
    if idx==0:
        schema.update(startDate='2027-01-23T12:00:00+02:00',eventStatus='https://schema.org/EventScheduled',eventAttendanceMode='https://schema.org/OfflineEventAttendanceMode',image=DOMAIN+'/assets/winter-run-wide.webp',sport='Running',location={'@type':'Place','name':'Narva-Jõesuu sadam','address':{'@type':'PostalAddress','streetAddress':'Suur-Lootsi 4','addressLocality':'Narva-Jõesuu','addressRegion':'Ida-Virumaa','addressCountry':'EE'}},organizer={'@type':'Organization','name':'MTÜ Noorteaeg','url':'https://noorteaeg.ee'})
    head+='<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script></head>'
    fienta='https://fienta.com/'+('ru' if lang=='ru' else 'et')+'/winter-run-2027-talvine-jooks'
    cta=f'<a class="run-cta fienta-embed" href="{fienta}">{d["register"]}<span aria-hidden="true">↗</span></a>'
    links=''.join(f'<a href="{href(lang,s)}"'+(' aria-current="page"' if j==idx else '')+f'><span>{d["nav"][j]}</span><span aria-hidden="true">↗</span></a>' for j,s in enumerate(SLUGS))
    sidebar=f'<aside class="run-sidebar"><a class="run-mark" href="{href(lang)}"><span>ESTONIA</span>WINTER<br> RUN</a><button type="button" class="run-menu-toggle" aria-expanded="false" aria-controls="run-sections">{d["menu"]}<span aria-hidden="true">+</span></button><nav id="run-sections" aria-label="Winter Run">{links}</nav><div class="run-side-bottom"><span>23.01.2027</span><a href="{site(lang,"festival/")}">Winter Fest ↗</a></div></aside>'
    sectionhead=f'<header class="run-page-heading"><div><p class="run-kicker">WINTER RUN · 23.01.2027</p><h1>{d["nav"][idx]}</h1></div>{cta}</header>'
    if idx==0:
        cards=''
        for j,(dist,time) in enumerate([('3,5' if lang!='en' else '3.5','12:40'),('7','12:30'),('300','12:00')]):
            unit=d['km'] if j<2 else ('м' if lang=='ru' else 'm')
            cards+=f'<a class="run-distance" href="{href(lang,"route/")}#distance-{j}"><span class="run-distance-name">{d["kids"] if j==2 else d["lap"][j]}</span><strong>{dist}<small>{unit}</small></strong><span>{d["start"]} {time}<i aria-hidden="true">↗</i></span></a>'
        benefits=''.join(f'<details class="run-benefit" name="run-benefits"><summary><span class="run-benefit-icon" aria-hidden="true">{["✳","≈","♪"][j]}</span>{h(t)}<span class="run-plus" aria-hidden="true">+</span></summary><p>{h(text)}</p></details>' for j,(t,text) in enumerate(d['benefits']))
        content=f'<section class="run-hero"><picture><source media="(max-width: 700px)" srcset="{BASE}/assets/winter-run-tall.webp"><img src="{BASE}/assets/winter-run-wide.webp" width="1672" height="941" alt="{h(d["title"])}" fetchpriority="high"></picture><div class="run-hero-copy"><p>{d["date"]}</p><h1><span>ESTONIA</span>WINTER RUN</h1><p>{d["place"]}</p>{cta}</div><a class="run-hero-price" href="{href(lang,"participant-info/")}#fees"><span>{d["price"]}</span><strong data-run-price data-early="10" data-late="15">10 €</strong><small data-run-price-label data-early="{h(d["until"])}" data-late="{h(d["after"])}">{d["until"]}</small></a></section><div class="run-distances">{cards}</div><section class="run-after"><h2>{d["included"]}</h2><div>{benefits}</div></section>'
    elif idx==1:
        rows=''.join(f'<li><time>{time}</time><div><h2>{h(name)}</h2><p>{h(text)}</p></div></li>' for time,name,text in d['times'])
        content=sectionhead+f'<ol class="run-timeline">{rows}</ol><div class="run-bottom-note"><p>{d["scheduleNote"]}</p><a class="run-text-link" href="{site(lang,"programme/")}">{d["festival"]} ↗</a></div>'
    elif idx==2:
        buttons=''.join(f'<button id="distance-{j}" type="button" data-run-distance="{j}" aria-pressed="{str(j==0).lower()}" aria-controls="distance-description">{["3,5 "+d["km"] if lang!="en" else "3.5 km","7 "+d["km"],d["kids"]][j]}</button>' for j in range(3))
        content=sectionhead+f'<div class="run-route-layout"><div class="run-map-panel"><button class="run-map-open" aria-label="{d["zoom"]}"><img src="{BASE}/assets/winter-run-route.webp" alt="{h(d["map"])}" width="1054" height="1536"><span>{d["zoom"]} ⤢</span></button></div><div class="run-route-info"><p class="run-lead">{d["routeIntro"]}</p><div class="run-course-tabs" role="group" aria-label="{d["nav"][2]}">{buttons}</div><p id="distance-description" class="run-course-description" aria-live="polite">{d["routeDetails"][0]}</p><script type="application/json" id="run-course-data">{json.dumps(d["routeDetails"],ensure_ascii=False)}</script><p class="run-map-note">{d["mapNote"]}</p><a class="run-text-link" href="{BASE}/assets/winter-run-route.png" download>{d["download"]} ↓</a></div></div><dialog class="run-map-dialog" aria-label="{h(d["map"])}"><div class="run-map-tools"><button data-map-close>{d["close"]} ×</button><div><button data-map-zoom="-" aria-label="−">−</button><button data-map-reset>{d["reset"]}</button><button data-map-zoom="+" aria-label="+">+</button></div></div><div class="run-map-scroll"><img src="{BASE}/assets/winter-run-route.png" alt="{h(d["map"])}" width="1054" height="1536"></div></dialog>'
    elif idx==3:
        rows=''.join(f'<details class="run-info-item"'+(' open' if j==0 else '')+f'><summary>{h(t)}<span aria-hidden="true">+</span></summary><p>{h(text)}</p></details>' for j,(t,text) in enumerate(d['info']))
        content=sectionhead+f'<p class="run-lead">{d["infoIntro"]}</p><div id="fees" class="run-fees"><div><span>{d["adult"]}</span><strong><span data-run-price data-early="10" data-late="15">10 €</span></strong></div><div><span>{d["kids"]}</span><strong><span data-run-price data-early="5" data-late="8">5 €</span></strong></div><p>{d["fees"]}</p></div><div class="run-accordions">{rows}</div><div class="run-bottom-note"><a class="run-text-link" href="{site(lang,"visit/travel/")}">{d["travel"]} ↗</a><a class="run-text-link" href="{href(lang,"rules/")}">{d["nav"][4]} ↗</a></div>'
    else:
        rows=''.join(f'<details class="run-info-item"><summary><span>{j+1}. {h(t)}</span><span aria-hidden="true">+</span></summary><p>{h(text)}</p></details>' for j,(t,text) in enumerate(d['rules']))
        content=sectionhead+f'<div class="run-rules-tools"><p>{d["rulesIntro"]}</p><button class="run-text-link" data-run-print>{d["print"]} ↗</button></div><div class="run-accordions run-rules">{rows}</div>'
    footer=f'<footer class="run-footer"><a href="{site(lang,"")}"><img src="{BASE}/assets/wordmark-horizontal-blue.svg" width="132" height="40" alt="Estonia Winter Fest"></a><a href="mailto:info@winterfest.ee">info@winterfest.ee</a><a href="{site(lang,"privacy/")}">{dict(ru="Данные и приватность",et="Privaatsus",en="Privacy")[lang]}</a></footer>'
    out=head+shell+'<main id="main" class="run-layout">'+sidebar+'<div class="run-content">'+content+footer+'</div></main></body></html>'
    dest=DOCS/path(lang,SLUGS[idx]).strip('/')/'index.html'; dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(out)

for lang,d in D.items():
    for idx in range(5): render(lang,d,idx)
    catalog=DOCS/('' if lang=='ru' else lang)/'festival/index.html'
    s=catalog.read_text()
    tile=f'<article class="experience-tile tile-winter-run" data-category="sport"><a href="{href(lang)}"><div class="tile-photo"><img src="{BASE}/assets/winter-run-wide.webp" width="1672" height="941" alt="{h(d["title"])}" loading="lazy"></div><div class="tile-caption"><h2>Winter Run · 3,5 / 7 km</h2><span class="tile-arrow" aria-hidden="true">↗</span></div></a></article>'
    if 'tile-winter-run' not in s: s=s.replace('<div class="experiences">','<div class="experiences">'+tile)
    catalog.write_text(s)
sitemap=DOCS/'sitemap.xml'; s=sitemap.read_text()
for lang in D:
    for slug in SLUGS:
        url=DOMAIN+path(lang,slug)
        if '<loc>'+url+'</loc>' not in s: s=s.replace('</urlset>',f'  <url><loc>{url}</loc></url>\n</urlset>')
sitemap.write_text(s)
print('Rendered 15 pages, activity links and sitemap.')
