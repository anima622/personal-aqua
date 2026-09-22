(()=>{
const booted=document.documentElement.classList.contains('reading-boot');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');const active=new Set();let keyboard=false;
const blocks=[...document.querySelectorAll('.answer,.paper-body section')];
const label=document.createElement('div');label.className='reader-location';label.setAttribute('aria-hidden','true');document.body.append(label);
const progress=document.querySelector('.reading-progress')||Object.assign(document.createElement('div'),{className:'reading-progress'});if(!progress.isConnected)document.body.append(progress);
function animate(el,frames,options){if(reduced.matches||keyboard)return;const a=el.animate(frames,options);active.add(a);a.finished.then(()=>active.delete(a)).catch(()=>active.delete(a));}
function letters(el){el.setAttribute("aria-label",el.textContent);const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);for(const n of nodes){const f=document.createDocumentFragment();for(const c of [...n.textContent]){const punctuation=/^[、。？！?!」』）]/.test(c);const previous=f.lastElementChild;const mask=punctuation&&previous?previous:document.createElement('span');mask.className='read-letter-mask';mask.setAttribute('aria-hidden','true');const letter=document.createElement('span');letter.className='read-letter';letter.textContent=c;mask.append(letter);if(mask!==previous)f.append(mask)}n.replaceWith(f)}el.querySelectorAll('.read-letter').forEach((e,i)=>animate(e,[{transform:'translateY(105%)'},{transform:'translateY(0)'}],{duration:1100,delay:Math.min(i*45,850),easing:'ease-out',fill:'backwards'}));}

// One entrance per text block, with native content visible if JavaScript is unavailable.
blocks.forEach(b=>{const rule=document.createElement('span');rule.className='reading-rule';rule.setAttribute('aria-hidden','true');b.prepend(rule)});
const selector='main h1,main h2,main h3,main p,main a,main figcaption,main .article-label,main .answer-index,main .figure-label,main .frame-card span,footer,.reading-rule,main img';
const candidates=[...document.querySelectorAll(selector)].filter(el=>!el.closest('.reader-journey,.reader-inline'));
const targets=candidates.filter(el=>!candidates.some(parent=>parent!==el&&parent.contains(el)));
let bodyIndex=0;
const observer=new IntersectionObserver(entries=>{
 for(const {target:el,isIntersecting} of entries){
  if(!isIntersecting)continue;observer.unobserve(el);
  if(el.matches('img')&&!el.complete){el.addEventListener('load',()=>observer.observe(el),{once:true});el.addEventListener('error',()=>el.classList.remove('motion-pending'),{once:true});continue}
  el.dataset.motionSeen='true';
  if(reduced.matches||keyboard){el.classList.remove('motion-pending');continue;}
  const kind=el.dataset.motion;
  if(kind==='letters'){letters(el);el.classList.remove('motion-pending');continue}
  const from={opacity:0,transform:'none'};
  if(kind==='rise')from.transform='translateY(22px)';
  if(kind==='drift')from.transform='translateY(12px)';
  if(kind==='slide')from.transform='translateX(-18px)';
  if(kind==='slide-right')from.transform='translateX(18px)';
  if(kind==='rule'){animate(el,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1400,easing:'ease-in-out'});el.classList.remove('motion-pending');continue}
  animate(el,[from,{opacity:1,transform:'none'}],{duration:(kind==='fade'||kind==='image')?1400:1100,easing:'ease-out',fill:'backwards'});el.classList.remove('motion-pending');
 }
},{threshold:0,rootMargin:'0px 0px -5% 0px'});
for(const el of targets){
 let kind='fade';
 if(el.matches('img'))kind='image';
 else if(el.matches('h1,h2'))kind='letters';
 else if(el.matches('.reading-rule'))kind='rule';
 else if(el.matches('.answer-lead,h3'))kind='rise';
 else if(el.matches('figcaption,.article-meta,.figure-label'))kind='slide-right';
 else if(el.matches('a,.eyebrow,.article-label,.answer-index,footer'))kind='slide';
 else if(el.matches('p'))kind=['drift','fade','slide'][bodyIndex++%3];
 el.dataset.motion=kind;const rect=el.getBoundingClientRect();
 if(reduced.matches||(!booted&&rect.top<innerHeight&&rect.bottom>0)){el.dataset.motionSeen='true';continue}
 el.classList.add('motion-pending');observer.observe(el);
}
document.documentElement.classList.remove('reading-boot');clearTimeout(window.readingBootTimer);
function finish(){for(const a of active)a.finish();active.clear();for(const el of targets){el.classList.remove('motion-pending');el.dataset.motionSeen='true';observer.unobserve(el)}}
addEventListener('keydown',e=>{if(['Tab','ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key)){keyboard=true;finish()}},true);
addEventListener('pointerdown',()=>{keyboard=false},{passive:true});
addEventListener('focusin',finish);
function paint(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.transform=`scaleX(${Math.min(1,scrollY/max)})`;const index=blocks.findLastIndex(b=>b.getBoundingClientRect().top<innerHeight*.55);label.textContent=`ゆっくり、ひとつずつ　${Math.max(1,index+1)} / ${blocks.length}`;label.hidden=blocks.length===0;}
addEventListener('scroll',paint,{passive:true});addEventListener('resize',paint);paint();reduced.addEventListener('change',()=>{if(reduced.matches)finish()});
})();
