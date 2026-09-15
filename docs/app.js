(() => {
 'use strict';
 const $=(s,root=document)=>root.querySelector(s);
 const $$=(s,root=document)=>[...root.querySelectorAll(s)];
 const ru={};
 $$('[data-i18n], [data-i18n-html]').forEach(el=>{ru[el.dataset.i18n||el.dataset.i18nHtml]=el.innerHTML;});
 $$('[data-alt]').forEach(el=>{ru[el.dataset.alt]=el.alt;});
 $$('[data-label]').forEach(el=>{if(!ru[el.dataset.label])ru[el.dataset.label]=el.getAttribute('aria-label');});
 Object.assign(ru,{
 activityDate:'23–24 ЯНВАРЯ · ОТКРЫТЫЙ ФЕСТИВАЛЬ',
 skiDetail:'Массовый лыжный заезд у моря — возможность провести зимний день в движении, рядом с другими участниками и болельщиками. Приезжай за своим темпом и видом на зимний берег.',
 skiPending:'Дистанция, время старта, запись и условия проката уточняются. Проверь подробную программу перед поездкой.',
 rinkDetail:'Приходи на первый круг или ещё на один. На фестивале планируется временный открытый каток — для новичков и тех, кто уверенно чувствует себя на льду.',
 rinkPending:'Часы работы, наличие проката и условия участия опубликуем в подробной программе. Работа катка зависит от погоды.',viewProgramme:'Смотреть программу',
 cupModalKicker:'WINTER CUP · 24 ЯНВАРЯ 2027',gymDetail:'Представьте свою гимназию вместе с одноклассниками. Проходите спортивные и командные испытания, поддерживайте друг друга и набирайте очки для своей команды.',
 businessDetail:'Смените рабочий ритм на спортивный. Соберите команду коллег и проверьте, как ваше взаимопонимание работает в общих испытаниях.',openDetail:'Соберите друзей и приезжайте играть. Open Cup — категория для дружеских компаний и сборных команд.',
 cupRegister:'Регистрация в Fienta',cupTerms:'Стоимость участия, требования к составу команды и регламент — на странице регистрации.',
 creditsTitle:'ОБ ИЗОБРАЖЕНИЯХ',creditsText:'Изображения фестиваля передают атмосферу будущего события; это не фоторепортаж с прошлых Winter Fest. Концертный кадр используется как образ вечерней программы.',creditsSkates:'Фото коньков: Matthew Fournier / Unsplash.',
 days:{'23':[['ДНЁМ','Попробуй зимний спорт','Лыжи у моря, каток и открытые спортивные занятия.'],['ВМЕСТЕ','Ярмарка и семейный день','Уличная еда, ручная работа, игры и места, где можно согреться.'],['ВЕЧЕРОМ','Музыка у моря','Сцена, DJ и танцы. Артистов объявим отдельно.']],'24':[['ИГРАЕМ','Winter Cup','Три категории. Спортивные задания, командная работа и общий результат.'],['ДЛЯ ВСЕХ','Фестиваль продолжается','Ярмарка, открытые активности и сцена — в том числе для тех, кто не участвует в Cup.'],['БОЛЕЕМ','Финалы и награждение','Поддержка команд и самые азартные моменты последних этапов.']]}
 });
 const copy={ru,...window.WF_TRANSLATIONS};
 Object.assign(copy.et,{allActivities:'Kõik tegevused',fullProgramme:'Kogu programm',privacyLink:'Privaatsus',visitSource:'Reisiplaan ja kasulikud aadressid'});
 Object.assign(copy.en,{allActivities:'All activities',fullProgramme:'Full programme',privacyLink:'Privacy',visitSource:'Your trip and useful addresses'});
 const menu=$('#mobile-menu'),detail=$('#detail-dialog'),menuButton=$('.menu-toggle');
 let currentDay='23',activeDetail=null,lastFocus=null,lang='ru';
 const t=key=>copy[lang][key]??ru[key]??key;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function renderDay(){
   $('#day-panel').innerHTML=t('days')[currentDay].map(row=>`<article class="programme-row"><span class="row-time">${escape(row[0])}</span><div><h3>${escape(row[1])}</h3><p>${escape(row[2])}</p></div></article>`).join('');
   $('#day-panel').setAttribute('aria-labelledby',`day-tab-${currentDay}`);
   $$('[data-day]').forEach(b=>{const active=b.dataset.day===currentDay;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
 }
 function setLang(next,persist=true){
   if(!copy[next])return;lang=next;document.documentElement.lang=lang;
   $$('[data-i18n], [data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18n||el.dataset.i18nHtml);});
   $$('[data-alt]').forEach(el=>{el.alt=t(el.dataset.alt);});
   $$('[data-label]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.label));});
   $$('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
   $('.desktop-nav').setAttribute('aria-label',lang==='ru'?'Основная навигация':lang==='et'?'Peamenüü':'Main navigation');
   $('.languages').setAttribute('aria-label',lang==='ru'?'Язык':lang==='et'?'Keel':'Language');
   $('.brand').setAttribute('aria-label',`Winter Fest — ${lang==='ru'?'главная':lang==='et'?'avaleht':'home'}`);
   $('.hero-explore').setAttribute('aria-label',t('heroExplore'));menuButton.setAttribute('aria-label',t('menu'));
   $('meta[name="description"]').content=lang==='ru'?'23–24 января 2027. Зимний спорт, Winter Cup, музыка и ярмарка у моря в Нарва-Йыэсуу. Вход свободный.':lang==='et'?'23.–24. jaanuar 2027. Talisport, Winter Cup, muusika ja laat Narva-Jõesuus mere ääres. Tasuta sissepääs.':'23–24 January 2027. Winter sports, Winter Cup, music and a seaside market in Narva-Jõesuu. Free entry.';
   $$('[data-site-route]').forEach(a=>{a.href=(window.WF_BASE||'')+(lang==='ru'?'':'/'+lang)+a.dataset.siteRoute;});
   renderDay();if(activeDetail)renderDetail();
   if(persist){try{localStorage.setItem('winter-fest-language',lang);}catch{}const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);}
 }
 function lockScroll(locked){document.body.style.overflow=locked?'hidden':'';}
 function closeDialog(d){if(d.open)d.close();}
 function renderDetail(){
   const {type,id}=activeDetail;let html='';
   if(type==='activity'){
     const ski=id==='ski';
     html=`<img class="detail-image" src="assets/${ski?'ski':'skates'}-800.webp" alt="${escape(t(ski?'skiAlt':'rinkAlt'))}"><div class="detail-inner"><p class="eyebrow">${t('activityDate')}</p><h2 id="detail-title">${t(ski?'skiTitle':'rinkTitle')}</h2><p>${t(ski?'skiDetail':'rinkDetail')}</p><p class="small">${t(ski?'skiPending':'rinkPending')}</p><a class="button" href="#programme" data-close-detail><span>${t('viewProgramme')}</span><span aria-hidden="true">↗</span></a></div>`;
   }else if(type==='cup'){
     const names={gymnasium:'GÜMNAASIUM CUP',business:'BUSINESS CUP',open:'OPEN CUP'},keys={gymnasium:'gymDetail',business:'businessDetail',open:'openDetail'};
     const target=window.WF_CONFIG.registration[id]||`${window.WF_CONFIG.fientaFallback}/${lang}`;
     html=`<div class="detail-inner"><p class="eyebrow">${t('cupModalKicker')}</p><h2 id="detail-title">${names[id]}</h2><p>${t(keys[id])}</p><a class="button" href="${escape(target)}" target="_blank" rel="noopener"><span>${t('cupRegister')}</span><span aria-hidden="true">↗</span></a><p class="small">${t('cupTerms')}</p></div>`;
   }else{
     html=`<div class="detail-inner"><h2 id="detail-title">${t('creditsTitle')}</h2><p>${t('creditsText')}</p><p><a href="https://unsplash.com/photos/G971e4EFKtA" target="_blank" rel="noopener">${t('creditsSkates')}</a></p></div>`;
   }
   $('#detail-content').innerHTML=html;
 }
 function openDetail(type,id){lastFocus=document.activeElement;activeDetail={type,id};renderDetail();detail.showModal();lockScroll(true);}
 $$('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
 $$('[data-day]').forEach(b=>{
   b.addEventListener('click',()=>{currentDay=b.dataset.day;renderDay();});
   b.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();currentDay=event.key==='Home'?'23':event.key==='End'?'24':currentDay==='23'?'24':'23';renderDay();$(`#day-tab-${currentDay}`).focus();}});
 });
 $$('[data-activity]').forEach(b=>b.addEventListener('click',()=>openDetail('activity',b.dataset.activity)));
 $$('[data-cup]').forEach(b=>b.addEventListener('click',()=>openDetail('cup',b.dataset.cup)));
 $('[data-credits]').addEventListener('click',()=>openDetail('credits'));
 menuButton.addEventListener('click',()=>{lastFocus=menuButton;menu.showModal();menuButton.setAttribute('aria-expanded','true');lockScroll(true);});
 $$('.close-dialog').forEach(b=>b.addEventListener('click',()=>closeDialog(b.closest('dialog'))));
 $$('dialog').forEach(d=>{
   d.addEventListener('click',event=>{const r=d.getBoundingClientRect();if(event.target===d&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closeDialog(d);});
   d.addEventListener('close',()=>{lockScroll(false);menuButton.setAttribute('aria-expanded','false');if(d===detail)activeDetail=null;if(lastFocus)lastFocus.focus({preventScroll:true});});
 });
 $$('#mobile-menu nav a').forEach(a=>a.addEventListener('click',()=>closeDialog(menu)));
 detail.addEventListener('click',event=>{if(event.target.closest('[data-close-detail]'))closeDialog(detail);});
 const requested=new URL(location.href).searchParams.get('lang');let saved;try{saved=localStorage.getItem('winter-fest-language');}catch{}
 setLang(copy[requested]?requested:copy[saved]?saved:'ru',false);
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 if('IntersectionObserver'in window&&!reduce.matches){
   document.documentElement.classList.add('js');
   const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}});},{threshold:.06,rootMargin:'0px 0px 15px 0px'});
   $$('[data-reveal]').forEach(el=>observer.observe(el));
   const strip=$('.fold-divider'),moving=$('.fold-moving');let scheduled=false;
   const updateFold=()=>{scheduled=false;if(reduce.matches)return;const r=strip.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)moving.style.transform=`translateX(${-Math.max(0,(innerHeight-r.top)*.13)}px)`;};
   addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateFold);}},{passive:true});
   reduce.addEventListener('change',()=>{if(reduce.matches){document.documentElement.classList.remove('js');moving.style.transform='';}});
 }
})();
