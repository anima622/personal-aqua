(() => {
 function boot(){
 const header=document.createElement('div');header.className='persistent-chapters';
 const sections=[['top','Top'],['water-observation','Water drop'],['water-vortex','Vortex'],['vortex-explanation','板と水の動き'],['water-properties','Water science'],['water-flow','Shape & flow'],['water-fields','水を知る視点'],['feature','特集'],['journal','論文を読む'],['water-ending','実験の入口']];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 header.innerHTML='<a class="persistent-brand" href="#top" aria-label="SWIM FLOW LAB トップ">SWIM<br>FLOW LAB</a><button class="persistent-menu" aria-expanded="false" aria-controls="persistent-nav">章を選ぶ ＋</button><nav id="persistent-nav" aria-label="サイトの章">'+sections.map(([id,label],i)=>'<a href="#'+id+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+label+'</a>').join('')+'</nav>';
 const quick=document.createElement('div');quick.className='persistent-quick-links';quick.innerHTML='<a href="/research-index.html">記事を読む</a><a class="persistent-lab-link" href="/simulator">シミュレーターを試す ↗</a>';header.append(quick);
 document.body.append(header);
 const button=header.querySelector('button');
 button.innerHTML='<span class="persistent-menu-label">章を選ぶ ＋</span><span class="persistent-menu-bars" aria-hidden="true"><i></i><i></i><i></i></span>';
 const nav=header.querySelector('nav'),articleNav=document.createElement('div');articleNav.className='persistent-article-links';
 const articleLinks=[...document.querySelectorAll('.journal-category')];
 articleNav.innerHTML='<p>記事のカテゴリ</p>'+articleLinks.map((a,i)=>'<a href="'+a.hash+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+a.children[1].textContent+'</a>').join('')+'<p>サイトの章</p>';
 nav.prepend(articleNav);
 const destinations=document.createElement('div');destinations.className='persistent-destinations';destinations.innerHTML='<a href="/research-index.html">記事を読む <span>↗</span></a><a href="/simulator">シミュレーター <span>↗</span></a>';nav.prepend(destinations);
 function closeMenu(restore=false){header.classList.remove('is-open');button.setAttribute('aria-expanded','false');if(restore)button.focus();}
 button.onclick=()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));header.classList.toggle('is-open',open)};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('is-open')){closeMenu(true);}});
 document.addEventListener('pointerdown',e=>{if(header.classList.contains('is-open')&&!nav.contains(e.target)&&!button.contains(e.target))closeMenu();});
 header.addEventListener('focusout',e=>{if(e.relatedTarget&&!header.contains(e.relatedTarget))closeMenu();});
 function position(id){
  if(window.waterJournal?.ids.includes(id))return scrollY+(window.waterJournal.mobile?document.getElementById(id):window.waterJournal.element).getBoundingClientRect().top-(window.waterJournal.mobile?76:0);
  const journey=document.querySelector('.water-journey');
  if(journey&&!reduced.matches&&(id==='top'||id==='water-observation'))return scrollY+journey.getBoundingClientRect().top+(id==='top'?0:.25*Math.max(1,journey.offsetHeight-innerHeight));
  const target=document.getElementById(id);return target?scrollY+target.getBoundingClientRect().top:null;
 }
 header.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||a.pathname!==location.pathname||!a.hash||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const top=position(a.hash.slice(1));if(top===null)return;e.preventDefault();history.pushState(null,'',a.hash);if(window.waterScroller)window.waterScroller.scrollTo(top,{immediate:reduced.matches});else window.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});closeMenu();const target=document.getElementById(a.hash.slice(1));if(target){if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});}});
 let pending=false;
 function update(){
  pending=false;let active='top';
  for(const [id] of sections){if(!window.waterJournal?.mobile&&window.waterJournal?.ids.includes(id)&&id!==window.waterJournal.selected)continue;const top=position(id);if(top!==null&&top<=scrollY+2)active=id;}
  // Choose the arriving chapter once it occupies most of the viewport.
  for(const [id] of sections.slice(2)){if(!window.waterJournal?.mobile&&window.waterJournal?.ids.includes(id)&&id!==window.waterJournal.selected)continue;const top=position(id);if(top!==null&&top<=scrollY+innerHeight*.35)active=id;}
  header.classList.toggle('on-properties-light',['water-flow','water-fields','feature','journal'].includes(active));
  const journalRect=window.waterJournal?.element.getBoundingClientRect();
  header.classList.toggle('on-journal',!!journalRect&&journalRect.top<innerHeight*.35&&journalRect.bottom>80);
  button.setAttribute('aria-label',header.classList.contains('on-journal')?'記事カテゴリとサイトの章を開く':'サイトの章を開く');
  header.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
  const root=document.querySelector('#vortex-explanation')?.shadowRoot;if(root&&!root.querySelector('#shared-header-reset')){const style=document.createElement('style');style.id='shared-header-reset';style.textContent='.brand,.hint{display:none!important}';root.append(style)}
 }
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('load',request);reduced.addEventListener('change',request);
 new ResizeObserver(request).observe(document.body);update();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
