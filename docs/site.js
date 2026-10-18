(() => {
 'use strict';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const lang=document.documentElement.lang, locale={ru:0,et:1,en:2}[lang]??0;
 const wording=values=>values[locale];
 try{localStorage.setItem('winter-fest-language',lang);}catch{}
 const config=window.WF_CONFIG||{};
 const validUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}};
 $$('[data-registration]').forEach(a=>a.href=validUrl(config.registration?.[a.dataset.registration])||`${config.fientaFallback||'https://fienta.com'}/${lang}`);
 $$('[data-application]').forEach(a=>{const href=validUrl(config.forms?.[a.dataset.application]);if(href){a.href=href;a.target='_blank';a.rel='noopener';}});
 const volunteerForm=validUrl(config.forms?.volunteers);
 if(volunteerForm&&document.body.dataset.route==='/volunteers/')$$('a[href="#apply"]').forEach(a=>{a.href=volunteerForm;a.target='_blank';a.rel='noopener';});
 function languageLinks(){
  $$('[data-language]').forEach(a=>{
   const u=new URL(a.href);['day','category'].forEach(k=>{if(new URL(location.href).searchParams.has(k))u.searchParams.set(k,new URL(location.href).searchParams.get(k));else u.searchParams.delete(k);});
   u.hash=location.hash;a.href=u.href;
  });
 }
 $$('[data-language]').forEach(a=>a.addEventListener('click',()=>{try{localStorage.setItem('winter-fest-language',a.dataset.language);}catch{}}));
 languageLinks();addEventListener('hashchange',languageLinks);
 const menu=$('#site-menu'),toggle=$('.menu-toggle');let previousFocus=null;
 toggle?.addEventListener('click',()=>{previousFocus=document.activeElement;menu.showModal();toggle.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';});
 $('.close-dialog',menu)?.addEventListener('click',()=>menu.close());
 menu?.addEventListener('click',e=>{const b=menu.getBoundingClientRect();if(e.target===menu&&(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom))menu.close();});
 menu?.addEventListener('close',()=>{document.body.style.overflow='';toggle.setAttribute('aria-expanded','false');previousFocus?.focus({preventScroll:true});});
 $$('a',menu).forEach(a=>a.addEventListener('click',()=>menu.close()));
 function updateQuery(key,value,defaultValue){const u=new URL(location.href);value===defaultValue?u.searchParams.delete(key):u.searchParams.set(key,value);history.pushState(null,'',u);languageLinks();}
 const tiles=$$('.experiences .experience-tile'),filters=$$('[data-filter]');
 function renderCatalog(){
  if(!filters.length)return;
  const requested=new URL(location.href).searchParams.get('category');
  const category=filters.some(b=>b.dataset.filter===requested)?requested:'all';let count=0;
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
  tiles.forEach(t=>{t.hidden=category!=='all'&&t.dataset.category!==category;if(!t.hidden)count++;});
  const status=$('.filter-result');if(status)status.textContent=wording([`Направлений: ${count}`,`Tegevusvaldkondi: ${count}`,`${count} areas to explore`]);
 }
 filters.forEach(b=>b.addEventListener('click',()=>{updateQuery('category',b.dataset.filter,'all');renderCatalog();}));
 renderCatalog();
 const days=$$('[data-agenda-day]'),rows=$$('.agenda-row');
 function renderAgenda(){
  if(!days.length)return;
  const url=new URL(location.href),day=url.searchParams.get('day')==='23'?'23':'22';
  if(url.searchParams.has('category')){url.searchParams.delete('category');history.replaceState(null,'',url);}
  days.forEach(b=>{const selected=b.dataset.agendaDay===day;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
  $('#agenda-list').setAttribute('aria-labelledby',`agenda-tab-${day}`);
  let count=0;rows.forEach(r=>{r.hidden=!r.dataset.days.split(' ').includes(day);if(!r.hidden)count++;});
  $('.agenda-count').textContent=wording([`${day} января · пунктов программы: ${count}`,`${day}. jaanuar · kavas: ${count}`,`January ${day} · ${count} programme items`]);
  languageLinks();
 }
 days.forEach(b=>{
  b.addEventListener('click',()=>{updateQuery('day',b.dataset.agendaDay,'22');renderAgenda();});
  b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const day=e.key==='Home'?'22':e.key==='End'?'23':b.dataset.agendaDay==='22'?'23':'22';updateQuery('day',day,'22');renderAgenda();$(`#agenda-tab-${day}`).focus();});
 });
 renderAgenda();addEventListener('popstate',()=>{renderCatalog();renderAgenda();languageLinks();});
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if('IntersectionObserver' in window&&!reduce.matches){
  const elements=$$('main section:not(:first-of-type),.experience-tile,.cup-choice,.trip-chapter,.transport-section');
  elements.forEach(el=>{if(el.getBoundingClientRect().top>innerHeight*.95)el.dataset.reveal='';});
  document.body.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:0,rootMargin:'0px 0px 40px 0px'});
  $$('[data-reveal]').forEach(el=>observer.observe(el));
  reduce.addEventListener('change',()=>{if(reduce.matches){document.body.classList.remove('motion-ready');observer.disconnect();}});
 }
})();
