(() => {
 const root=document.querySelector('.municipal-page');if(!root)return;
 const checks=[...root.querySelectorAll('[data-mc-check]')],key='wf-municipal-checklist-2027-v1';let saved=[];
 try{saved=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(saved))saved=[];}catch{}
 const progress=()=>{const total=checks.filter(x=>x.checked).length;root.querySelector('#mc-progress').textContent=`${total} / ${checks.length}`;root.querySelector('#mc-progress-bar').value=total;};
 checks.forEach(c=>{c.checked=saved.includes(c.dataset.mcCheck);c.addEventListener('change',()=>{try{localStorage.setItem(key,JSON.stringify(checks.filter(x=>x.checked).map(x=>x.dataset.mcCheck)));}catch{}progress();});});progress();
 root.querySelector('[data-mc-share]').addEventListener('click',async e=>{const button=e.currentTarget;const url=new URL(location.href);url.hash='';try{await navigator.clipboard.writeText(url.href);root.querySelector('.mc-share-status').textContent=button.dataset.done;}catch{root.querySelector('.mc-share-status').textContent=button.dataset.failed;}});
 let printState=[];addEventListener('beforeprint',()=>{printState=[...root.querySelectorAll('details')].map(e=>[e,e.open,e.hidden]);printState.forEach(([e])=>{e.open=true;e.hidden=false;});});addEventListener('afterprint',()=>printState.forEach(([e,open,hidden])=>{e.open=open;e.hidden=hidden;}));
 root.querySelector('[data-mc-print]').addEventListener('click',()=>window.print());
 const links=[...root.querySelectorAll('.mc-jump a')];
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!active)return;links.forEach(a=>{if(a.hash==='#'+active.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-10% 0px -60% 0px'});links.forEach(a=>{const target=document.querySelector(a.hash);if(target)io.observe(target);});}
})();
