(() => {
 'use strict';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const distanceButtons=$$('[data-ski-distance]');
 const tabs=$$('[data-ski-tab]');
 const panels=$$('.ski-panel');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const validDistance=id=>distanceButtons.some(b=>b.dataset.skiDistance===id)?id:'3';
 const validPanel=id=>tabs.some(t=>t.dataset.skiTab===id)?id:'route';
 let currentDistance=validDistance(new URL(location.href).searchParams.get('distance'));
 let currentPanel=validPanel(location.hash.slice(1));
 function syncLanguageLinks(){
  $$('[data-language]').forEach(link=>{
   const url=new URL(link.href);url.hash=location.hash;
   currentDistance==='3'?url.searchParams.delete('distance'):url.searchParams.set('distance',currentDistance);
   link.href=url.href;
  });
 }
 function selectDistance(id,writeHistory=false){
  currentDistance=validDistance(id);
  const selected=distanceButtons.find(b=>b.dataset.skiDistance===currentDistance);
  distanceButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===selected)));
  $$('[data-ski-selected]').forEach(el=>el.textContent=`${selected.dataset.skiNumber} ${selected.dataset.skiUnit}`);
  $('[data-ski-selected-name]').textContent=selected.dataset.skiName;
  $('.ski-distance-track span').style.width={3:'60%',5:'100%',kids:'10%'}[currentDistance];
  $$('[data-ski-price]').forEach(row=>row.classList.toggle('is-selected',row.dataset.skiPrice===currentDistance));
  if(writeHistory){const url=new URL(location.href);currentDistance==='3'?url.searchParams.delete('distance'):url.searchParams.set('distance',currentDistance);history.replaceState(null,'',url);}
  syncLanguageLinks();
 }
 function selectPanel(id,{scroll=false,historyEntry=false,focus=false}={}){
  currentPanel=validPanel(id);
  tabs.forEach(tab=>{
   const active=tab.dataset.skiTab===currentPanel;
   tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
  });
  panels.forEach(panel=>panel.hidden=panel.id!==currentPanel);
  if(historyEntry&&location.hash!==`#${currentPanel}`){const url=new URL(location.href);url.hash=currentPanel;history.pushState(null,'',url);}
  $$('.ski-jump [data-ski-open]').forEach(link=>link.classList.toggle('is-current',link.dataset.skiOpen===currentPanel&&location.hash===`#${currentPanel}`));
  syncLanguageLinks();
  if(scroll)$('#participant-info').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  if(focus)$(`#ski-tab-${currentPanel}`).focus({preventScroll:true});
 }
 distanceButtons.forEach(button=>button.addEventListener('click',()=>selectDistance(button.dataset.skiDistance,true)));
 $('.ski-tabs').setAttribute('role','tablist');
 tabs.forEach((tab,index)=>{
  tab.setAttribute('role','tab');tab.setAttribute('aria-controls',tab.dataset.skiTab);
  tab.addEventListener('click',event=>{event.preventDefault();selectPanel(tab.dataset.skiTab,{historyEntry:true});});
  tab.addEventListener('keydown',event=>{
   if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+tabs.length)%tabs.length;
   selectPanel(tabs[next].dataset.skiTab,{historyEntry:true,focus:true});
  });
 });
 panels.forEach(panel=>{panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`ski-tab-${panel.id}`);panel.tabIndex=0;});
 $$('[data-ski-open]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();selectPanel(link.dataset.skiOpen,{scroll:true,historyEntry:true});}));
 const onHistory=()=>{selectDistance(new URL(location.href).searchParams.get('distance'));selectPanel(location.hash.slice(1));};
 addEventListener('popstate',onHistory);addEventListener('hashchange',onHistory);
 selectDistance(currentDistance);selectPanel(currentPanel);
 if(['route','programme','prices','rules'].includes(location.hash.slice(1)))requestAnimationFrame(()=>$('#participant-info').scrollIntoView({block:'start'}));
 // Keep one registration action visible at a time on a phone.
 const mobileRegistration=$('.ski-mobile-register');
 if('IntersectionObserver' in window){
  const registrationObserver=new IntersectionObserver(entries=>{
   mobileRegistration.hidden=entries[0].isIntersecting;
  },{threshold:0});
  registrationObserver.observe($('.ski-hero-action'));
 }
 const poster=$('.ski-poster-dialog');
 let posterTrigger=null;
 $$('[data-ski-poster]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();posterTrigger=link;poster.showModal();}));
 $('.ski-poster-close').addEventListener('click',()=>poster.close());
 poster.addEventListener('click',event=>{if(event.target!==poster)return;const r=poster.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)poster.close();});
 poster.addEventListener('close',()=>posterTrigger?.focus({preventScroll:true}));
})();
