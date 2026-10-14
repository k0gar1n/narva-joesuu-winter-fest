(() => {
 const menus=[...document.querySelectorAll('.practical-nav')];
 menus.forEach(menu=>{
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();e.stopPropagation();}});
 });
 document.addEventListener('click',e=>menus.forEach(menu=>{if(!menu.contains(e.target))menu.open=false;}));
})();
