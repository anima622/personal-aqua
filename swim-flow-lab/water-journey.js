export function createJourney(section){
 const hero=document.querySelector('.hero');
 const journey=document.createElement('div');journey.className='water-journey';
 const frame=document.createElement('div');frame.className='journey-frame';
 hero.before(journey);journey.append(frame);frame.append(hero,section);
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
 const pref=matchMedia('(prefers-reduced-motion: reduce)');
 const nav=section.querySelector('.observation-top');
 nav.innerHTML='<a href="#top">↑ TOP</a><span>一滴から、水を知る</span><a href="#water-vortex">ほかの動きへ ↓</a>';
 const go=(p)=>{const top=scrollY+journey.getBoundingClientRect().top+p*Math.max(1,journey.offsetHeight-innerHeight);if(window.waterScroller)window.waterScroller.scrollTo(top,{immediate:pref.matches||p===0});else window.scrollTo({top,behavior:pref.matches||p===0?'instant':'smooth'});};
 hero.querySelector('a[href="#water-observation"]').addEventListener('click',e=>{if(pref.matches)return;e.preventDefault();go(.25)});
 nav.querySelector('a[href="#top"]').addEventListener('click',e=>{if(pref.matches)return;e.preventDefault();go(0)});
 document.querySelectorAll('a[href="#top"]').forEach(a=>a.addEventListener('click',e=>{if(pref.matches)return;e.preventDefault();go(0)}));
 if(location.hash==='#water-observation'&&!pref.matches)requestAnimationFrame(()=>go(.25));
 function position(){return clamp(-journey.getBoundingClientRect().top/Math.max(1,journey.offsetHeight-innerHeight))}
 function paint(p){
  const reduced=pref.matches;journey.classList.toggle('journey-reduced',reduced);
  const heroOut=ease(.025,.26,p),show=ease(.07,.24,p);
  journey.style.setProperty('--hero-alpha',String(1-heroOut));
  journey.style.setProperty('--hero-lift',`${-ease(0,.3,p)*80}px`);
  journey.style.setProperty('--scene-alpha',String(show));
  journey.style.setProperty('--reading-alpha',String(ease(.58,.68,p)));
  journey.style.setProperty('--exit-alpha',String(ease(.89,.94,p)*(1-ease(.96,1,p))));
  journey.style.setProperty('--water-out',String(reduced?1:1-ease(.80,.88,p)));
  next.inert=reduced||p<.89||p>=1;const bottom=section.querySelector('.observation-bottom');if(bottom)bottom.inert=!reduced&&p>.88;
  hero.inert=!reduced&&p>=.24;section.inert=!reduced&&p<.24;
  journey.dataset.phase=p<.2?'entry':p<.55?'fall':p<.83?'ripple':'next';
  journey.dataset.progress=p.toFixed(3);
 }
 const steps=document.createElement('nav');steps.className='journey-steps';steps.setAttribute('aria-label','観察する場面');
 [['落下を見る',.25],['着水を見る',.31],['王冠を見る',.48],['波紋を見る',.74],['次の問い',.95]].forEach(([label,p])=>{const button=document.createElement('button');button.textContent=label;button.addEventListener('click',()=>{if(!pref.matches)go(p)});steps.append(button)});
 section.querySelector('.observation-bottom').append(steps);
 const next=document.createElement('a');next.className='journey-next';next.href='#water-vortex';next.innerHTML='<small>Next</small><strong>流れと渦</strong><span class=transition-scroll aria-hidden=true><i></i><i></i><i></i><em>scroll</em></span>';next.setAttribute('aria-label','次へ：流れと渦');section.querySelector('.observation-stage').append(next);
 return {element:journey,position,paint,go};
}




