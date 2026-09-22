# -*- coding: utf-8 -*-
"""Publish discipline rules or pending pages from municipal-cup.json.
Set rulesSections[lang] to [{heading, paragraphs: [...]}] and rulesPdf[lang]
to the published PDF asset URL when each discipline is approved.
"""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parent.parent
D=json.loads((ROOT/'content/municipal-cup.json').read_text())
def esc(v):return html.escape(str(v),quote=True)
for idx,lang in enumerate(['ru','et','en']):
 def t(*v):return v[idx]
 base='/narva-joesuu-winter-fest';prefix=base+('' if lang=='ru' else '/'+lang)
 for sport in D['disciplines']:
  route='/winter-cup/municipalities/disciplines/'+sport['id']+'/'
  source=ROOT/'docs'/('' if lang=='ru' else lang)/'winter-cup/municipalities/rules/index.html'
  page=ROOT/'docs'/('' if lang=='ru' else lang)/route.strip('/')/'index.html';page.parent.mkdir(parents=True,exist_ok=True)
  s=source.read_text().replace('/winter-cup/municipalities/rules/',route)
  name=sport['name'][idx];title=name+' — '+t('регламент','juhend','rules')+' · Winter Cup'
  s=re.sub(r'<title>.*?</title>',lambda _:f'<title>{esc(title)}</title>',s)
  s=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m[1]+esc(title),s)
  sections=sport.get('rulesSections',{}).get(lang,[]);pdf=sport['rulesPdf'].get(lang)
  download=f'<a class="button" href="{esc(pdf)}" target="_blank" rel="noopener">{t("Скачать PDF","Laadi alla PDF","Download PDF")}</a>' if pdf else '<p class="discipline-pdf-pending">'+t('PDF можно будет скачать после публикации регламента.','PDF-faili saab alla laadida pärast juhendi avaldamist.','The PDF will be available to download once the rules are published.')+'</p>'
  toc=''.join(f'<a href="#section-{i}">{esc(x["heading"])}</a>' for i,x in enumerate(sections))
  body=''.join(f'<section id="section-{i}"><h2>{esc(x["heading"])}</h2>'+''.join('<p>'+esc(p)+'</p>' for p in x['paragraphs'])+'</section>' for i,x in enumerate(sections))
  if not body:body='<section><h2>'+t('Регламент появится позднее','Juhend avaldatakse hiljem','Rules will be published later')+'</h2><p>'+t('Здесь будут условия участия, порядок прохождения испытания и подсчёт баллов.','Siia lisame osalemistingimused, ala läbiviimise korra ja punktiarvestuse.','This page will contain participation conditions, the challenge format and scoring.')+'</p></section>'
  main=f'''<main id="main" class="rules-page discipline-rules"><header class="rules-heading"><div class="discipline-heading"><div><p class="discipline-context">{t('Winter Cup для самоуправлений','Winter Cup omavalitsustele','Winter Cup for municipalities')}</p><h1>{esc(name)}</h1></div><img src="{base}/assets/{sport['icon']}" alt="" width="120" height="120"></div><div class="rules-actions">{download}</div></header><div class="rules-layout"><nav class="rules-toc" aria-label="{t('Разделы','Jaotised','Sections')}">{toc}<a href="{prefix}/winter-cup/municipalities/#sports">{t('Все дисциплины','Kõik alad','All disciplines')}</a><a href="{prefix}/winter-cup/municipalities/rules/">{t('Общий регламент','Üldjuhend','General rules')}</a></nav><article class="rules-content">{body}<a class="rules-back" href="{prefix}/winter-cup/municipalities/#sports">{t('Вернуться к дисциплинам','Tagasi alade juurde','Back to disciplines')}</a></article></div></main>'''
  s=re.sub(r'<main\b.*?</main>',lambda _:main,s,flags=re.S);page.write_text(s)
print('Rendered',len(D['disciplines'])*3,'discipline rule pages')
