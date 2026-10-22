// Website actions only. Fienta sends its own cart/payment/purchase events.
(() => {
  'use strict';
  const measurementId = 'G-Y2YC35PEE2';
  // Load the official embed on every page so it can retain campaign UTM tags
  // when a visitor first lands elsewhere and navigates to registration later.
  window.fientaSettings = Object.assign({
    link_selector: 'a.fienta-embed',
    background: 'rgba(7,27,57,.78)',
    border_radius: '0'
  }, window.fientaSettings, {
    // Do not replace the real acquisition source with "homepage embed".
    utm_source: ''
  });

  const knownActivities = {
    skating: 'skating', music: 'concert', warmth: 'sauna', market: 'market',
    'ski-lessons': 'ski_lessons', skiing: 'ski_race', sports: 'snow_football',
    'horse-riding': 'horse_riding', family: 'snow_games'
  };
  function activityFromPath(path) {
    const clean = path.replace(/^\/narva-joesuu-winter-fest(?=\/)/, '').replace(/^\/(?:et|en|ru)(?=\/)/, '');
    if (/^\/winter-run(?:\/|$)/.test(clean)) return 'winter_run';
    const cup = clean.match(/^\/winter-cup\/(municipalities|business|open)(?:\/|$)/);
    if (cup) return 'winter_cup_' + cup[1];
    if (/^\/winter-cup(?:\/|$)/.test(clean)) return 'winter_cup';
    const festival = clean.match(/^\/festival\/([^/]+)/);
    return festival ? knownActivities[festival[1]] || '' : '';
  }
  function eventDetails() {
    return {
      send_to: measurementId,
      site_language: document.documentElement.lang || 'ru',
      activity: activityFromPath(location.pathname) || 'festival'
    };
  }
  function send(name, details = {}) {
    if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign(eventDetails(), details));
  }
  function fientaActivity(anchor, url) {
    if (anchor.matches('[data-business-registration]')) return 'winter_cup_business';
    if (anchor.matches('[data-open-register], [data-open-solo]')) return 'winter_cup_open';
    if (anchor.dataset.registration) return 'winter_cup_' + anchor.dataset.registration;
    if (/winter-run/.test(url.pathname)) return 'winter_run';
    return activityFromPath(location.pathname) || 'winter_cup';
  }

  let pendingCheckout = null;
  let checkoutReported = false;
  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor || event.button !== 0) return;
    let target;
    try { target = new URL(anchor.href, location.href); } catch (_) { return; }
    if (target.protocol === 'https:' && target.hostname === 'fienta.com') {
      // Event path contains no buyer data, query parameters or email addresses.
      const details = {
        activity: fientaActivity(anchor, target),
        registration_type: anchor.matches('[data-open-solo]') ? 'individual' : 'standard',
        checkout_language: target.pathname.split('/')[1] === 'ru' ? 'ru' : 'et',
        ticket_event: target.pathname.replace(/^\/(?:ru|et|en)\//, '/').slice(0, 100),
        button_position: anchor.closest('header, .mc-hero, .run-hero') ? 'top' : 'page'
      };
      pendingCheckout = details;
      checkoutReported = false;
      send('registration_click', details);
      return;
    }
    if (target.origin !== location.origin) return;
    const activity = activityFromPath(target.pathname);
    if (activity && activity !== activityFromPath(location.pathname)) send('select_activity', { activity });
  }, true);

  // Trust only the actual Fienta checkout frame, never arbitrary window messages.
  // This records that the checkout loaded, not that a purchase was completed.
  window.addEventListener('message', event => {
    if (event.origin !== 'https://fienta.com') return;
    const frame = document.getElementById('fienta_iframe');
    if (!frame || event.source !== frame.contentWindow) return;
    const op = event.data && (event.data.op || event.data);
    if (op === 'cart_loaded' && !checkoutReported) {
      checkoutReported = true;
      send('checkout_open', pendingCheckout || {});
    }
    if (op === 'hide_fienta_iframe') {
      pendingCheckout = null;
      checkoutReported = false;
    }
  });
})();
