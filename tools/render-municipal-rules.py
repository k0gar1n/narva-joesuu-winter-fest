# -*- coding: utf-8 -*-
"""Render the rules page and its PDF from the same three Markdown sources."""
from pathlib import Path
import re,html,shutil
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'output/pdf';OUT.mkdir(parents=True,exist_ok=True)
public=ROOT/'docs/assets/rules';public.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('Manrope',str(ROOT/'tools/fonts/Manrope-400.ttf')))
pdfmetrics.registerFont(TTFont('ManropeBold',str(ROOT/'tools/fonts/Manrope-700.ttf')))
BLUE=HexColor('#173DDA');NAVY=HexColor('#102A4C');GRAY=HexColor('#536577')
styles={
 'body':ParagraphStyle('Body',fontName='Manrope',fontSize=9.4,leading=13.7,textColor=NAVY,spaceAfter=8),
 'heading':ParagraphStyle('Heading',fontName='ManropeBold',fontSize=13,leading=17,textColor=NAVY,spaceBefore=13,spaceAfter=8,keepWithNext=True),
 'title':ParagraphStyle('Title',fontName='ManropeBold',fontSize=24,leading=29,textColor=NAVY,spaceAfter=12),
 'meta':ParagraphStyle('Meta',fontName='Manrope',fontSize=9,leading=13,textColor=GRAY,spaceAfter=8),
 'table':ParagraphStyle('Table',fontName='Manrope',fontSize=9.2,leading=13,textColor=NAVY),
}
def e(x):return html.escape(x)
def chunks(md):
 sections=[]
 for part in re.split(r'^## ',md,flags=re.M)[1:]:
  heading,body=part.split('\n',1);blocks=[]
  for block in re.split(r'\n\s*\n',body.strip()):
   if block.startswith('|'):
    rows=[[cell.strip() for cell in line.strip('|').split('|')] for line in block.splitlines() if not re.fullmatch(r'[| :\-]+',line)]
    blocks.append(('table',rows))
   else:blocks.append(('p',' '.join(block.splitlines())))
  sections.append((heading,blocks))
 return sections
