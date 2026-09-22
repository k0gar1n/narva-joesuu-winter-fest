(() => {
  const directions={'↗':'diagonal','→':'right','↓':'down','↑':'up'};
  function replaceArrows(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()){
      const n=walker.currentNode;
      if(/[↗→↓↑]/.test(n.nodeValue)&&!n.parentElement.closest('script,style,textarea,.brand-arrow'))nodes.push(n);
    }
    for(const n of nodes){
      const fragment=document.createDocumentFragment();
      for(const part of n.nodeValue.split(/([↗→↓↑])/)){
        if(directions[part]){
          const icon=document.createElement('span');icon.className='brand-arrow';icon.dataset.direction=directions[part];icon.setAttribute('aria-hidden','true');fragment.append(icon);
        }else fragment.append(document.createTextNode(part));
      }
      n.replaceWith(fragment);
    }
  }
  replaceArrows(document.body);
  const observer=new MutationObserver(records=>{
    observer.disconnect();
    for(const record of records)if(record.target.isConnected)replaceArrows(record.target);
    observer.observe(document.body,{childList:true,subtree:true});
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();

// Reveal navigation when returning up the page; ignore tiny scroll jitters.
(() => {
  const header=document.querySelector('.header');
  if(!header)return;
  let previous=Math.max(0,scrollY),travel=0,direction=0,queued=false;
  function update(){
    queued=false;
    const current=Math.max(0,scrollY),delta=current-previous;
    previous=current;
    if(current<80||document.querySelector('dialog[open]')){
      header.classList.remove('header-hidden');travel=0;return;
    }
    if(!delta)return;
    const nextDirection=Math.sign(delta);
    travel=nextDirection===direction?travel+Math.abs(delta):Math.abs(delta);
    direction=nextDirection;
    if(travel>12)header.classList.toggle('header-hidden',direction>0);
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
  header.addEventListener('focusin',()=>header.classList.remove('header-hidden'));
})();
