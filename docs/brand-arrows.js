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
