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

const seoPage=(titles,descriptions,image='hero-1600.webp',about='festival')=>({titles,descriptions,image,about});
const pages={
 '':seoPage(
  ['Estonia Winter Fest — зимний фестиваль 23 января 2027, Нарва-Йыэсуу','Estonia Winter Fest — talvefestival Narva-Jõesuus 23.01.2027','Estonia Winter Fest — winter festival in Narva-Jõesuu, 23 January 2027'],
  ['Крупнейший зимний фестиваль Эстонии в Нарва-Йыэсуу 23 января 2027: спорт, ярмарка, бани, каток и музыка. Вход свободный. Winter Cup — 22 января.','Eesti suurim talvefestival Narva-Jõesuus 23. jaanuaril 2027: sport, laat, saunad, liuväli ja muusika. Sissepääs tasuta. Winter Cup toimub 22. jaanuaril.','Estonia’s largest winter festival in Narva-Jõesuu on 23 January 2027: sport, market, saunas, skating and music. Free entry. Winter Cup is on 22 January.']),
 'festival/':seoPage(
  ['Активности Winter Fest 2027 — спорт, каток, бани и ярмарка','Winter Fest 2027 tegevused — sport, liuväli, saunad ja laat','Winter Fest 2027 activities — sport, skating, saunas and market'],
  ['Все активности Estonia Winter Fest 23 января в Нарва-Йыэсуу: каток у моря, лыжи, ярмарка, банная деревня, семейные занятия и концерт.','Kõik Estonia Winter Festi tegevused 23. jaanuaril Narva-Jõesuus: mereäärne liuväli, suusatamine, laat, saunaküla, peretegevused ja kontsert.','All Estonia Winter Fest activities in Narva-Jõesuu on 23 January: seaside skating, skiing, winter market, sauna village, family activities and concert.']),
 'festival/ski-lessons/':seoPage(
  ['Бесплатные уроки лыж для начинающих в Нарва-Йыэсуу','Tasuta suusatunnid algajatele Narva-Jõesuus','Free beginner ski lessons in Narva-Jõesuu'],
  ['Бесплатные уроки беговых лыж 23 января 2027 в Нарва-Йыэсуу. Дети и взрослые, четыре группы по 25 человек. Лыжи, палки и ботинки предоставляются.','Tasuta murdmaasuusatunnid 23. jaanuaril 2027 Narva-Jõesuus. Laste ja täiskasvanute rühmad, varustus on kohapeal olemas. Vajalik registreerimine.','Free cross-country ski lessons in Narva-Jõesuu on 23 January 2027. Groups for children and adults, with skis, poles and boots provided. Registration required.'],'ski-lessons-1600.webp'),
 'festival/skating/':seoPage(
  ['Каток у моря в Нарва-Йыэсуу — 23–24 января 2027','Mereäärne liuväli Narva-Jõesuus — 23.–24.01.2027','Seaside ice rink in Narva-Jõesuu — 23–24 January 2027'],
  ['Открытый зимний каток в центре Estonia Winter Fest. 23 и 24 января, 11:00–20:00. Можно прийти со своими коньками или взять их напрокат.','Estonia Winter Festi mereäärne väliliuväli on avatud 23. ja 24. jaanuaril kell 11–20. Tule oma uiskudega või laenuta need kohapeal.','The outdoor seaside rink at Estonia Winter Fest is open 23 and 24 January, 11:00–20:00. Bring your own skates or rent a pair on site.'],'skates-1600.webp'),
 'festival/market/':seoPage(
  ['Зимняя ярмарка в Нарва-Йыэсуу 23 января 2027','Talvelaat Narva-Jõesuus 23. jaanuaril 2027','Winter market in Narva-Jõesuu on 23 January 2027'],
  ['Большая зимняя ярмарка у моря: горячие напитки, уличная еда, местные продукты, подарки и зимние украшения. 23 января, 11:00–20:00. Вход свободный.','Suur mereäärne talvelaat kuumade jookide, tänavatoidu, kohalike toodete, kingituste ja talvekaunistustega. 23. jaanuaril kell 11–20. Sissepääs tasuta.','A large seaside winter market with hot drinks, street food, local produce, gifts and winter decorations. 23 January, 11:00–20:00. Free entry.'],'market-1600.webp'),
 'festival/warmth/':seoPage(
  ['Банная деревня на Estonia Winter Fest в Нарва-Йыэсуу','Saunaküla Estonia Winter Festil Narva-Jõesuus','Sauna village at Estonia Winter Fest in Narva-Jõesuu'],
  ['Бани, тёплые зоны и места для отдыха на зимнем фестивале 23 января 2027 в Нарва-Йыэсуу. Условия посещения и расписание будут опубликованы здесь.','Saunad, soojad alad ja puhkekohad talvefestivalil Narva-Jõesuus 23. jaanuaril 2027. Külastustingimused ja ajakava avaldatakse siin.','Saunas, warm areas and places to rest at the winter festival in Narva-Jõesuu on 23 January 2027. Visiting details and times will be published here.'],'sauna-1600.webp'),
 'festival/music/':seoPage(
  ['Концерт Estonia Winter Fest 2027 в Нарва-Йыэсуу','Estonia Winter Fest 2027 kontsert Narva-Jõesuus','Estonia Winter Fest 2027 concert in Narva-Jõesuu'],
  ['Концертная и вечерняя программа зимнего фестиваля у моря 23 января 2027 в Нарва-Йыэсуу. Артисты и точное расписание появятся после подтверждения.','Mereäärse talvefestivali kontsert ja õhtuprogramm Narva-Jõesuus 23. jaanuaril 2027. Esinejad ja täpne ajakava lisatakse pärast kinnitamist.','Concert and evening programme at the seaside winter festival in Narva-Jõesuu on 23 January 2027. Artists and exact times will follow.'],'concert-1600.webp'),
 'winter-cup/':seoPage(
  ['Winter Cup — командные соревнования 22 января 2027','Winter Cup — talvised võistkonnamängud 22.01.2027','Winter Cup — winter team games, 22 January 2027'],
  ['Командные зимние игры в Нарва-Йыэсуу 22 января 2027. Категории для компаний, самоуправлений и всех желающих. Выберите свою категорию.','Talvised võistkonnamängud Narva-Jõesuus 22. jaanuaril 2027. Kategooriad ettevõtetele, omavalitsustele ja kõigile soovijatele.','Winter team games in Narva-Jõesuu on 22 January 2027. Categories for companies, municipalities and everyone else. Choose your team category.'],'cup-1600.webp','cup'),
 'winter-cup/business/':seoPage(
  ['Winter Cup для компаний и организаций — 22 января 2027','Winter Cup ettevõtetele ja organisatsioonidele — 22.01.2027','Winter Cup for companies and organisations — 22 January 2027'],
  ['Зимний командный день для коллег в Нарва-Йыэсуу. Пять участников, совместные испытания, питание, бани и концерт. Условия и регистрация.','Talvine meeskonnapäev kolleegidele Narva-Jõesuus. Viis osalejat, ühised ülesanded, toitlustus, saunad ja kontsert. Tingimused ja registreerimine.','A winter team day for colleagues in Narva-Jõesuu. Five participants, shared challenges, meals, saunas and a concert. Details and registration.'],'cup-1600.webp','cup'),
 'winter-cup/municipalities/':seoPage(
  ['Winter Cup для самоуправлений — командные игры 22 января 2027','Winter Cup omavalitsustele — võistkonnamängud 22.01.2027','Winter Cup for municipalities — team games, 22 January 2027'],
  ['Зимние игры для сотрудников самоуправлений и подведомственных учреждений в Нарва-Йыэсуу. Команда из пяти человек. Условия и регистрация.','Talvemängud omavalitsuste ja nende allasutuste töötajatele Narva-Jõesuus. Viieliikmeline võistkond. Tingimused ja registreerimine.','Winter games for municipal and affiliated institution employees in Narva-Jõesuu. Teams of five. Participation details and registration.'],'cup-1600.webp','cup'),
 'winter-cup/open/':seoPage(
  ['Winter Cup для всех желающих — командные игры 22 января 2027','Winter Cup kõigile — talvised võistkonnamängud 22.01.2027','Winter Cup for everyone — winter team games, 22 January 2027'],
  ['Соберите пятерых друзей на зимние игры в Нарва-Йыэсуу. Можно зарегистрироваться одному, вдвоём, втроём, вчетвером или полной командой.','Tulge sõpradega talvistele võistkonnamängudele Narva-Jõesuusse. Registreeruda saab üksi, väiksema seltskonna või täisvõistkonnaga.','Join winter team games in Narva-Jõesuu with friends. Register alone, with a smaller group or as a full five-person team.'],'cup-1600.webp','cup'),
 'programme/':seoPage(
  ['Программа Estonia Winter Fest — 22–23 января 2027','Estonia Winter Festi programm — 22.–23.01.2027','Estonia Winter Fest programme — 22–23 January 2027'],
  ['22 января — командные соревнования Winter Cup. 23 января — открытый фестиваль: ярмарка, каток, бани, спорт и концерт в Нарва-Йыэсуу.','22. jaanuaril toimub Winter Cup. 23. jaanuaril on avatud festival: laat, liuväli, saunad, sport ja kontsert Narva-Jõesuus.','Winter Cup takes place on 22 January. The open festival on 23 January brings a market, skating, saunas, sport and music to Narva-Jõesuu.']),
 'visit/':seoPage(
  ['Поездка на Estonia Winter Fest в Нарва-Йыэсуу','Estonia Winter Festi külastus Narva-Jõesuus','Plan your visit to Estonia Winter Fest in Narva-Jõesuu'],
  ['Как добраться до Нарва-Йыэсуу, где остановиться и что посмотреть рядом с Estonia Winter Fest 22–23 января 2027.','Kuidas tulla Narva-Jõesuusse, kus ööbida ja mida Estonia Winter Festi külastuse ajal vaadata 22.–23. jaanuaril 2027.','How to reach Narva-Jõesuu, where to stay and what to see around Estonia Winter Fest on 22–23 January 2027.'],'coast-1600.webp'),
 'visit/travel/':seoPage(
  ['Как приехать на Winter Fest из Таллина, Нарвы и других городов','Kuidas tulla Winter Festile Tallinnast, Narvast ja mujalt','Getting to Winter Fest from Tallinn, Narva and elsewhere'],
  ['Маршрут из Таллина в Нарва-Йыэсуу на автомобиле, автобусе или поезде через Нарву. Дорога, пересадки и практическая информация для гостей фестиваля.','Juhised Tallinnast Narva-Jõesuusse autoga, bussiga või rongiga Narva kaudu. Teekond, ümberistumised ja praktiline info festivali külastajale.','Travel from Tallinn to Narva-Jõesuu by car, bus or train via Narva. Route, connections and practical information for festival visitors.'],'coast-1600.webp'),
 'visit/stay/':seoPage(
  ['Где остановиться на Winter Fest в Нарва-Йыэсуу','Kus ööbida Winter Festi ajal Narva-Jõesuus','Where to stay for Winter Fest in Narva-Jõesuu'],
  ['Отели, спа и апартаменты в Нарва-Йыэсуу на даты Estonia Winter Fest 22–23 января 2027. Ссылки на варианты размещения и советы по бронированию.','Hotellid, spaad ja apartemendid Narva-Jõesuus Estonia Winter Festi ajaks 22.–23. jaanuaril 2027. Majutuslingid ja broneerimissoovitused.','Hotels, spas and apartments in Narva-Jõesuu for Estonia Winter Fest on 22–23 January 2027, with accommodation links and booking tips.'],'coast-1600.webp'),
 'info/':seoPage(
  ['Полезная информация для гостей Estonia Winter Fest 2027','Kasulik info Estonia Winter Fest 2027 külastajale','Visitor information for Estonia Winter Fest 2027'],
  ['Вход, цены, одежда, доступность и ответы на частые вопросы о зимнем фестивале 23 января 2027 в Нарва-Йыэсуу.','Sissepääs, hinnad, riietus, ligipääsetavus ja vastused küsimustele Narva-Jõesuu talvefestivali kohta 23. jaanuaril 2027.','Entry, prices, clothing, accessibility and answers to common questions about the winter festival in Narva-Jõesuu on 23 January 2027.']),
 'traders/':seoPage(
  ['Регистрация торговцев на Winter Market 2027 в Нарва-Йыэсуу','Kauplejate registreerimine Winter Market 2027 laadale Narva-Jõesuus','Trader applications for Winter Market 2027 in Narva-Jõesuu'],
  ['Заявка для торговцев, производителей и фудтраков на большую зимнюю ярмарку Estonia Winter Fest 23 января 2027 в Нарва-Йыэсуу.','Kauplejate, tootjate ja toiduautode avaldus Estonia Winter Festi suurele talvelaadale Narva-Jõesuus 23. jaanuaril 2027.','Application for traders, producers and food trucks to join the large Estonia Winter Fest market in Narva-Jõesuu on 23 January 2027.'],'market-1600.webp'),
 'volunteers/':seoPage(
  ['Стать волонтёром Estonia Winter Fest 2027','Tule Estonia Winter Fest 2027 vabatahtlikuks','Volunteer at Estonia Winter Fest 2027'],
  ['Регистрация волонтёров на Estonia Winter Fest в Нарва-Йыэсуу. Помощь гостям, спортивным зонам, сцене и организации фестиваля.','Vabatahtlike registreerimine Estonia Winter Festile Narva-Jõesuus. Abi külalistele, spordialadele, lavale ja festivali korraldusele.','Volunteer registration for Estonia Winter Fest in Narva-Jõesuu. Help visitors, activity areas, the stage and festival operations.']),
 'winter-run/':seoPage(
  ['Winter Run — зимний забег в Нарва-Йыэсуу 23 января 2027','Winter Run — talvejooks Narva-Jõesuus 23.01.2027','Winter Run — winter race in Narva-Jõesuu, 23 January 2027'],
  ['Зимний забег у моря в Нарва-Йыэсуу: 3,5 км, 7 км и детский забег 300 м. Медаль на финише, электронный хронометраж, бани и концерт фестиваля.','Mereäärne talvejooks Narva-Jõesuus: 3,5 km, 7 km ja 300 m lastejooks. Finišimedal, elektrooniline ajavõtt, saunad ja festivali kontsert.','A seaside winter race in Narva-Jõesuu: 3.5 km, 7 km and a 300 m children’s run. Finish medal, electronic timing, saunas and festival concert.'],'winter-run-wide.webp','run'),
 'winter-run/participant-info/':seoPage(
  ['Winter Run — информация участнику зимнего забега','Winter Run — osaleja info','Winter Run — participant information'],
  ['Получение номера, старт, гардероб, душ, бани, награждение и другие важные детали Winter Run 23 января 2027 в Нарва-Йыэсуу.','Numbri väljastamine, start, riietusruum, dušš, saunad, autasustamine ja muu oluline info Winter Runil 23. jaanuaril 2027.','Bib collection, start, changing area, showers, saunas, awards and practical details for Winter Run in Narva-Jõesuu on 23 January 2027.'],'winter-run-wide.webp','run'),
 'winter-run/programme/':seoPage(
  ['Winter Run — программа забега 23 января 2027','Winter Run — jooksupäeva programm 23.01.2027','Winter Run — race-day programme, 23 January 2027'],
  ['Выдача номеров, детский старт, забеги на 7 и 3,5 км и награждение Winter Run в Нарва-Йыэсуу.','Numbrite väljastamine, lastejooks, 7 ja 3,5 km stardid ning Winter Runi autasustamine Narva-Jõesuus.','Bib collection, children’s run, 7 km and 3.5 km starts, and Winter Run awards in Narva-Jõesuu.'],'winter-run-wide.webp','run'),
 'winter-run/route/':seoPage(
  ['Маршрут Winter Run — 3,5 и 7 км в Нарва-Йыэсуу','Winter Runi rada — 3,5 ja 7 km Narva-Jõesuus','Winter Run route — 3.5 km and 7 km in Narva-Jõesuu'],
  ['Карта зимнего забега по улицам Aia и Vabaduse вдоль побережья Нарва-Йыэсуу. Один круг — 3,5 км, два круга — 7 км.','Talvejooksu kaart Aia tänaval ja Vabaduse tänava kergliiklusteel mööda Narva-Jõesuu rannikut. Üks ring 3,5 km, kaks ringi 7 km.','Winter race map along Aia Street and the Vabaduse path on the Narva-Jõesuu coast. One lap is 3.5 km and two laps are 7 km.'],'winter-run-route.webp','run'),
 'winter-run/rules/':seoPage(
  ['Winter Run 2027 — правила зимнего забега','Winter Run 2027 — talvejooksu juhend','Winter Run 2027 — winter race rules'],
  ['Правила участия, дистанции, безопасность, результаты, награждение и условия отмены Winter Run 23 января 2027 в Нарва-Йыэсуу.','Winter Runi osalemistingimused, distantsid, ohutus, tulemused, autasustamine ja ärajäämise tingimused 23. jaanuaril 2027.','Participation rules, distances, safety, results, awards and cancellation terms for Winter Run in Narva-Jõesuu on 23 January 2027.'],'winter-run-wide.webp','run')
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const organization={'@type':'Organization','@id':origin+'/#organizer',name:'MTÜ Noorteaeg',url:'https://noorteaeg.ee',email:'info@winterfest.ee',logo:{'@type':'ImageObject',url:origin+'/favicon-192.png',width:192,height:192}};
const website={'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Estonia Winter Fest',alternateName:['Winter Fest','Винтер Фест','Estonia Winter Fest 2027'],inLanguage:langs,publisher:{'@id':organization['@id']}};
const venue={
 '@type':'Place',name:'Suur-Lootsi kultuurikvartal',
 address:{'@type':'PostalAddress',addressLocality:'Narva-Jõesuu',addressRegion:'Ida-Virumaa',addressCountry:'EE'}
};
const events={
 festival:{'@type':'Festival','@id':origin+'/#festival',name:'Estonia Winter Fest 2027',alternateName:['Winter Fest','Винтер Фест'],startDate:'2027-01-23',endDate:'2027-01-23',eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',url:origin+'/',image:[origin+'/assets/hero-1600.webp'],location:venue,organizer:{'@id':organization['@id']},isAccessibleForFree:true,audience:{'@type':'Audience',geographicArea:{'@type':'Country',name:'Estonia'}}},
 cup:{'@type':'SportsEvent','@id':origin+'/winter-cup/#event',name:'Winter Cup 2027',startDate:'2027-01-22',endDate:'2027-01-22',eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',url:origin+'/winter-cup/',image:[origin+'/assets/cup-1600.webp'],location:venue,organizer:{'@id':organization['@id']}},
 run:{'@type':'SportsEvent','@id':origin+'/winter-run/#event',name:'Winter Run 2027',startDate:'2027-01-23T12:00:00+02:00',endDate:'2027-01-23T13:30:00+02:00',eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',url:origin+'/winter-run/',image:[origin+'/assets/winter-run-wide.webp'],location:venue,organizer:{'@id':organization['@id']}}
};
for(const [route,data] of Object.entries(pages))for(const [i,lang] of langs.entries()){
 const f=path.join(docs,lang==='ru'?'':lang,route,'index.html');let html=await fs.readFile(f,'utf8');
 html=html.replace(/<title>.*?<\/title>/s,'').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g,'').replace(/<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/g,'').replace(/<script[^>]*id="wf-search-data"[^>]*>.*?<\/script>/sg,'');
 const canonical=url(lang,route),image=origin+'/assets/'+data.image,event=events[data.about];
 const webPage={'@type':'WebPage','@id':canonical+'#page',url:canonical,name:data.titles[i],description:data.descriptions[i],inLanguage:lang,isPartOf:{'@id':website['@id']},about:event?{'@id':event['@id']}:{'@id':events.festival['@id']},primaryImageOfPage:{'@type':'ImageObject',url:image}};
 const graph=[organization,website,webPage];
 if((data.about==='festival'&&route==='')||(data.about==='cup'&&route==='winter-cup/')||(data.about==='run'&&route==='winter-run/'))graph.push(event);
 let head=`<title>${esc(data.titles[i])}</title>\n<meta name="description" content="${esc(data.descriptions[i])}">\n<link rel="canonical" href="${canonical}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n`;
 head+=langs.map(l=>`<link rel="alternate" hreflang="${l}" href="${url(l,route)}">`).join('\n');
 head+=`\n<link rel="alternate" hreflang="x-default" href="${url('et',route)}">\n<meta property="og:type" content="website"><meta property="og:site_name" content="Estonia Winter Fest"><meta property="og:title" content="${esc(data.titles[i])}"><meta property="og:description" content="${esc(data.descriptions[i])}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta property="og:locale" content="${{ru:'ru_EE',et:'et_EE',en:'en_GB'}[lang]}"><meta name="twitter:card" content="summary_large_image">\n<script type="application/ld+json" id="wf-search-data">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>\n`;
 await fs.writeFile(f,html.replace('</head>',head+'</head>'));
}

// Google Search needs a crawlable, stable favicon URL. Data URLs are not used here.
const iconHead=`<link rel="icon" type="image/svg+xml" href="${base}/favicon.svg"><link rel="icon" type="image/png" sizes="48x48" href="${base}/favicon-48.png"><link rel="shortcut icon" href="${base}/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="${base}/apple-touch-icon.png"><link rel="manifest" href="${base}/site.webmanifest">`;
for(const f of await walkHtml(docs)){
 let html=await fs.readFile(f,'utf8');
 html=html.replace(/<link\b[^>]*rel="(?:icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>/gi,'');
 html=html.replace('</head>',iconHead+'</head>');
 if(/Правила будут опубликованы позже|Reeglid avaldatakse hiljem|Rules will be published later/.test(html)){
  html=html.replace(/<meta\b[^>]*name="robots"[^>]*>/gi,'').replace('</head>','<meta name="robots" content="noindex,follow">'+'</head>');
 }
 await fs.writeFile(f,html);
}

const indexableRoutes=[...new Set([...Object.keys(pages),'festival/family/','festival/skiing/','festival/sports/','visit/explore/','partners/','contact/','winter-cup/municipalities/rules/'])];
const sitemap=indexableRoutes.map(route=>`  <url><loc>${url('ru',route)}</loc>${langs.map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${url(l,route)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${url('et',route)}"/></url>`).join('\n');
await fs.writeFile(path.join(docs,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemap}\n</urlset>\n`);
await fs.writeFile(path.join(docs,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Prepared ${Object.keys(pages).length*langs.length} priority pages, favicon links and sitemap.`);

async function walkHtml(dir){
 const files=[];
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const p=path.join(dir,entry.name);
  if(entry.isDirectory())files.push(...await walkHtml(p));
  else if(entry.isFile()&&entry.name.endsWith('.html'))files.push(p);
 }
 return files;
}
