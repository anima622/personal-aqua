(()=>{
const section=document.querySelector('#water-vortex');if(!section)return;
const stage=section.querySelector('.vortex-stage'),host=stage.querySelector('.scene-visual'),reading=stage.querySelector('.scene-reading');
host.removeAttribute('data-water-scene');host.setAttribute('aria-label','曲がりから巻き込み、下流への移動をたどる生成映像');
const film=document.createElement('canvas');film.className='vortex-video';film.width=1280;film.height=720;host.append(film);const ctx=film.getContext('2d');
let desired=0,target=0,jobs=0;const cache=new Map(),pending=new Set(),failed=new Set();
function paint(){let nearest=-1;for(const n of cache.keys())if(nearest<0||Math.abs(n-target)<Math.abs(nearest-target))nearest=n;if(nearest>=0){ctx.drawImage(cache.get(nearest),0,0,1280,720);film.dataset.frame=String(nearest)}}
function load(n){if(n<0||n>239||cache.has(n)||failed.has(n)||pending.has(n)||jobs>=4)return;pending.add(n);jobs++;fetch('/personal-aqua/swim-flow-lab/vortex-story-frames/'+String(n).padStart(3,'0')+'.jpg').then(r=>{if(!r.ok)throw Error('frame');return r.blob()}).then(b=>createImageBitmap(b,{resizeWidth:1280,resizeHeight:720})).then(bitmap=>{cache.set(n,bitmap);while(cache.size>24){let far=[...cache.keys()].sort((a,b)=>Math.abs(b-target)-Math.abs(a-target))[0];cache.get(far).close();cache.delete(far)}paint()}).catch(()=>{failed.add(n)}).finally(()=>{pending.delete(n);jobs--;warm()})}
function warm(){for(let d=0;d<=8;d++){load(target+d);if(d)load(target-d)}}
function seek(){target=Math.round(desired*239);paint();warm()}
const explanation=document.createElement('section');explanation.className='vortex-explanation';explanation.id='vortex-explanation';section.after(explanation);
window.createPlateStory(explanation);
const pref=matchMedia('(prefers-reduced-motion: reduce)');
const phases=[['流れが曲がり、巻き始める','板の後ろで、細い流れが巻き込む様子を見てみましょう。'],['回りながら、離れていく','板と渦の間隔に目を向けてみましょう。'],['次の渦が、生まれていく','先の渦が離れると、その後ろにも巻き込みが連なります。'],['動きの仕組みを知る','次は、板で水を押したときの動きを図解で見てみましょう。']];
const logo=document.createElement('a');logo.className='vortex-brand';logo.href='#top';logo.innerHTML='SWIM<br>FLOW LAB';logo.setAttribute('aria-label','SWIM FLOW LAB トップ');stage.append(logo);
const chapterNav=document.createElement('nav');chapterNav.className='vortex-chapters';chapterNav.id='vortex-chapters';chapterNav.setAttribute('aria-label','サイトの章');chapterNav.innerHTML=[['top','Top'],['water-observation','Water drop'],['water-vortex','Vortex'],['water-flow','Shape & flow'],['water-fields','水を知る視点'],['feature','特集']].map(([id,label],i)=>`<a href="#${id}" ${i===2?'aria-current="location"':''}><span>0${i+1}</span> ${label}</a>`).join('');stage.append(chapterNav);
const menu=document.createElement('button');menu.className='vortex-menu';menu.type='button';menu.textContent='章を選ぶ ＋';menu.setAttribute('aria-controls','vortex-chapters');menu.setAttribute('aria-expanded','false');stage.append(menu);menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));chapterNav.classList.toggle('is-open',open)};chapterNav.addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');chapterNav.classList.remove('is-open')}});
const count=document.createElement('span');count.className='vortex-count';count.setAttribute('aria-hidden','true');reading.prepend(count);
const nav=document.createElement('nav');nav.className='vortex-steps';nav.setAttribute('aria-label','渦の観察ポイント');
phases.forEach(([label],i)=>{const b=document.createElement('button');b.type='button';b.textContent=`0${i+1} ${label}`;b.onclick=()=>{if(pref.matches){show(i);desired=i/4+.02;seek();return}const y=scrollY+section.getBoundingClientRect().top+(.30+.58*(i/4+.02))*(section.offsetHeight-innerHeight);if(window.waterScroller)window.waterScroller.scrollTo(y);else scrollTo({top:y,behavior:'smooth'})};nav.append(b)});stage.append(nav);
const railWindow=document.createElement('div');railWindow.className='vortex-rail-window';const rail=document.createElement('nav');rail.className='vortex-rail';rail.setAttribute('aria-label','渦の4場面');const labels=['BEND','DRIFT','SHED','FLOW'];[...nav.children].forEach((b,i)=>{const item=b.cloneNode(false);item.innerHTML=`<span>0${i+1}</span><small>${labels[i]}</small>`;item.setAttribute('aria-label',b.textContent);item.onclick=b.onclick;rail.append(item)});railWindow.append(rail);reading.prepend(railWindow);
const outro=document.createElement('a');outro.className='vortex-next';outro.href='#vortex-explanation';outro.innerHTML='<small>図解へ</small><strong>板と水の動き</strong><span class=transition-scroll aria-hidden=true><i></i><i></i><i></i><em>scroll</em></span>';stage.append(outro);
const clamp=x=>Math.max(0,Math.min(1,x));const ease=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
function split(el){el.setAttribute('aria-label',el.textContent);const nodes=[];const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const frag=document.createDocumentFragment();for(const char of Array.from(node.textContent)){const mask=document.createElement('span');mask.className='letter-mask';mask.setAttribute('aria-hidden','true');const glyph=document.createElement('span');glyph.className='letter-rise';glyph.textContent=char;mask.append(glyph);frag.append(mask)}node.replaceWith(frag)}}
function rise(el){if(pref.matches||!window.gsap)return;gsap.fromTo(el.querySelectorAll('.letter-rise'),{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.65,stagger:.035,ease:'power3.out',overwrite:true})}
const title=stage.querySelector('.scene-title');split(title.querySelector('h2'));let titleEntered=false,readingEntered=false;
function animateReading(){if(pref.matches||!window.gsap)return;rise(stage.querySelector('.vortex-phase'));gsap.fromTo(stage.querySelector('.vortex-description'),{x:12,opacity:0,clipPath:'inset(0 100% 0 0)'},{x:0,opacity:1,clipPath:'inset(0 0% 0 0)',duration:1.1,delay:.22,ease:'power3.out',overwrite:true});gsap.fromTo(stage.querySelector('details'),{y:22,opacity:0},{y:0,opacity:1,duration:.8,delay:.42,ease:'power3.out',overwrite:true})}
stage.querySelector('details p').textContent='石鹸膜に生まれる渦列を着想に、巻き込みと下流への移動を描いた生成映像です。実験映像や流体計算の再現ではなく、渦の大きさや細部には芸術的な表現を含みます。続く図解では、回転と移動を分けて観察します。';
const link=stage.querySelector('details a');link.href='https://www.jst.go.jp/extra/140527.html';link.textContent='JST：数学で語る「渦」の物語 ↗';
stage.querySelector('.scene-caption').textContent='スクロールで映像を進める・戻す / 渦の流れを描いた生成表現';
const researchTrigger=stage.querySelector('summary');window.researchPanel.decorate(researchTrigger,'渦が生まれる理由を知る');
researchTrigger.addEventListener('click',e=>{e.preventDefault();const n=Math.max(0,phase);if(n===3){document.querySelector('.persistent-chapters a[href="#vortex-explanation"]')?.click();return;}window.researchPanel.open(researchTrigger,{kicker:"VORTEX / "+labels[n],title:phases[n][0],explain:"この場面に関連する研究を選びました　方法と対象が異なる比較資料は区別して読めます",papers:window.itemEvidence.items[["BEND","DRIFT","SHED"][n]],note:"映像は石鹸膜の渦列を着想にした生成表現です　研究の再現ではありません"},e)});
let phase=-1,frame=0;
function show(n){if(n===phase)return;phase=n;window.researchPanel.decorate(researchTrigger,['渦が生まれる理由を知る','渦が運ばれる仕組みを知る','渦が連なる理由を知る','板と水の図解へ'][n]);researchTrigger.setAttribute('aria-haspopup',n===3?'false':'dialog');const articlePages=['paper-vortex-birth.html','paper-vortex-drift.html','paper-vortex-shedding.html','research-index.html#vortex-explanation'];link.href='/personal-aqua/swim-flow-lab/'+articlePages[n];link.textContent=n===3?'図解の論文解説を読む ↗':'この場面の論文解説を読む ↗';link.removeAttribute('target');count.textContent=`0${n+1}`;const heading=stage.querySelector('.vortex-phase');if(window.gsap)gsap.killTweensOf(heading.querySelectorAll('.letter-rise'));heading.textContent=phases[n][0];split(heading);stage.querySelector('.vortex-description').textContent=phases[n][1];stage.style.setProperty('--vortex-phase',n);[nav,rail].forEach(group=>group.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',i===n?'step':'false')));if(readingEntered)animateReading()}
// Hold the outgoing scene while the incoming black stage fades at viewport origin.
function syncEntrance(){
 const top=section.getBoundingClientRect().top,h=innerHeight;
 const entering=!pref.matches&&top>0&&top<h;
 const ahead=!pref.matches&&top>=h;
 const outgoing=document.querySelector('.water-journey .journey-frame');
 section.classList.toggle('vortex-entering',entering);
 section.classList.toggle('vortex-ahead',ahead);
 stage.inert=ahead;
 stage.style.opacity=ahead?'0':'1';
 stage.style.backgroundColor=entering?'rgba(3,26,34,'+(1-top/h)+')':'';
 document.querySelector('.water-journey')?.classList.toggle('vortex-handoff',entering);
 if(outgoing)outgoing.style.transform=entering?`translateY(${Math.max(0,outgoing.offsetHeight-outgoing.parentElement.getBoundingClientRect().bottom)}px)`:'';
}
function update(){
 frame=0;syncEntrance();const p=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight));const reduced=pref.matches;
 const media=reduced?1:ease(.18,.30,p)*(1-ease(.90,.985,p));
 const copy=reduced?1:ease(.025,.075,p)*(1-ease(.84,.90,p));
 const detail=reduced?1:ease(.09,.15,p)*(1-ease(.84,.90,p));
 // The outro deliberately disappears before unpinning; the next figure is already in document flow.
 stage.style.setProperty('--vortex-arrival',media);stage.style.setProperty('--vortex-copy',copy);stage.style.setProperty('--vortex-detail',detail);stage.style.setProperty('--vortex-outro',reduced?0:ease(.89,.94,p)*(1-ease(.96,1,p)));
 stage.classList.toggle('is-dark',media<.55);stage.classList.toggle('is-outro',p>.88);
 for(const el of [reading,nav])el.inert=!reduced&&detail<.1;outro.inert=reduced||p<.89||p>=1;
 if(p>.025&&!titleEntered){rise(title);titleEntered=true}if(p>.09&&!readingEntered){readingEntered=true;animateReading()}
 const motion=clamp((p-.30)/.58);if(!reduced){show(Math.min(3,Math.floor(motion*4)));desired=motion}seek();
}

function request(){if(!frame)frame=requestAnimationFrame(update)}
pref.addEventListener('change',()=>{show(0);request()});addEventListener('scroll',request,{passive:true});addEventListener('resize',request);show(0);request();
})();








