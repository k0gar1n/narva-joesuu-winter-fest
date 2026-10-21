(() => {
  'use strict';
  const root = document.querySelector('.horse-page');
  if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const frame = root.querySelector('.horse-frame');
  frame.addEventListener('pointermove', event => {
    if (reduce.matches || event.pointerType !== 'mouse' || innerWidth <= 760) return;
    const box = frame.getBoundingClientRect();
    frame.style.setProperty('--photo-x', `${(event.clientX - box.left - box.width / 2) / 70}px`);
    frame.style.setProperty('--photo-y', `${(event.clientY - box.top - box.height / 2) / 70}px`);
  });
  frame.addEventListener('pointerleave', () => {
    frame.style.setProperty('--photo-x', '0px');
    frame.style.setProperty('--photo-y', '0px');
  });
  const pet = root.querySelector('.horse-pet');
  const track = root.querySelector('.horse-intro-track');
  let walking = false;
  let returnTimer;
  const prints = [];
  for (let i = 0; i < 12; i++) {
    const mark = document.createElement('span');
    mark.className = 'horse-print';
    mark.setAttribute('aria-hidden', 'true');
    mark.style.left = `${4 + i * 6.1}%`;
    track.append(mark);
    prints.push(mark);
  }
  pet.addEventListener('click', () => {
    if (walking) return;
    walking = true;
    clearTimeout(returnTimer);
    pet.classList.add('is-walking');
    const distance = Math.max(0, track.clientWidth - pet.clientWidth);
    pet.style.setProperty('--pet-x', reduce.matches ? '0px' : `${distance}px`);
    prints.forEach((mark, i) => {
      mark.style.transitionDelay = reduce.matches ? '0s' : `${i * .11}s`;
      mark.style.opacity = '0.45';
    });
    returnTimer = setTimeout(() => {
      pet.classList.remove('is-walking');
      pet.style.setProperty('--pet-x', '0px');
      prints.forEach(mark => { mark.style.transitionDelay = '0s'; mark.style.opacity = '0'; });
      walking = false;
    }, reduce.matches ? 300 : 2300);
  });
})();