for idx,lang in enumerate(['ru','et','en']):
 def t(*xs):return xs[idx]
 md=(ROOT/f'content/municipal-rules/{lang}.md').read_text();lines=md.splitlines();title=lines[0][2:];subtitle=lines[1];version=lines[2];sections=chunks(md)
 assert '[На согласовании' not in md
 pdfname=f'winter-cup-municipalities-rules-v1-{lang}.pdf';outfile=OUT/pdfname
 route='/winter-cup/municipalities/rules/';base='/narva-joesuu-winter-fest';prefix=base+('' if lang=='ru' else '/'+lang)
 canonical='https://www.winterfest.ee'+('' if lang=='ru' else '/'+lang)+route
 def footer(canvas,doc):
  canvas.saveState();w,h=doc.pagesize
  canvas.setFillColor(BLUE);canvas.rect(0,h-5,w,5,fill=1,stroke=0)
  canvas.setFont('ManropeBold',8);canvas.setFillColor(BLUE);canvas.drawString(48,h-32,'ESTONIA WINTER FEST')
  canvas.setFont('Manrope',8);canvas.setFillColor(GRAY);canvas.drawRightString(w-48,h-32,'22.01.2027 · NARVA-JÕESUU')
  canvas.setStrokeColor(HexColor('#cbd2d9'));canvas.line(48,44,w-48,44)
  canvas.setFont('Manrope',7.5);canvas.drawString(48,29,'winterfest.ee · info@winterfest.ee');canvas.drawRightString(w-48,29,f'v1.0  /  {doc.page}')
  canvas.restoreState()
 doc=SimpleDocTemplate(str(outfile),pagesize=(595.28,841.89),leftMargin=48,rightMargin=48,topMargin=58,bottomMargin=62,title=title,author='MTÜ Noorteaeg')
 story=[Paragraph(e(title),styles['title']),Paragraph(e(subtitle)+'<br/>'+e(version),styles['meta'])]
 htmlsections=[]
 for n,(heading,blocks) in enumerate(sections,1):
  if n in [3,6]:story.append(PageBreak())
  story.append(Paragraph(e(heading),styles['heading']))
  hb=[]
  for kind,value in blocks:
   if kind=='table':
    rows=[[Paragraph(e(cell),styles['table']) for cell in row] for row in value]
    table=Table(rows,colWidths=[385,114],hAlign='LEFT',repeatRows=1)
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#e9edf8')),('LINEBELOW',(0,0),(-1,-1),.4,HexColor('#cbd2d9')),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('VALIGN',(0,0),(-1,-1),'TOP')]))
    story.extend([table,Spacer(1,12)])
    hb.append('<table><thead><tr>'+''.join('<th scope="col">'+e(v)+'</th>' for v in value[0])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+e(v)+'</td>' for v in row)+'</tr>' for row in value[1:])+'</tbody></table>')
   else:
    story.append(Paragraph(e(value),styles['body']))
    hb.append('<p>'+e(value).replace('info@winterfest.ee','<a href="mailto:info@winterfest.ee">info@winterfest.ee</a>')+'</p>')
  htmlsections.append(f'<section id="rule-{n}"><h2>{e(heading)}</h2>'+''.join(hb)+'</section>')
 doc.build(story,onFirstPage=footer,onLaterPages=footer)
 shutil.copyfile(outfile,public/pdfname)
 page=ROOT/'docs'/('' if lang=='ru' else lang)/'winter-cup/municipalities/rules/index.html';page.parent.mkdir(parents=True,exist_ok=True)
 template=(page.parent.parent/'index.html').read_text()
 template=re.sub(r'<link[^>]*municipal\.css[^>]*>','',template)
 template=re.sub(r'<script[^>]*municipal\.js[^>]*></script>','',template)
 template=template.replace('</head>',f'<link rel="stylesheet" href="{base}/municipal-rules.css"><script defer src="{base}/municipal-rules.js"></script></head>')
 template=template.replace('data-route="/winter-cup/municipalities/"','data-route="/winter-cup/municipalities/rules/"')
 template=re.sub(r'<title>.*?</title>',f'<title>{e(title)} · {t("Общий регламент","Üldjuhend","General rules")}</title>',template)
 # Language switches point to this document; navigation links still point to category pages.
 template=re.sub(r'(<a\b[^>]*href=")([^"]*/municipalities/)("[^>]*data-language=)',lambda m:m[1]+m[2]+'rules/'+m[3],template)
 template=re.sub(r'(<link\b[^>]*rel="(?:canonical|alternate)"[^>]*href=")([^"]*/municipalities/)(")',lambda m:m[1]+m[2]+'rules/'+m[3],template)
 template=re.sub(r'(<meta property="og:url" content=")[^"]*',lambda m:m[1]+canonical,template)
 template=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m[1]+e(title)+' · '+t('Общий регламент','Üldjuhend','General rules'),template)
 main=f'''<main id="main" class="rules-page"><nav class="breadcrumbs" aria-label="{t('Навигация','Asukoht','Breadcrumbs')}"><a href="{prefix}/winter-cup/municipalities/">{t('Для самоуправлений','Omavalitsustele','For municipalities')}</a><span aria-hidden="true">/</span><span aria-current="page">{t('Регламент','Juhend','Rules')}</span></nav><header class="rules-heading"><p>ESTONIA WINTER FEST 2027</p><h1>{e(title)}</h1><div class="rules-meta"><span>{t('Общий регламент','Üldjuhend','General rules')}</span><span>{e(version)}</span></div><div class="rules-actions"><a class="button" href="{base}/assets/rules/{pdfname}" target="_blank" rel="noopener">{t('Скачать PDF','Laadi alla PDF','Download PDF')}<span aria-hidden="true">↗</span></a><button type="button" data-print-rules>{t('Распечатать','Prindi','Print')}</button></div></header><div class="rules-layout"><nav class="rules-toc" aria-label="{t('Оглавление','Sisukord','Contents')}"><p>{t('Содержание','Sisukord','Contents')}</p>{''.join(f'<a href="#rule-{n}">{e(h)}</a>' for n,(h,_) in enumerate(sections,1))}</nav><article class="rules-content">{''.join(htmlsections)}<a class="rules-back" href="{prefix}/winter-cup/municipalities/">{t('Вернуться к странице участия','Tagasi osalemise lehele','Back to participation information')} ↗</a></article></div></main>'''
 template=re.sub(r'<main\b.*?</main>',lambda _:main,template,flags=re.S);page.write_text(template)
 print(lang,outfile)
