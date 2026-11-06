import { readFile, writeFile, mkdir } from 'node:fs/promises';
const base='/narva-joesuu-winter-fest';
const root=new URL('../docs/',import.meta.url);
const copy={
 ru:{title:'Лыжный заезд у моря',description:'WINTER SKI в Нарва-Йыэсуу, 23 января 2027. Дистанции 3 и 5 км, детский заезд 500 м. Маршрут, программа, стоимость и регламент.',date:'23 января 2027',month:'ЯНВАРЯ',day:'Суббота',place:'Нарва-Йыэсуу, Эстония',intro:'Лыжный заезд<br> вдоль моря.',register:'Зарегистрироваться',notOpen:'Регистрация ещё не открыта',distances:'Дистанции',choose:'Выберите дистанцию',km:'км',m:'м',adult:'Лыжный заезд',kids:'Детский заезд',distanceNote:'3 и 5 км вдоль побережья.<br>Для детей — отдельный заезд 500 м.',distanceLabel:'Выбранная дистанция',pricesLink:'Участие и цены',route:'Маршрут',programme:'Программа',prices:'Цены',rules:'Регламент',info:'Информация участникам',routeTitle:'Трасса у моря',routeCopy:'Побережье Нарва-Йыэсуу',routePending:'Подробная схема маршрута готовится.',routeButton:'Открыть карту',programmeTitle:'День заезда',programmePending:'Расписание стартов опубликуем позже.',calendar:'Добавить в календарь',pricesTitle:'Стоимость участия',pricesPending:'Цены и сроки регистрации уточняются.',priceColumn:'Стоимость',pending:'Уточняется',rulesTitle:'Полный регламент',rulesPending:'Регламент готовится. Здесь появятся правила участия и проведения заезда.',rulesButton:'Читать регламент',included:'Для участников',medal:'Медаль на финише',medalSub:'Каждому финишеру',concert:'Концерт',sauna:'Сауна',free:'Бесплатно для участников',question:'Есть вопрос о заезде?',contact:'Напишите организаторам',photo:'Лыжники на заснеженном морском берегу',poster:'Афиша WINTER SKI',posterOpen:'Посмотреть афишу',close:'Закрыть',tabLabel:'Информация о заезде',back:'К фестивалю',selected:'Выбрано'},
 et:{title:'Suusasõit mere ääres',description:'WINTER SKI Narva-Jõesuus 23. jaanuaril 2027. 3 ja 5 km distantsid ning 500 m lastesõit. Rada, ajakava, osalustasud ja juhend.',date:'23. jaanuar 2027',month:'JAANUAR',day:'Laupäev',place:'Narva-Jõesuu, Eesti',intro:'Suusasõit<br> mere ääres.',register:'Registreeru',notOpen:'Registreerimine ei ole veel avatud',distances:'Distantsid',choose:'Vali distants',km:'km',m:'m',adult:'Suusasõit',kids:'Lastesõit',distanceNote:'3 ja 5 km piki rannikut.<br>Lastele eraldi 500 m sõit.',distanceLabel:'Valitud distants',pricesLink:'Osalemine ja hinnad',route:'Rada',programme:'Ajakava',prices:'Hinnad',rules:'Juhend',info:'Osaleja info',routeTitle:'Rada mere ääres',routeCopy:'Narva-Jõesuu rannik',routePending:'Täpne rajakaart on koostamisel.',routeButton:'Ava rajakaart',programmeTitle:'Sõidupäev',programmePending:'Stardiajad avaldame hiljem.',calendar:'Lisa kalendrisse',pricesTitle:'Osalustasud',pricesPending:'Hinnad ja registreerimistähtajad on täpsustamisel.',priceColumn:'Osalustasu',pending:'Täpsustamisel',rulesTitle:'Võistlusjuhend',rulesPending:'Juhend on koostamisel. Siia lisame osalemise ja suusasõidu korraldamise reeglid.',rulesButton:'Loe juhendit',included:'Osalejatele',medal:'Medal finišis',medalSub:'Igale lõpetajale',concert:'Kontsert',sauna:'Saun',free:'Osalejatele tasuta',question:'Küsimus suusasõidu kohta?',contact:'Kirjuta korraldajatele',photo:'Suusatajad lumisel mererannal',poster:'WINTER SKI plakat',posterOpen:'Vaata plakatit',close:'Sulge',tabLabel:'Suusasõidu info',back:'Festivalile',selected:'Valitud'},
 en:{title:'Seaside cross-country skiing',description:'WINTER SKI in Narva-Jõesuu on 23 January 2027. 3 km and 5 km distances and a 500 m children’s race. Route, programme, entry fees and rules.',date:'23 January 2027',month:'JANUARY',day:'Saturday',place:'Narva-Jõesuu, Estonia',intro:'Cross-country skiing.<br> By the sea.',register:'Register',notOpen:'Registration is not open yet',distances:'Distances',choose:'Choose your distance',km:'km',m:'m',adult:'Ski race',kids:'Children’s race',distanceNote:'3 and 5 km along the coast.<br>A separate 500 m race for children.',distanceLabel:'Selected distance',pricesLink:'Entry and fees',route:'Route',programme:'Programme',prices:'Entry fees',rules:'Rules',info:'Participant information',routeTitle:'A course by the sea',routeCopy:'Narva-Jõesuu coastline',routePending:'The detailed route map is being prepared.',routeButton:'View route map',programmeTitle:'Race day',programmePending:'Start times will be published later.',calendar:'Add to calendar',pricesTitle:'Entry fees',pricesPending:'Fees and registration deadlines are being finalised.',priceColumn:'Entry fee',pending:'To be confirmed',rulesTitle:'Full race rules',rulesPending:'The rules are being prepared. Participation requirements and race rules will be published here.',rulesButton:'Read race rules',included:'For participants',medal:'A finisher’s medal',medalSub:'For every finisher',concert:'Concert',sauna:'Sauna',free:'Free for participants',question:'A question about the race?',contact:'Contact the organisers',photo:'Cross-country skiers on a snowy seashore',poster:'WINTER SKI poster',posterOpen:'View poster',close:'Close',tabLabel:'Race information',back:'Back to the festival',selected:'Selected'}
};
const arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.7"/></svg>';
const svgDocument='<svg viewBox="0 0 96 120" fill="none" aria-hidden="true"><path d="M12 3h48l24 24v90H12V3Z" stroke="currentColor" stroke-width="2"/><path d="M60 3v24h24M28 51h40M28 65h40M28 79h25" stroke="currentColor" stroke-width="2"/></svg>';
for(const [lang,c] of Object.entries(copy)){
 const prefix=lang==='ru'?'':`/${lang}`, url=`https://www.winterfest.ee${prefix}/skiing/`;
 const shell=await readFile(new URL(`${lang==='ru'?'':lang+'/'}contact/index.html`,root),'utf8');
 let header=shell.slice(shell.indexOf('<header'),shell.indexOf('<main'));
 header=header.replaceAll('/contact/" lang=', '/skiing/" lang=');
 // Language links are separate from the shared navigation.
 header=header.replace(/(<a\b[^>]*href=")[^"]+("[^>]*data-language="(?:ru|et|en)"[^>]*>)/g,(match,a,b)=>{
  const target=b.match(/data-language="(\w+)"/)[1];return a+base+(target==='ru'?'':'/'+target)+'/skiing/'+b;
 });
 header=header.replace(/ class="([^"]*)is-active([^"]*)"/g,' class="$1$2"').replaceAll(' aria-current="page"','');
 const footer=shell.slice(shell.indexOf('<footer'),shell.indexOf('</footer>')+9);
 const registration=(extra='')=>`<a class="ski-register fienta-embed ${extra}" href="https://fienta.com/${lang==='ru'?'ru':'et'}/214887">${c.register}${arrow}</a>`;
 const priceCopy={
 ru:{now:'Сейчас',range:'Участники 21–100',first:'Первые 20 участников',sold:'Распродано',next:'Участники 101–200',last:'С 201-го участника и на месте',main:'3 и 5 км',child:'Детский заезд · 500 м',later:'Следующие этапы',note:'Стоимость зависит от количества зарегистрированных участников.'},
 et:{now:'Praegu',range:'Osalejad 21–100',first:'Esimesed 20 osalejat',sold:'Välja müüdud',next:'Osalejad 101–200',last:'Alates 201. osalejast ja kohapeal',main:'3 ja 5 km',child:'Lastesõit · 500 m',later:'Järgmised hinnavoorud',note:'Osalustasu sõltub registreerunud osalejate arvust.'},
 en:{now:'Current price',range:'Participants 21–100',first:'First 20 participants',sold:'Sold out',next:'Participants 101–200',last:'From participant 201 and on site',main:'3 and 5 km',child:'Children’s race · 500 m',later:'Next price tiers',note:'The entry fee depends on the number of registered participants.'}
 }[lang];
 const tabs=['distances','route','programme','prices','rules'];
 const poster=`${base}/assets/winter-ski/poster-${lang}-${lang==='en'?'v2':'desktop'}.webp`;
 const desktopPoster=lang==='en'?poster:`${base}/assets/winter-ski/poster-${lang}-wide.webp`;
 const posterAlt=`WINTER SKI. ${c.date}. Narva-Jõesuu. 3 ${c.km}, 5 ${c.km}. ${c.kids}: 500 ${c.m}. ${c.medal}: ${c.medalSub}. ${c.concert}, ${c.sauna}: ${c.free}.`;
 const distances=[['3',c.km,'3',c.adult],['5',c.km,'5',c.adult],['500',c.m,'kids',c.kids]];
 const html=`<!DOCTYPE html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#102A4C">
<title>WINTER SKI · ${c.title} | 23.01.2027</title><meta name="description" content="${c.description}"><link rel="canonical" href="${url}">
${['ru','et','en'].map(l=>`<link rel="alternate" hreflang="${l}" href="https://www.winterfest.ee${l==='ru'?'':'/'+l}/skiing/">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="https://www.winterfest.ee/et/skiing/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Estonia Winter Fest"><meta property="og:title" content="WINTER SKI · ${c.date}"><meta property="og:description" content="${c.description}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://www.winterfest.ee/assets/winter-ski/poster-${lang}-${lang==='en'?'v2':'desktop'}.webp"><meta name="twitter:card" content="summary_large_image">
<link rel="preload" as="font" type="font/ttf" crossorigin href="${base}/assets/Anton-Regular.ttf"><link rel="preload" as="image" href="${poster}" media="(max-width:760px)"><link rel="preload" as="image" href="${desktopPoster}" media="(min-width:761px)">
${['style','pages','refresh','skiing'].map(f=>`<link rel="stylesheet" href="${base}/${f}.css">`).join('\n')}
${['config','site','brand-arrows','navigation','skiing'].map(f=>`<script defer src="${base}/${f}.js"></script>`).join('\n')}
<link rel="icon" href="${base}/favicon.ico"><link rel="apple-touch-icon" href="${base}/apple-touch-icon.png">
</head><body class="subpage ski-page" id="top" data-route="/skiing/"><a class="skip" href="#main">WINTER SKI</a>
${header}
<main id="main" class="ski-main">
 <section class="ski-hero" aria-labelledby="ski-title">
  <h1 class="ski-sr" id="ski-title">WINTER SKI</h1>
  <div class="ski-hero-frame${lang==='en'?' ski-hero-frame-en':''}"><picture><source media="(min-width:761px)" srcset="${desktopPoster}"><img class="ski-hero-poster" src="${poster}" width="1672" height="941" fetchpriority="high" alt="${posterAlt}"></picture>
  <div class="ski-hero-bottom"><div class="ski-hero-action">${registration()}</div></div></div>
 </section>
 <nav class="ski-jump" aria-label="${c.tabLabel}">${tabs.map((t,i)=>`<a href="#${t}" id="ski-tab-${t}" data-ski-tab="${t}"${i===0?' class="is-active"':''}>${c[t]}</a>`).join('')}</nav>
 <div class="ski-panels ski-container" id="ski-content">
  <section class="ski-panel ski-distances-panel" id="distances" aria-labelledby="distances-title"><h2 class="ski-sr" id="distances-title">${c.distances}</h2><div class="ski-distance-summary"><p><strong>3 <span>${c.km}</span></strong></p><p><strong>5 <span>${c.km}</span></strong></p><p><strong>500 <span>${c.m}</span></strong><span>${c.kids}</span></p></div></section>
  <section class="ski-panel ski-route-panel" id="route" aria-label="${c.route}"><p>${{ru:'Маршрут дорабатывается — схема появится позже.',et:'Rada on täpsustamisel — rajakaart avaldatakse hiljem.',en:'The route is being finalised — the map will be published later.'}[lang]}</p></section>
  <section class="ski-panel ski-programme-panel" id="programme" aria-labelledby="programme-title"><div class="ski-calendar-tile"><span>${c.day}</span><strong>23</strong><span>${c.month} 2027</span></div><div class="ski-panel-copy"><h2 id="programme-title">${c.programmeTitle}</h2><p>${c.programmePending}</p><a class="ski-outline-button" href="${base}/skiing/winter-ski.ics" download>${c.calendar}${arrow}</a></div></section>
  <section class="ski-panel ski-prices-panel" id="prices" aria-labelledby="prices-title">
   <h2 id="prices-title">${c.pricesTitle}</h2>
   <table class="ski-fees-table"><thead><tr><th scope="col">${{ru:'Участники',et:'Osalejad',en:'Participants'}[lang]}</th><th scope="col">${priceCopy.main}</th><th scope="col">${c.kids}<small>500 ${c.m}</small></th></tr></thead><tbody>
   ${[[priceCopy.first,'7','—',true],[priceCopy.range,'10','5',false],[priceCopy.next,'15','7',false],[priceCopy.last,'20','10',false]].map(([label,adult,child,sold])=>`<tr${sold?' class="is-sold"':''}><th scope="row">${label}${sold?`<small>${priceCopy.sold}</small>`:''}</th><td>${adult} €</td><td>${child==='—'?'—':child+' €'}</td></tr>`).join('')}
   </tbody></table>
  </section>
  <section class="ski-panel ski-rules-panel" id="rules" aria-labelledby="rules-title"><div class="ski-document-art" aria-hidden="true">${svgDocument}<span>WINTER SKI</span></div><div class="ski-panel-copy"><h2 id="rules-title">${c.rulesTitle}</h2><p>${c.rulesPending}</p><button type="button" class="ski-outline-button" disabled>${c.rulesButton}${arrow}</button></div></section>
 </div>
 <div class="ski-contact ski-container"><div><p>${c.question}</p><a href="mailto:info@winterfest.ee">info@winterfest.ee${arrow}</a></div><a class="ski-festival-link" href="${base}${prefix}/">${c.back}${arrow}</a></div>
 <div class="ski-mobile-register">${registration()}</div>
</main>
${footer}</body></html>`;
 const dir=new URL(`${prefix.slice(1)}${prefix?'/':''}skiing/`,root);await mkdir(dir,{recursive:true});await writeFile(new URL('index.html',dir),html);
}
const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Winter Fest//WINTER SKI//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:winter-ski-2027@winterfest.ee','DTSTAMP:20261106T120000Z','DTSTART;VALUE=DATE:20270123','DTEND;VALUE=DATE:20270124','SUMMARY:WINTER SKI','LOCATION:Narva-Jõesuu\\, Estonia','DESCRIPTION:3 km / 5 km / 500 m. https://www.winterfest.ee/skiing/','URL:https://www.winterfest.ee/skiing/','END:VEVENT','END:VCALENDAR',''].join('\r\n');
await writeFile(new URL('skiing/winter-ski.ics',root),ics);
console.log('Rendered WINTER SKI in RU / ET / EN.');
