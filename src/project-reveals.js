/** Section reveals belong to this dialog and are cancelled on replacement or close. */
export function mountProjectReveals(root) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = [...root.querySelectorAll('.detail-label,.detail-title,.world-introduction p,.detail-meta>div,.detail-body h3,.detail-body p,.detail-bottom')];
  const animations = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (motion.matches || document.body.classList.contains('motion-paused')) continue;
      const title = entry.target.classList.contains('detail-title');
      const animation = entry.target.animate([
        { opacity: 0, transform: `translateY(${title ? 30 : 18}px)`, clipPath: title ? 'inset(100% 0 0)' : 'inset(0)' },
        { opacity: 1, transform: 'none', clipPath: 'inset(0)' },
      ], { duration: title ? 850 : 650, easing: 'cubic-bezier(.16,1,.3,1)' });
      animations.add(animation); animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    }
  }, { root: root.closest('dialog'), threshold: .12 });
  nodes.forEach(node => observer.observe(node));
  const stop = () => { animations.forEach(a => a.cancel()); animations.clear(); };
  const preference = () => { if (motion.matches) stop(); };
  const globalPause = event => { if (event.detail.paused) stop(); };
  motion.addEventListener('change', preference);
  document.addEventListener('portfolio-motion', globalPause);
  return () => { observer.disconnect(); stop(); motion.removeEventListener('change', preference); document.removeEventListener('portfolio-motion', globalPause); };
}
