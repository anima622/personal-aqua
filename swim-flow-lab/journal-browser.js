/* A single manually selected article shelf; no automatic category rotation. */
(() => {
 const root=document.getElementById('reading-journal');if(!root)return;
 const categories=root.querySelector('.journal-categories');
 const tabs=[...root.querySelectorAll('.journal-category')];
 const panels=[...root.querySelectorAll('.journal-category-panel')];
 const ids=panels.map(p=>p.id),reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:600px)');
 categories.setAttribute('role','tablist');categories.setAttribute('aria-orientation','vertical');
 root.classList.add('journal-enhanced');
 tabs.forEach((tab,i)=>{tab.setAttribute('role','tab');tab.setAttribute('aria-controls',ids[i]);});
 panels.forEach(panel=>{panel.setAttribute('role','tabpanel');panel.tabIndex=0;});
 let selected='water-properties',pendingFade=null;
 document.addEventListener('keydown',()=>{if(pendingFade)pendingFade.finish();},true);
 reduced.addEventListener('change',()=>{if(reduced.matches&&pendingFade)pendingFade.finish();});
 const labels=tabs.map(tab=>tab.children[1].textContent);
 tabs.forEach((tab,i)=>{
  const subtitle=document.createElement('span');subtitle.className='journal-category-subtitle';subtitle.textContent=panels[i].querySelector('h3').textContent;tab.append(subtitle);
  const heading=document.createElement('h3');heading.className='journal-mobile-heading';heading.id='journal-heading-'+ids[i];
  heading.innerHTML='<span class="journal-mobile-count">'+String(i+1).padStart(2,'0')+'<small>/05</small></span><span>'+labels[i]+'</span><span aria-hidden="true">↗</span>';
  panels[i].prepend(heading);
 });
 const tabletIndex=root.querySelector('.journal-heading>a').cloneNode(true);tabletIndex.classList.add('journal-tablet-index');categories.after(tabletIndex);
 function semantics(){
  categories.setAttribute('role',mobile.matches?'navigation':'tablist');
  if(mobile.matches)categories.removeAttribute('aria-orientation');else categories.setAttribute('aria-orientation','vertical');
  tabs.forEach((tab,i)=>{
   if(mobile.matches){tab.removeAttribute('role');tab.removeAttribute('aria-selected');tab.removeAttribute('aria-controls');tab.tabIndex=0;}
   else{tab.setAttribute('role','tab');tab.setAttribute('aria-controls',ids[i]);}
   panels[i].setAttribute('role',mobile.matches?'region':'tabpanel');
   panels[i].setAttribute('aria-labelledby',mobile.matches?'journal-heading-'+ids[i]:tab.id);
  });
 }
 function select(id,{focus=false,historyEntry=false}={}){
  if(pendingFade){pendingFade.cancel();pendingFade=null;}
  const index=ids.indexOf(id);if(index<0)return false;selected=id;
  tabs.forEach((tab,i)=>{if(!mobile.matches)tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=mobile.matches||i===index?0:-1;panels[i].hidden=!mobile.matches&&i!==index;});
  if(focus)tabs[index].focus({preventScroll:true});
  if(historyEntry&&location.hash!=='#'+id)history.pushState(null,'','#'+id);
  window.dispatchEvent(new Event('resize'));return true;
 }
 window.waterJournal={select,ids,labels,get selected(){return selected;},get mobile(){return mobile.matches;},element:root};
 semantics();
 mobile.addEventListener('change',()=>{
  const focusedPanel=document.activeElement.closest?.('.journal-category-panel');
  const rect=root.getBoundingClientRect(),inside=(rect.top<100&&rect.bottom>100)||!!focusedPanel;
  if(!mobile.matches&&inside){
   const current=panels.filter(panel=>panel.getBoundingClientRect().top<=100).at(-1);
   if(current)selected=current.id;
  }
  if(focusedPanel)selected=focusedPanel.id;
  semantics();select(selected);
  if(inside)requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const target=mobile.matches?document.getElementById(selected):root;
   const top=scrollY+target.getBoundingClientRect().top-(mobile.matches?76:0);
   if(window.waterScroller){window.waterScroller.resize();window.waterScroller.scrollTo(top,{immediate:true});}else scrollTo({top,behavior:'instant'});
  }));
 });
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',event=>{
   if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();
   if(!event.detail||reduced.matches||mobile.matches){select(ids[i],{historyEntry:true});return;}
   if(pendingFade){pendingFade.cancel();pendingFade=null;}
   if(ids[i]===selected)return;
   const fade=panels[ids.indexOf(selected)].animate([{opacity:1},{opacity:0}],{duration:600,easing:'ease-in-out',fill:'forwards'});
   pendingFade=fade;
   fade.onfinish=()=>{if(pendingFade!==fade)return;fade.cancel();pendingFade=null;select(ids[i],{historyEntry:true});};
  });
  tab.addEventListener('keydown',event=>{
   let index=i;if(event.key==='ArrowDown'||event.key==='ArrowRight')index=(i+1)%tabs.length;
   else if(event.key==='ArrowUp'||event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;
   else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;
   else if(event.key===' '||event.key==='Enter'){event.preventDefault();select(ids[i],{historyEntry:true});return;}else return;
   event.preventDefault();tabs.forEach((t,n)=>t.tabIndex=n===index?0:-1);tabs[index].focus();
  });
 });
 function fromHash(){select(location.hash.slice(1));}
 select(ids.includes(location.hash.slice(1))?location.hash.slice(1):ids[0]);
 // Earlier chapters mount after this deferred script. Resolve deep links after
 // their layout and web fonts settle, unless the visitor has already interacted.
 const entryHash=location.hash;let interacted=false;
 const noteInteraction=()=>{interacted=true;};
 ['wheel','touchstart','pointerdown','keydown'].forEach(name=>addEventListener(name,noteInteraction,{once:true,passive:true}));
 const loaded=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>addEventListener('load',resolve,{once:true}));
 Promise.all([loaded,document.fonts.ready]).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(interacted||location.hash!==entryHash||!(ids.includes(entryHash.slice(1))||entryHash==='#reading-journal'))return;
  const target=mobile.matches&&ids.includes(entryHash.slice(1))?document.getElementById(entryHash.slice(1)):root;
  const top=scrollY+target.getBoundingClientRect().top-(mobile.matches?76:0);
  if(window.waterScroller){window.waterScroller.resize();window.waterScroller.scrollTo(top,{immediate:true});}else scrollTo({top,behavior:'instant'});
 })));
 addEventListener('hashchange',fromHash);addEventListener('popstate',()=>{select(ids.includes(location.hash.slice(1))?location.hash.slice(1):ids[0]);});
 document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(a&&!root.contains(a))select(a.hash.slice(1));},true);
 // Retain the existing plate-to-next-section cover, without a second scroll engine.
 const previous=document.getElementById('vortex-explanation');
 if(previous?.shadowRoot){previous.dataset.coverNext='true';const style=document.createElement('style');style.textContent=':host{position:relative;z-index:1;overflow:visible}.end{display:none}';previous.shadowRoot.append(style);}

 const marquee=root.querySelector('.journal-marquee'),track=root.querySelector('.journal-marquee-track');
 const group=track.firstElementChild,toggle=root.querySelector('.journal-motion-toggle');
 let tween,visible=false,userPaused=false;
 const sync=()=>{if(tween){const play=visible&&!document.hidden&&!userPaused&&!reduced.matches;tween.paused(!play);}toggle.hidden=!tween||reduced.matches;};
 function measure(){
  const phase=tween?.progress()||0;tween?.kill();tween=null;
  if(reduced.matches||!window.gsap){track.style.transform='';sync();return;}
  const width=group.getBoundingClientRect().width;
  // A slower continuous current, coordinated with the broad article entrances.
  tween=gsap.fromTo(track,{x:0},{x:-width,duration:width/Math.max(24,innerWidth*.035),ease:'none',repeat:-1,paused:true});
  tween.progress(phase);sync();
 }
 toggle.addEventListener('click',()=>{userPaused=!userPaused;toggle.setAttribute('aria-pressed',String(userPaused));toggle.textContent=userPaused?'文字の動きを再生':'文字の動きを停止';sync();});
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(marquee);
 const sizeObserver=new ResizeObserver(measure);sizeObserver.observe(group);
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',measure);document.fonts.ready.then(measure);measure();
 addEventListener('pagehide',()=>{tween?.pause();});addEventListener('pageshow',sync);
})();
