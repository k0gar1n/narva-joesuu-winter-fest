const traderFormats = [...document.querySelectorAll('[data-trader-format]')];
function selectTraderFormat(active) {
  traderFormats.forEach(button => {
    const selected = button === active;
    button.setAttribute('aria-expanded', String(selected));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
  });
}
traderFormats.forEach(button => button.addEventListener('click', () => selectTraderFormat(button)));
if (traderFormats.length) selectTraderFormat(traderFormats[0]);
