import {phaseResearch} from '/personal-aqua/swim-flow-lab/phase-research.js';
import {createJourney} from '/personal-aqua/swim-flow-lab/water-journey.js?v=20260915-center-titles-3';
import Lenis from '/personal-aqua/swim-flow-lab/vendor/lenis.mjs';
const section=document.querySelector('.observation');
if(section){
 const pref=matchMedia('(prefers-reduced-motion: reduce)'),gs=window.gsap;
 const lenis=new Lenis({duration:1.05,smoothWheel:!pref.matches,autoRaf:true,anchors:false});
 window.waterScroller=lenis;
 const journey=createJourney(section);journey.element.classList.add('film-journey','chapter-layout');
 const video=document.createElement('video');video.src='/personal-aqua/swim-flow-lab/water-drop-crown-joined.mp4';video.poster='/personal-aqua/swim-flow-lab/water-drop-start.png';video.muted=true;video.playsInline=true;video.preload='auto';section.querySelector('.observation-canvas').append(video);
 section.querySelector('.observation-note').remove();
 section.querySelector('.observation-credit').textContent='水の動きを表現した生成映像';
 section.querySelector('.observation-top').innerHTML='<a class="chapter-brand" href="#top">SWIM<br>FLOW LAB</a><nav class="chapter-index" aria-label="サイトの章"><a href="#top">01 <span>Top</span></a><a href="#water-observation" aria-current="location">02 <span>Water drop</span></a><a href="#water-vortex">03 <span>Vortex</span></a><a href="#water-flow">04 <span>Shape & flow</span></a><a href="#water-fields">05 <span>水を知る視点</span></a><a href="#feature">06 <span>特集</span></a></nav>';
 // One wordmark stays on the same visual plane while its plate develops.
 const brand=document.createElement('a');brand.className='journey-brand';brand.href='#top';brand.setAttribute('aria-label','SWIM FLOW LAB トップ');brand.innerHTML='SWIM<br>FLOW LAB';journey.element.querySelector('.journey-frame').append(brand);
 brand.addEventListener('click',e=>{e.preventDefault();journey.go(0)});
 const menu=document.createElement('button');menu.type='button';menu.className='chapter-menu-toggle';menu.textContent='章を選ぶ ＋';menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-controls','water-chapter-index');section.querySelector('.chapter-index').id='water-chapter-index';section.querySelector('.observation-top').append(menu);menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'閉じる ×':'章を選ぶ ＋';section.querySelector('.chapter-index').classList.toggle('is-open',open)});section.querySelectorAll('.chapter-index a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');menu.textContent='章を選ぶ ＋';section.querySelector('.chapter-index').classList.remove('is-open')}));
 section.querySelectorAll('a[href="#top"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();journey.go(0)}));
 section.querySelector('a[href="#water-observation"]').addEventListener('click',e=>{e.preventDefault();journey.go(.25)});
 const chapterLinks=[...section.querySelectorAll('.chapter-index a')];
 const compactNav=matchMedia('(max-width:650px)');
 function paintChapterNav(p){chapterLinks.forEach((link,i)=>{const raw=Math.max(0,Math.min(1,(p-.19-i*.009)/.065));const t=pref.matches||compactNav.matches?1:raw*raw*(3-2*raw);link.style.transform=`translateX(${(1-t)*110}px)`;link.style.opacity=String(t);link.style.visibility=t===0?'hidden':'visible';});}
 function splitHeading(el){
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){const frag=document.createDocumentFragment();for(const char of Array.from(node.textContent)){const mask=document.createElement('span');mask.className='letter-mask';const glyph=document.createElement('span');glyph.className='letter-rise';glyph.textContent=char;mask.append(glyph);frag.append(mask);}node.replaceWith(frag);}
 }
 const chapterHeading=section.querySelector('.observation-copy h2');splitHeading(chapterHeading);
 let headingEntered=false;
 function riseLetters(el){if(!gs||pref.matches)return;gs.fromTo(el.querySelectorAll('.letter-rise'),{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.65,stagger:.035,ease:'power3.out',overwrite:true});}
 function paintHeading(p){const entered=p>=.19||pref.matches;if(entered&&!headingEntered)riseLetters(chapterHeading);headingEntered=entered;}
 const phases=[
 {name:'DROP',title:'落ちるほど、勢いを持つ',text:'重力に引かれ、高さのエネルギーが運動のエネルギーへ変わります。',next:'触れた瞬間、水面の下では？',more:'落下の間に得た勢いは、着水によって水面の変形や周囲の流れへ移ります。まずは水滴だけでなく、受け止める水面にも目を向けてみてください。'},
 {name:'IMPACT',title:'水面の上と下が、一緒に動く',text:'落下の勢いが水面を押し広げ、くぼみと周囲の立ち上がりが連動します。',next:'水は、なぜ上にも立ち上がる？',more:'着水を、接触した瞬間の空気、広がるくぼみ、残される気泡の3つの問いから読み解きます。それぞれ別の研究を紹介します。'},
 {name:'CROWN',title:'伸びる水の縁から、小さな滴へ',text:'薄い水の膜が立ち上がり、条件によって縁から小さな滴が離れます。',next:'弾けたあと、何が広がる？',more:'薄い膜が上へ伸びる一方、表面張力はその上昇を抑える側にも働きます。王冠は、表面張力だけで持ち上げられるわけではありません。大きさ・速さ・粘性・水深によって、見える姿は変わります。'},
 {name:'RIPPLE',title:'広がるのは、水面の揺れ',text:'水面の変形が波として伝わり、エネルギーを運びます。水が輪と一緒に進むわけではありません。',next:'波の先へ。次は、渦を見る',more:'水の移動と、波の伝わり方は分けて考えます。水面が順に変形することで、揺れが周囲へ伝わります。波の説明は、王冠の研究とは別に、大学物理の教材をもとに整理しました。'}
 ];
 const stage=section.querySelector('.observation-stage');
 const deck=document.createElement('div');deck.className='chapter-deck';
 deck.innerHTML='<div class="chapter-rail-window"><nav class="chapter-rail" aria-label="水滴の4場面">'+phases.map((p,i)=>`<button type="button" data-scene="${i}" aria-label="${i+1} ${p.name}の場面へ"><span>${String(i+1).padStart(2,'0')}</span><small>${p.name}</small></button>`).join('')+'</nav></div><div class="chapter-story"><h3></h3><p></p><button class="research-trigger" type="button" aria-haspopup="dialog"><span aria-hidden="true">＋</span> 仕組みと研究を読む</button></div>';
 stage.append(deck);
 const positions=[.25,.31,.48,.74];deck.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>journey.go(positions[Number(b.dataset.scene)])));
 const discover=document.createElement('button');discover.className='water-discover';discover.type='button';discover.innerHTML='<span class="discover-label">この先の発見</span><span class="discover-question"></span><span class="discover-arrow" aria-hidden="true">↓</span>';
 section.querySelector('.observation-bottom').prepend(discover);
 const dialog=window.researchPanel.dialog;
 let phase=-1,wanted=0,pending=0;
 const trigger=deck.querySelector('.research-trigger');
 window.researchPanel.decorate(trigger,'水滴の変化を読み解く');
 trigger.addEventListener('click',e=>{sessionStorage.setItem('water-return',String(journey.position()));const i=Math.max(0,phase),d=phases[i];window.researchPanel.open(trigger,{kicker:'WATER DROP / '+d.name,title:d.title,explain:d.more,papers:phaseResearch[i].papers.map(p=>({href:'/personal-aqua/swim-flow-lab/paper-'+p.id+'.html',title:p.title,meta:p.method+' · '+p.authors.split(' · ')[1],meaning:p.summary,scope:p.scope})),note:'映像は生成表現です　研究の実験映像や計算結果ではありません'},e)});
 discover.addEventListener('click',()=>journey.go([.31,.48,.74,.95][Math.max(0,phase)]));
 const meter=document.createElement('span');meter.className='chapter-motion-mark';meter.setAttribute('aria-hidden','true');section.querySelector('.observation-bottom').prepend(meter);
 const animation=window.lottie?.loadAnimation({container:meter,renderer:'svg',loop:false,autoplay:false,path:'/personal-aqua/swim-flow-lab/water-progress.json'});
 function seek(){if(video.readyState>=2&&!video.seeking&&Math.abs(video.currentTime-wanted)>.025)video.currentTime=wanted;}
 let detailEntered=false;
 function animateDetail(){
  if(!gs||pref.matches)return;
  const heading=deck.querySelector('h3'),copy=deck.querySelector('.chapter-story>p');
  const active=deck.querySelector('[aria-current="step"]');
  gs.killTweensOf([copy,trigger,trigger.querySelector('span'),...deck.querySelectorAll('.chapter-rail button span,.chapter-rail button small')]);
  riseLetters(heading);
  if(active){
   gs.fromTo(active.querySelector('span'),{y:34,opacity:0},{y:0,opacity:1,duration:.85,ease:'power3.out',overwrite:true});
   gs.fromTo(active.querySelector('small'),{x:-15,opacity:0},{x:0,opacity:1,duration:.75,delay:.15,ease:'power3.out',overwrite:true});
  }
  gs.fromTo(copy,{clipPath:'inset(0 100% 0 0)',x:12,opacity:0},{clipPath:'inset(0 0% 0 0)',x:0,opacity:1,duration:1.1,delay:.22,ease:'power3.out',overwrite:true});
  gs.fromTo(trigger,{y:22,opacity:0,scale:.97},{y:0,opacity:1,scale:1,duration:.8,delay:.42,ease:'power3.out',overwrite:true});
  gs.fromTo(trigger.querySelector('span'),{rotation:-90},{rotation:0,duration:.8,delay:.5,ease:'power3.out',overwrite:true});
 }
 function changePhase(next){gs?.killTweensOf(deck.querySelectorAll('.letter-rise'));const direction=next>phase?1:-1;phase=next;const data=phases[phase];journey.element.dataset.scene=String(phase);deck.querySelector('h3').textContent=data.title;splitHeading(deck.querySelector('h3'));deck.querySelector('.chapter-story>p').textContent=data.text;discover.querySelector('.discover-question').textContent=data.next;deck.querySelectorAll('[data-scene]').forEach((b,i)=>{b.setAttribute('aria-current',i===phase?'step':'false');b.tabIndex=0;});
 if(detailEntered)animateDetail();
 }
 function update(){pending=0;if(dialog.open)return;const p=journey.position();journey.paint(p);paintHeading(p);paintChapterNav(p);const logoT=Math.max(0,Math.min(1,(p-.035)/.205));journey.element.style.setProperty('--logo-progress',String(logoT*logoT*(3-2*logoT)));journey.element.style.setProperty('--film-copy',String(Math.max(0,Math.min(1,(p-.19)/.05))));const t=Math.max(0,Math.min(1,(p-.16)/.67));wanted=pref.matches?Math.max(0,(video.duration||6.29)-.05):t*Math.max(0,(video.duration||6.29)-.05);journey.element.style.setProperty('--progress',t);journey.element.style.setProperty('--film-shade',String(Math.max(0,Math.min(1,(p-.83)/.15))));journey.element.style.setProperty('--chapter-drift',pref.matches?'0px':`${(t-.5)*-12}px`);
 const next=pref.matches?3:t<.2?0:t<.35?1:t<.8?2:3;if(next!==phase)changePhase(next);if(!detailEntered&&p>=.225&&p<.83){detailEntered=true;animateDetail();}/* Reduced motion is a static reading surface: keep its research trigger available. */deck.inert=!pref.matches&&p>=.83;section.querySelectorAll('.journey-steps button').forEach((b,i)=>{b.setAttribute('aria-current',i===(p>=.83&&!pref.matches?4:phase)?'step':'false');});animation?.goToAndStop(t*89,true);seek();}
 function schedule(){if(!pending)pending=requestAnimationFrame(update)}
 video.addEventListener('loadeddata',schedule);video.addEventListener('seeked',seek);video.addEventListener('error',()=>section.classList.add('is-unavailable'));addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{lenis.resize();schedule()});pref.addEventListener('change',()=>{lenis.options.smoothWheel=!pref.matches;schedule()});addEventListener('pageshow',schedule);update();
 if(new URLSearchParams(location.search).has('return')){const saved=Number(sessionStorage.getItem('water-return'));if(saved>=.24&&saved<=.83)requestAnimationFrame(()=>journey.go(saved));}
}


