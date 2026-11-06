(() => {
 'use strict';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const tabs=$$('[data-ski-tab]'),panels=$$('.ski-panel'),navigation=$('.ski-jump'),content=$('#ski-content');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const validPanel=id=>tabs.some(t=>t.dataset.skiTab===id)?id:'distances';
 let currentPanel=validPanel(location.hash.slice(1));
 function syncLanguages(){
  $$('[data-language]').forEach(link=>{const url=new URL(link.href);url.hash=location.hash;url.searchParams.delete('distance');link.href=url.href;});
 }
 function selectPanel(id,{writeHistory=false,focus=false,scroll=false}={}){
  currentPanel=validPanel(id);
  tabs.forEach(tab=>{
   const active=tab.dataset.skiTab===currentPanel;
   tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
  });
  panels.forEach(panel=>panel.hidden=panel.id!==currentPanel);
  if(writeHistory&&location.hash!==`#${currentPanel}`){const url=new URL(location.href);url.hash=currentPanel;url.searchParams.delete('distance');history.pushState(null,'',url);}
  syncLanguages();
  if(scroll){
   const header=$('.header');
   const headerOffset=getComputedStyle(header).position==='sticky'?header.getBoundingClientRect().height:0;
   const target=content.getBoundingClientRect().top+scrollY-headerOffset-navigation.getBoundingClientRect().height;
   // Keep the poster in view when the content already fits below the menu.
   if(content.getBoundingClientRect().top>innerHeight*.62||content.getBoundingClientRect().top<headerOffset)window.scrollTo({top:target,behavior:reduced.matches?'instant':'smooth'});
  }
  if(focus)$(`#ski-tab-${currentPanel}`).focus({preventScroll:true});
  const activeTab=$(`#ski-tab-${currentPanel}`);
  const tabBounds=activeTab.getBoundingClientRect(),navBounds=navigation.getBoundingClientRect();
  if(tabBounds.left<navBounds.left||tabBounds.right>navBounds.right)navigation.scrollTo({left:activeTab.offsetLeft-navigation.clientWidth/2+activeTab.offsetWidth/2,behavior:reduced.matches?'instant':'smooth'});
 }
 navigation.setAttribute('role','tablist');
 tabs.forEach((tab,index)=>{
  tab.setAttribute('role','tab');tab.setAttribute('aria-controls',tab.dataset.skiTab);
  tab.addEventListener('click',event=>{event.preventDefault();selectPanel(tab.dataset.skiTab,{writeHistory:true,scroll:true});});
  tab.addEventListener('keydown',event=>{
   if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   selectPanel(tabs[next].dataset.skiTab,{writeHistory:true,focus:true,scroll:true});
  });
 });
 panels.forEach(panel=>{panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`ski-tab-${panel.id}`);panel.tabIndex=0;});
 document.body.classList.add('ski-tabs-ready');
 selectPanel(currentPanel);
 const onHistory=()=>selectPanel(location.hash.slice(1));
 addEventListener('popstate',onHistory);addEventListener('hashchange',onHistory);
 if(tabs.some(t=>`#${t.dataset.skiTab}`===location.hash))requestAnimationFrame(()=>content.scrollIntoView({block:'start'}));
 const mobileRegistration=$('.ski-mobile-register');
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>mobileRegistration.hidden=entries[0].isIntersecting,{threshold:0});
  observer.observe($('.ski-hero-action'));
 }
})();
