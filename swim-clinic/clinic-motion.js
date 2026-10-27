/* One-time editorial entrances. Content is visible without JS or motion support. */
(() => {
  'use strict';
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = [
    'h1','h2','h3','p','.label','.kicker','.hw-special','.hw-sub','.hw-intro',
    '.frame','.datebox','.datebox > span','.career','.career > li','.tasclink',
    '.ath > li','.ev','.nm','.tbadge','.book','.buy','.part','.pno','.grp',
    '.seat','.sname','.sdesc','.srow','.target','.target > li','.outline','.orow','.flogo'
  ].join(',');
  const targets = [...document.querySelectorAll(selector)].filter(el => !el.closest('.note,[aria-hidden="true"]'));
  const targetSet = new Set(targets);
  const active = new Map();
  let remaining = targets.length;
  const observer = new IntersectionObserver(entries => {
    let stagger = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      observer.unobserve(el);
      remaining--;
      if (document.activeElement !== document.body && el.contains(document.activeElement)) continue;
      // Nested text fades within its moving box rather than adding a second translation.
      let ancestor = el.parentElement;
      while (ancestor && !targetSet.has(ancestor)) ancestor = ancestor.parentElement;
      const move = !reduce.matches && !ancestor;
      const frames = move
        ? [{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}]
        : [{opacity:0},{opacity:1}];
      const animation = el.animate(frames, {
        duration:reduce.matches ? 150 : 500,
        delay:reduce.matches ? 0 : (stagger++ % 4) * 60,
        easing:'cubic-bezier(0.23, 1, 0.32, 1)',
        fill:'backwards'
      });
      active.set(el, animation);
      const clear = () => { if (active.get(el) === animation) active.delete(el); };
      animation.onfinish = clear;
      animation.oncancel = clear;
    }
    if (!remaining) observer.disconnect();
  }, {threshold:0,rootMargin:'0px 0px -20px 0px'});
  targets.forEach(el => observer.observe(el));
  // Keyboard navigation and changing OS preferences always take priority over motion.
  document.addEventListener('focusin', event => {
    for (const [el, animation] of active) {
      if (el.contains(event.target) || event.target.contains(el)) animation.cancel();
    }
  });
  reduce.addEventListener('change', () => {
    for (const animation of active.values()) animation.cancel();
  });
})();
