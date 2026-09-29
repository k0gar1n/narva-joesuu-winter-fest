(() => {
 const root=document.querySelector('.municipal-page');if(!root)return;
 const links=[...root.querySelectorAll('.mc-jump a')];
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!active)return;links.forEach(a=>{if(a.hash==='#'+active.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-10% 0px -60% 0px'});links.forEach(a=>{const target=document.querySelector(a.hash);if(target)io.observe(target);});}
})();

// Individual and team tickets may share one Fienta event or use separate URLs.
(() => {
 const registration=window.WF_CONFIG?.registration;
 if(!registration)return;
 for(const [selector,url] of [['[data-open-register]',registration.open],['[data-open-solo]',registration.openIndividual||registration.open]]){
  if(url)document.querySelectorAll(selector).forEach(a=>{a.href=url;a.target='_blank';a.rel='noopener';});
 }
})();
