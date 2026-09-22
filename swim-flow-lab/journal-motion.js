/* Section entrances; article cards use the shared per-card queue. */
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(!('IntersectionObserver' in window))return;
 const seen=new WeakSet(),running=new Map();let keyboard=false;
 const finish=el=>{running.get(el)?.cancel();running.delete(el);seen.add(el);};
 const elements=[...document.querySelectorAll('.journal-heading,.journal-category,.journal-tablet-index,.journal-mobile-heading,.journal-panel-caption,.journal-art-note,.journal-index>h2,.journal-index>p,.journal-index-nav,.journal-index-title')];
 const cardMotion=window.createCardEntrance?.(document.querySelectorAll('.journal-card'));
 document.addEventListener('keydown',()=>{keyboard=true;running.forEach((_,el)=>finish(el));},true);
 document.addEventListener('pointerdown',()=>{keyboard=false;},true);
 const observer=new IntersectionObserver(entries=>{
  entries.filter(e=>e.isIntersecting).forEach(entry=>{
   const el=entry.target;if(seen.has(el))return;seen.add(el);observer.unobserve(el);
   if(reduce.matches||keyboard)return;
   const card=el.classList.contains('journal-card'),category=el.classList.contains('journal-category');
   const siblings=card?[...el.parentElement.querySelectorAll('.journal-card')]:category?[...el.parentElement.querySelectorAll('.journal-category')]:[el];
   const index=siblings.indexOf(el);
   const from=category?'translateX(-48px)':'translateY(80px)';
   const anim=el.animate([{opacity:0,transform:from},{opacity:1,transform:'translate(0,0)'}],{duration:card?1800:1400,delay:(card||category)?index*160:0,easing:'cubic-bezier(.25,.46,.45,.94)',fill:'backwards'});
   running.set(el,anim);anim.onfinish=()=>running.delete(el);
  });
 },{threshold:.08});
 elements.forEach(el=>observer.observe(el));
 const container=document.querySelector('.journal-contents')||document.querySelector('.journal-index');
 if(container)new MutationObserver(records=>records.forEach(({target})=>{
  if(!target.hidden)return;
  cardMotion?.reset(target);
  elements.filter(el=>target.contains(el)).forEach(el=>{running.get(el)?.cancel();running.delete(el);seen.delete(el);observer.observe(el);});
 })).observe(container,{attributes:true,subtree:true,attributeFilter:['hidden']});
 document.addEventListener('focusin',e=>elements.filter(el=>el===e.target||el.contains(e.target)).forEach(finish));
 reduce.addEventListener('change',()=>{if(reduce.matches)running.forEach((_,el)=>finish(el));});
})();
