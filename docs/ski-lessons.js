document.querySelectorAll('.lesson-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    document.querySelectorAll('.lesson-slot').forEach(other => other.setAttribute('aria-pressed', String(other === slot)));
  });
});
