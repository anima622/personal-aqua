/* Article-wide reading motion. Native content stays visible without JavaScript. */
(() => {
  const page = document.querySelector('[data-evidence-article],.finger-page');
  if (!page || !('IntersectionObserver' in window) || window.__articleMotionExpired) {
    document.documentElement.classList.remove('article-motion-boot','article-motion-ready');clearTimeout(window.__articleMotionFallback);return;
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const explanation = new Map();
  let paused = false, keyboard = false, suppressUntil = 0;
  const button = document.querySelector('[data-finger-motion-toggle]');
  const style = getComputedStyle(page);
  const easing = style.getPropertyValue('--ease-out').trim() || 'cubic-bezier(0.23,1,0.32,1)';
  const duration = parseFloat(style.getPropertyValue('--finger-reading-duration')) || 1600;
  const textSelector = 'main h1,main h2,main h3,main p,main li,main a,main figcaption,main blockquote,main dt,main dd,main th,main td,footer';
  function finish(revealPending=true) {
    if(revealPending) document.querySelectorAll('[data-motion-focus]').forEach(el=>{el.style.opacity='1';});
    if(revealPending) document.querySelectorAll('[data-motion-pending]').forEach(el=>{delete el.dataset.motionPending;el.dataset.motionSeen='true';});
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
        const from={opacity:0,transform:'translateY(12px)'};
        if(part.dataset.reveal==='right')from.transform='translateX(-12px)';
        if(part.dataset.reveal==='up')from.transform='translateY(12px)';
        run(part,[from,{opacity:1,transform:'none'}],
          {duration,delay:Number(part.dataset.phase||0)*300,easing,fill:'backwards'});
      });
      return;
    }
    if (!allowed(explicit)) {
      figure.querySelectorAll('[data-motion-focus]').forEach(focus => { focus.style.opacity='1'; });
      return;
    }
    const image = figure.querySelector('img');
    if (image) run(image, [
      { opacity: 0, transform: 'translateY(14px)' },
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
        {duration,delay:Math.min(index*32,500),easing,fill:'backwards'}));
      return;
    }
    const heading = element.matches('h1,h2,h3');
    const caption = element.matches('figcaption');
    run(element, heading ? [
      {opacity:0,transform:'translateY(12px)'},
      {opacity:1,transform:'none'}
    ] : [
      {opacity:0,transform:caption?'translateX(12px)':'translateY(12px)'},
      {opacity:1,transform:'none'}
    ], {duration,easing});
  }
  updateButton();
  button?.addEventListener('click', () => {
    paused = !paused; keyboard = false;
    if (paused) finish(); updateButton();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); updateButton(); });
  document.addEventListener('keydown', event => {
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='f'){keyboard=true;finish();return;}
    if (['Enter',' '].includes(event.key) && event.target.closest?.('[data-finger-motion-toggle]')) return;
    if (['Tab','Enter',' ','PageDown','PageUp','ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      keyboard = true; finish(); updateButton();
    }
  });
  function jump() { finish(false); suppressUntil = performance.now() + duration; }
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
    if(window.__articleMotionExpired){finish();observer.disconnect();return;}
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if(entry.target.dataset.motionSeen==='true') continue;
      entry.target.dataset.motionSeen = 'true';
      if (figureSet.has(entry.target)) play(entry.target); else playText(entry.target);
      delete entry.target.dataset.motionPending;
    }
  }, { threshold: 0, rootMargin: '0px 0px 60px 0px' });
  document.documentElement.classList.add('article-motion-ready');
  for (const element of [...figures,...text]) {
    element.dataset.articleMotion = figureSet.has(element) ? 'image' : 'text';
    if(!paused && !reduced.matches) element.dataset.motionPending='true';
    observer.observe(element);
  }
  document.documentElement.classList.remove('article-motion-boot');
  clearTimeout(window.__articleMotionFallback);
})();
