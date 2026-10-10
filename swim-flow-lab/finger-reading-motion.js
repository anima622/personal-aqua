/* Article-wide reading motion. Native content stays visible without JavaScript. */
(() => {
  const page = document.querySelector('[data-evidence-article],.finger-page');
  if (!page || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const explanation = new Map();
  let paused = false, keyboard = false, suppressUntil = 0;
  const button = document.querySelector('[data-finger-motion-toggle]');
  const style = getComputedStyle(page);
  const easing = style.getPropertyValue('--ease-out').trim() || 'cubic-bezier(0.23,1,0.32,1)';
  const duration = parseFloat(style.getPropertyValue('--finger-reading-duration')) || 900;
  const textSelector = 'main h1,main h2,main h3,main p,main li,main a,main figcaption,main blockquote,main dt,main dd,main th,main td,footer';
  function finish() {
    for (const animation of active) {
      const focus = explanation.get(animation);
      if (focus) focus.style.opacity='1';
      animation.cancel();
    }
    active.clear(); explanation.clear();
  }
  function updateButton() {
    if (button) {
      button.hidden = false; button.disabled = reduced.matches;
      button.textContent = reduced.matches ? '動きを減らす設定中' : paused ? '動きを再開' : '動きを止める';
    }
    document.querySelectorAll('[data-motion-replay]').forEach(control => {
      control.hidden = reduced.matches; control.disabled = paused;
    });
  }
  function allowed(explicit=false) {
    return !paused && !reduced.matches && (explicit || (!keyboard && performance.now() >= suppressUntil));
  }
  function run(element, frames, options) {
    const animation = element.animate(frames, options);
    active.add(animation);
    if (options.fill === 'both') explanation.set(animation,element);
    animation.finished.then(() => {
      if (options.fill !== 'both') active.delete(animation);
    }).catch(() => { active.delete(animation); explanation.delete(animation); });
  }
  function play(figure, explicit=false) {
    const infographic=figure.querySelector('[data-infographic-pattern]');
    if (infographic) {
      if (!allowed(explicit)) return;
      infographic.querySelectorAll('[data-infographic-part]').forEach(part => {
        const from={opacity:0,transform:'translateY(18px)'};
        if(part.dataset.reveal==='right'){from.transform='none';from.clipPath='inset(0 100% 0 0)';}
        if(part.dataset.reveal==='up'){from.transform='none';from.clipPath='inset(100% 0 0 0)';}
        run(part,[from,{opacity:1,transform:'none',clipPath:'inset(0 0 0 0)'}],
          {duration,delay:Number(part.dataset.phase||0)*550,easing,fill:'backwards'});
      });
      return;
    }
    if (!allowed(explicit)) {
      figure.querySelectorAll('[data-motion-focus]').forEach(focus => { focus.style.opacity='1'; });
      return;
    }
    const image = figure.querySelector('img');
    if (image) run(image, [
      { opacity: .35, transform: 'translateY(6%) scale(.97)' },
      { opacity: 1, transform: 'none' }
    ], { duration, easing });
    figure.querySelectorAll('[data-motion-focus]').forEach((focus, index) => {
      run(focus, [{opacity:0},{opacity:1}],
        {duration:600,delay:duration + index * 1000,easing,fill:'both'});
    });
  }
  function playText(element) {
    if (!allowed()) return;
    if (element.matches('h1,h2')) {
      element.setAttribute('aria-label',element.textContent);
      const walk=document.createTreeWalker(element,NodeFilter.SHOW_TEXT), nodes=[];
      while(walk.nextNode()) nodes.push(walk.currentNode);
      for (const node of nodes) {
        const fragment=document.createDocumentFragment();
        for (const character of [...node.textContent]) {
          const previous=fragment.lastElementChild;
          const mask=/^[、。？！?!」』）]/.test(character)&&previous?previous:document.createElement('span');
          mask.className='read-letter-mask';mask.setAttribute('aria-hidden','true');
          const letter=document.createElement('span');letter.className='read-letter';letter.textContent=character;mask.append(letter);
          if(mask!==previous)fragment.append(mask);
        }
        node.replaceWith(fragment);
      }
      element.querySelectorAll('.read-letter').forEach((letter,index)=>run(letter,
        [{transform:'translateY(105%)'},{transform:'translateY(0)'}],
        {duration:1100,delay:Math.min(index*45,850),easing,fill:'backwards'}));
      return;
    }
    const heading = element.matches('h1,h2,h3');
    const caption = element.matches('figcaption');
    run(element, heading ? [
      {opacity:.35,clipPath:'inset(0 0 100% 0)',transform:'translateY(8px)'},
      {opacity:1,clipPath:'inset(0 0 0 0)',transform:'none'}
    ] : [
      {opacity:.35,transform:caption?'translateX(12px)':'translateY(12px)'},
      {opacity:1,transform:'none'}
    ], {duration,easing});
  }
  updateButton();
  button?.addEventListener('click', () => {
    paused = !paused; keyboard = false;
    if (paused) finish(); updateButton();
  });
  document.querySelectorAll('[data-motion-replay]').forEach(control => {
    control.addEventListener('click', () => { finish(); play(control.closest('figure'),true); });
  });
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); updateButton(); });
  document.addEventListener('keydown', event => {
    if (['Enter',' '].includes(event.key) && event.target.closest?.('[data-finger-motion-toggle],[data-motion-replay]')) return;
    if (['Tab','Enter',' ','PageDown','PageUp','ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      keyboard = true; finish(); updateButton();
    }
  });
  function jump() { finish(); suppressUntil = performance.now() + duration; }
  document.addEventListener('click', event => { if (event.target.closest?.('a[href^="#"]')) jump(); });
  addEventListener('hashchange', jump);
  addEventListener('pointerdown', () => { keyboard=false; });
  if (window.location?.hash) jump();
  const figures = [...document.querySelectorAll('[data-article-visual],.finger-cover,.finger-chapter>figure')];
  const candidates = [...document.querySelectorAll(textSelector)].filter(element=>!element.closest('[data-infographic-pattern]'));
  document.querySelectorAll('[data-infographic-part]').forEach(part=>{part.dataset.articleMotion='text';});
  // Keep inline links and emphasis intact; do not animate nested blocks twice.
  const text = candidates.filter(element => !candidates.some(parent => parent !== element && parent.contains(element)));
  const figureSet = new Set(figures);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.dataset.motionSeen = 'true';
      if (figureSet.has(entry.target)) play(entry.target); else playText(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  for (const element of [...figures,...text]) {
    element.dataset.articleMotion = figureSet.has(element) ? 'image' : 'text';
    // No hidden pending state: delayed observers must never hide the content.
    observer.observe(element);
  }
})();
