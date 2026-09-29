(() => {
 const root=document.querySelector('.municipal-page');if(!root)return;
 const links=[...root.querySelectorAll('.mc-jump a')];
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!active)return;links.forEach(a=>{if(a.hash==='#'+active.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-10% 0px -60% 0px'});links.forEach(a=>{const target=document.querySelector(a.hash);if(target)io.observe(target);});}
})();
