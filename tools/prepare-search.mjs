// Local authoring tool: NODE_PATH must point to a runtime with Playwright.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(import.meta.dirname,'..'),docs=path.join(root,'docs');
const base='/narva-joesuu-winter-fest',origin='https://www.winterfest.ee';
const langs=['ru','et','en'];
const home=l=>l==='ru'?'/':`/${l}/`;
const url=(l,route='')=>origin+home(l)+route;
const source=await fs.readFile(path.join(docs,'index.html'),'utf8');
// Capture the existing translations, without inventing or rewriting visible copy.
const server=http.createServer(async(req,res)=>{
 try{let p=new URL(req.url,'http://localhost').pathname;if(p.startsWith(base))p=p.slice(base.length)||'/';if(p.endsWith('/'))p+='index.html';const f=path.join(docs,p);res.setHeader('Content-Type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'application/octet-stream');res.end(await fs.readFile(f));}catch{res.writeHead(404);res.end();}
}).listen(0,'127.0.0.1');
await new Promise(r=>server.once('listening',r));
const browser=await chromium.launch({headless:true,channel:"chrome"});
const view=await browser.newPage();
const translations={};
for(const lang of langs){
 await view.goto(`http://127.0.0.1:${server.address().port}/?lang=${lang}`);
 await view.waitForFunction(l=>document.documentElement.lang===l,lang);
 translations[lang]=await view.evaluate(()=>({
  text:Object.fromEntries([...document.querySelectorAll('[data-i18n],[data-i18n-html]')].map(e=>[e.dataset.i18n||e.dataset.i18nHtml,e.innerHTML])),
  alt:Object.fromEntries([...document.querySelectorAll('[data-alt]')].map(e=>[e.dataset.alt,e.alt])),
  label:Object.fromEntries([...document.querySelectorAll('[data-label]')].map(e=>[e.dataset.label,e.getAttribute('aria-label')]))
 }));
}
const context=await browser.newContext({javaScriptEnabled:false});
const page=await context.newPage();
await page.route('**/*',r=>r.abort());
for(const lang of langs){
 await page.setContent(source,{waitUntil:'domcontentloaded'});
 await page.evaluate(({lang,copy,base})=>{
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n],[data-i18n-html]').forEach(e=>e.innerHTML=copy.text[e.dataset.i18n||e.dataset.i18nHtml]);
  document.querySelectorAll('[data-alt]').forEach(e=>e.alt=copy.alt[e.dataset.alt]);
  document.querySelectorAll('[data-label]').forEach(e=>e.setAttribute('aria-label',copy.label[e.dataset.label]));
  document.querySelectorAll('[data-lang]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.lang===lang)));
  document.querySelectorAll('[data-site-route]').forEach(e=>e.setAttribute('href',base+(lang==='ru'?'':'/'+lang)+e.dataset.siteRoute));
 },{lang,copy:translations[lang],base});
 const dest=path.join(docs,lang==='ru'?'':lang,'index.html');await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,await page.content());
}
await browser.close();server.close();

const pages={
 '':{
  titles:['Estonia Winter Fest — зимний фестиваль 23 января 2027, Нарва-Йыэсуу','Estonia Winter Fest — talvefestival Narva-Jõesuus 23.01.2027','Estonia Winter Fest — winter festival in Narva-Jõesuu, 23 January 2027'],
  descriptions:['Зимний фестиваль в Нарва-Йыэсуу, Ида-Вирумаа, 23 января 2027: спорт, ярмарка, бани и музыка. Вход свободный. Winter Cup для команд — 22 января.','Talvefestival Narva-Jõesuus, Ida-Virumaal 23. jaanuaril 2027: sport, laat, saunad ja muusika. Sissepääs tasuta. Winter Cupi võistkonnavõistlused 22. jaanuaril.','Winter festival in Narva-Jõesuu, Ida-Virumaa, Estonia on 23 January 2027: sport, market, saunas and music. Free entry. Winter Cup team games on 22 January.']},
 'winter-cup/':{
  titles:['Winter Cup — командные соревнования 22 января 2027 | Estonia Winter Fest','Winter Cup — talvised võistkonnamängud 22.01.2027 | Estonia Winter Fest','Winter Cup — winter team games, 22 January 2027 | Estonia Winter Fest'],
  descriptions:['Командные зимние игры в Нарва-Йыэсуу, Ида-Вирумаа, 22 января 2027. Категории для организаций, самоуправлений и всех желающих. Выберите свою категорию.','Talvised võistkonnamängud Narva-Jõesuus, Ida-Virumaal 22. jaanuaril 2027. Ettevõtetele, omavalitsustele ja kõigile soovijatele. Valige oma kategooria.','Winter team games in Narva-Jõesuu, Estonia on 22 January 2027. Categories for companies, municipalities and everyone else. Choose your team category.']},
 'winter-cup/business/':{
  titles:['Winter Cup для компаний и организаций — 22 января 2027','Winter Cup ettevõtetele ja organisatsioonidele — 22.01.2027','Winter Cup for companies and organisations — 22 January 2027'],
  descriptions:['Зимний командный день для коллег в Нарва-Йыэсуу, Ида-Вирумаа. Пять участников, совместные испытания, питание, бани и концерт. Условия и регистрация.','Talvine meeskonnapäev kolleegidele Narva-Jõesuus, Ida-Virumaal. Viis osalejat, ühised ülesanded, toitlustus, saunad ja kontsert. Tingimused ja registreerimine.','A winter team day for colleagues in Narva-Jõesuu, Estonia. Five participants, shared challenges, meals, saunas and a concert. Details and registration.']},
 'winter-cup/municipalities/':{
  titles:['Winter Cup для самоуправлений — командные игры 22 января 2027','Winter Cup omavalitsustele — võistkonnamängud 22.01.2027','Winter Cup for municipalities — team games, 22 January 2027'],
  descriptions:['Зимние игры для сотрудников самоуправлений и подведомственных учреждений в Нарва-Йыэсуу. Команда из пяти человек. Условия, испытания и регистрация.','Talvemängud omavalitsuste ja nende allasutuste töötajatele Narva-Jõesuus. Viieliikmeline võistkond. Osalemistingimused, ülesanded ja registreerimine.','Winter games for municipal and affiliated institution employees in Narva-Jõesuu, Estonia. Teams of five. Participation details, challenges and registration.']},
 'winter-cup/open/':{
  titles:['Winter Cup для всех желающих — командные игры 22 января 2027','Winter Cup kõigile — talvised võistkonnamängud 22.01.2027','Winter Cup for everyone — winter team games, 22 January 2027'],
  descriptions:['Соберите пятерых друзей на зимние игры в Нарва-Йыэсуу. Испытания, питание, бани и концерт. Можно записаться одному или неполной командой.','Tulge viie sõbraga talvistele võistkonnamängudele Narva-Jõesuusse. Mängud, toitlustus, saunad ja kontsert. Osaleda saab ka üksi või väiksema seltskonnaga.','Bring five friends to winter team games in Narva-Jõesuu. Challenges, meals, saunas and a concert. You can also register solo or with a smaller group.']}
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const organization={'@type':'Organization','@id':origin+'/#organizer',name:'MTÜ Noorteaeg',url:'https://noorteaeg.ee',email:'info@winterfest.ee'};
for(const [route,data] of Object.entries(pages))for(const [i,lang] of langs.entries()){
 const f=path.join(docs,lang==='ru'?'':lang,route,'index.html');let html=await fs.readFile(f,'utf8');
 html=html.replace(/<title>.*?<\/title>/s,'').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g,'').replace(/<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/g,'').replace(/<script[^>]*id="wf-search-data"[^>]*>.*?<\/script>/sg,'');
 const canonical=url(lang,route),image=origin+'/assets/'+(route?'cup-1600.webp':'hero-1600.webp');
 const event={'@type':route?'SportsEvent':'Festival','@id':origin+(route?'/winter-cup/#event':'/#festival'),name:route?'Winter Cup 2027':'Estonia Winter Fest 2027',startDate:route?'2027-01-22':'2027-01-23',endDate:route?'2027-01-22':'2027-01-23',eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',url:url(lang,route?'winter-cup/':''),image:[image],location:{'@type':'Place',name:'Narva-Jõesuu',address:{'@type':'PostalAddress',addressLocality:'Narva-Jõesuu',addressRegion:'Ida-Virumaa',addressCountry:'EE'}},organizer:{'@id':organization['@id']}};
 if(!route)event.isAccessibleForFree=true;
 const graph=[organization,{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Estonia Winter Fest',inLanguage:langs,publisher:{'@id':organization['@id']}},{'@type':'WebPage','@id':canonical+'#page',url:canonical,name:data.titles[i],description:data.descriptions[i],inLanguage:lang,isPartOf:{'@id':origin+'/#website'},about:{'@id':event['@id']}}];
 if(!route||route==='winter-cup/')graph.push(event);
 let head=`<title>${esc(data.titles[i])}</title>\n<meta name="description" content="${esc(data.descriptions[i])}">\n<link rel="canonical" href="${canonical}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n`;
 head+=langs.map(l=>`<link rel="alternate" hreflang="${l}" href="${url(l,route)}">`).join('\n');
 head+=`\n<link rel="alternate" hreflang="x-default" href="${url('et',route)}">\n<meta property="og:type" content="website"><meta property="og:site_name" content="Estonia Winter Fest"><meta property="og:title" content="${esc(data.titles[i])}"><meta property="og:description" content="${esc(data.descriptions[i])}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta property="og:locale" content="${{ru:'ru_EE',et:'et_EE',en:'en_GB'}[lang]}"><meta name="twitter:card" content="summary_large_image">\n<script type="application/ld+json" id="wf-search-data">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>\n`;
 await fs.writeFile(f,html.replace('</head>',head+'</head>'));
}
const urls=[...Object.keys(pages), 'festival/ski-lessons/'].flatMap(route=>langs.map(l=>url(l,route)));
await fs.writeFile(path.join(docs,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')+'\n</urlset>\n');
await fs.writeFile(path.join(docs,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Prepared 15 priority pages and sitemap.');
