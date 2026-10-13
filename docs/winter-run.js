(() => {
  const sidebar = document.querySelector('.run-sidebar');
  const toggle = document.querySelector('.run-menu-toggle');
  const closeMenu = () => { sidebar?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => { if (sidebar && !sidebar.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sidebar?.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Tallinn', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const tier = today >= '2027-01-01' ? 'late' : 'early';
  document.querySelectorAll('[data-run-price]').forEach(el => el.textContent = el.dataset[tier] + ' €');
  document.querySelectorAll('[data-run-price-label]').forEach(el => el.textContent = el.dataset[tier]);
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = [...document.querySelectorAll('.run-rules details')].map(el => [el, el.open]);
    printState.forEach(([el]) => { el.open = true; });
  });
  window.addEventListener('afterprint', () => printState.forEach(([el, open]) => { el.open = open; }));
  document.querySelector('[data-run-print]')?.addEventListener('click', () => window.print());
})();
