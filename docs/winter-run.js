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
  const data = document.querySelector('#run-course-data');
  if (data) {
    const descriptions = JSON.parse(data.textContent);
    const buttons = [...document.querySelectorAll('[data-run-distance]')];
    function select(index) {
      if (!descriptions[index]) return;
      buttons.forEach(el => el.setAttribute('aria-pressed', String(el.dataset.runDistance === String(index))));
      document.querySelector('#distance-description').textContent = descriptions[index];
    }
    buttons.forEach(el => el.addEventListener('click', () => { select(el.dataset.runDistance); history.replaceState(null, '', '#distance-' + el.dataset.runDistance); }));
    select(location.hash.match(/^#distance-([0-2])$/)?.[1] || 0);
  }
  const map = document.querySelector('.run-map-dialog');
  const image = map?.querySelector('img');
  let zoom = 1;
  const setZoom = value => {
    zoom = Math.min(4, Math.max(1, value));
    if (image) image.style.height = `${zoom * 100}%`;
  };
  document.querySelector('.run-map-open')?.addEventListener('click', () => { setZoom(1); map.showModal(); document.body.style.overflow = 'hidden'; });
  map?.querySelector('[data-map-close]').addEventListener('click', () => map.close());
  map?.addEventListener('close', () => { document.body.style.overflow = ''; document.querySelector('.run-map-open')?.focus(); });
  map?.querySelectorAll('[data-map-zoom]').forEach(el => el.addEventListener('click', () => setZoom(zoom + (el.dataset.mapZoom === '+' ? .5 : -.5))));
  map?.querySelector('[data-map-reset]').addEventListener('click', () => { setZoom(1); map.querySelector('.run-map-scroll').scrollTo(0, 0); });
  document.querySelectorAll('.run-benefit').forEach(el => el.addEventListener('toggle', () => {
    if (el.open) document.querySelectorAll('.run-benefit').forEach(other => { if (other !== el) other.open = false; });
  }));
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = [...document.querySelectorAll('.run-rules details')].map(el => [el, el.open]);
    printState.forEach(([el]) => { el.open = true; });
  });
  window.addEventListener('afterprint', () => printState.forEach(([el, open]) => { el.open = open; }));
  document.querySelector('[data-run-print]')?.addEventListener('click', () => window.print());
})();
