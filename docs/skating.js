const rinkDays = [...document.querySelectorAll('[data-rink-day]')];
function showRinkDay(active) {
  rinkDays.forEach(button => {
    const selected = button === active;
    button.setAttribute('aria-expanded', String(selected));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
  });
}
rinkDays.forEach(button => button.addEventListener('click', () => showRinkDay(button)));
if (rinkDays.length) showRinkDay(rinkDays[0]);
