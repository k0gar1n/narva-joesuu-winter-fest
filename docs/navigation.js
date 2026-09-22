(() => {
 const menus=[...document.querySelectorAll('.practical-nav')];
 const hover=matchMedia('(hover: hover) and (pointer: fine)');
 menus.forEach(menu=>{
  let timer;
  menu.querySelector('summary').addEventListener('click',()=>clearTimeout(timer));
  menu.addEventListener('pointerenter',()=>{if(hover.matches&&menu.closest('.desktop-nav')){clearTimeout(timer);timer=setTimeout(()=>{menu.open=true;},150);}});
  menu.addEventListener('pointerleave',()=>{if(hover.matches&&menu.closest('.desktop-nav'))timer=setTimeout(()=>{if(!menu.contains(document.activeElement))menu.open=false;},160);});
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();e.stopPropagation();}});
  menu.addEventListener('focusout',()=>setTimeout(()=>{if(!menu.contains(document.activeElement))menu.open=false;},0));
 });
 document.addEventListener('click',e=>menus.forEach(menu=>{if(!menu.contains(e.target))menu.open=false;}));
})();
