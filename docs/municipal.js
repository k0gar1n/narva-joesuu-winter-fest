(() => {
 const root=document.querySelector('.municipal-page');if(!root)return;
 const links=[...root.querySelectorAll('.mc-jump a')];
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!active)return;links.forEach(a=>{if(a.hash==='#'+active.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-10% 0px -60% 0px'});links.forEach(a=>{const target=document.querySelector(a.hash);if(target)io.observe(target);});}
})();

// Keep checkout on the site and match the event's supported checkout language.
(() => {
 const registration=window.WF_CONFIG?.registration;
 if(!registration)return;
 const lang=document.documentElement.lang==='ru'?'ru':'et';
 const selectors=[['[data-registration="municipalities"]','municipalities'],['[data-business-registration]','business'],['[data-open-register]','open'],['[data-open-solo]','openIndividual']];
 for(const [selector,key] of selectors){
  if(!registration[key])continue;
  const url=new URL(registration[key]);
  const checkoutLang=key==='openIndividual'?'et':lang;
  url.pathname=url.pathname.replace(/^\/(?:et|ru|en)(?=\/)/,'/'+checkoutLang);
  document.querySelectorAll(selector).forEach(a=>{
   a.href=url.href;
   a.classList.add('fienta-embed');
   a.removeAttribute('target');
   a.removeAttribute('rel');
  });
 }
})();
