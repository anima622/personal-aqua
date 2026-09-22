/* Per-card, DOM-order entrances. No row wrapper is ever animated. */
(() => {
 window.createCardEntrance=(cards)=>{
  cards=[...cards];const reduce=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet(),running=new Map();let keyboard=false,nextStart=0;
  const finish=card=>{running.get(card)?.cancel();running.delete(card);seen.add(card);};
  if(!('IntersectionObserver' in window))return {reset(){}};
  const observer=new IntersectionObserver(entries=>{
   const arrivals=entries.filter(e=>e.isIntersecting&&!seen.has(e.target)).sort((a,b)=>cards.indexOf(a.target)-cards.indexOf(b.target));
   for(const [card] of running){const r=card.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)finish(card);}
   const now=performance.now();nextStart=Math.min(Math.max(now,nextStart),now+280);
   for(const {target:card} of arrivals){
    seen.add(card);observer.unobserve(card);if(reduce.matches||keyboard)continue;
    const delay=nextStart-now;nextStart+=280;
    const anim=card.animate([{opacity:0,transform:'translateY(64px)'},{opacity:1,transform:'translateY(0)'}],{duration:1400,delay,easing:'cubic-bezier(.25,.46,.45,.94)',fill:'backwards'});
    running.set(card,anim);anim.onfinish=()=>running.delete(card);
   }
  },{threshold:.06});
  cards.forEach(card=>observer.observe(card));
  function finishAll(){nextStart=0;running.forEach((_,card)=>finish(card));}
  document.addEventListener('keydown',()=>{keyboard=true;finishAll();},true);
  document.addEventListener('pointerdown',()=>{keyboard=false;},true);
  document.addEventListener('focusin',e=>{const card=cards.find(c=>c===e.target||c.contains(e.target));if(card)finish(card);});
  reduce.addEventListener('change',()=>{if(reduce.matches)finishAll();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finishAll();});
  return {reset(scope){nextStart=0;cards.filter(c=>scope.contains(c)).forEach(c=>{running.get(c)?.cancel();running.delete(c);seen.delete(c);observer.unobserve(c);observer.observe(c);});}};
 };
})();
