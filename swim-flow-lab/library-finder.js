(() => {
 const groups=[...document.querySelectorAll('[data-library-group]')];if(!groups.length)return;
 const chips=[...document.querySelectorAll('.reader-categories [data-category]')],cards=groups.flatMap(g=>[...g.querySelectorAll('.water-card,.journal-card')]);
 const count=document.querySelector('#library-count'),results=document.querySelector('#library-results');
 const motion=window.createCardEntrance?.(cards);let selected='all';
 const valid=id=>id==='all'||groups.some(g=>g.dataset.libraryGroup===id);
 function fromURL(){const hash=location.hash.slice(1),legacy=new URLSearchParams(location.search).get('category');return valid(hash)?hash:valid(legacy)?legacy:'all';}
 function apply(id,{scroll=false,focus=false}={}){
  selected=valid(id)?id:'all';
  groups.forEach(g=>{g.hidden=selected!=='all'&&g.dataset.libraryGroup!==selected;if(!g.hidden)motion?.reset(g);});
  chips.forEach(c=>{if(c.dataset.category===selected)c.setAttribute('aria-current','true');else c.removeAttribute('aria-current');});
  document.dispatchEvent(new Event('reader-category-change'));
  const visible=cards.filter(c=>!c.closest('[data-library-group]').hidden);
  const unique=new Set(visible.map(c=>new URL(c.matches('a')?c.href:c.querySelector('a').href).pathname));
  count.textContent=`${unique.size}記事 · ${visible.length}の入口`;
  if(scroll){const target=selected==='all'?results:groups.find(g=>g.dataset.libraryGroup===selected);target.scrollIntoView({behavior:'instant',block:'start'});if(focus){target.tabIndex=-1;target.focus({preventScroll:true});}}
 }
 chips.forEach(chip=>chip.addEventListener('click',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();
  const url=new URL(location.href);url.searchParams.delete('q');url.searchParams.delete('category');url.hash=chip.dataset.category==='all'?'library-results':chip.dataset.category;
  if(url.href!==location.href)history.pushState(null,'',url);
  apply(chip.dataset.category,{scroll:true,focus:e.detail===0});
 }));
 addEventListener('popstate',()=>apply(fromURL(),{scroll:true}));
 addEventListener('hashchange',()=>apply(fromURL(),{scroll:true}));
 apply(fromURL());
 if(location.hash||new URLSearchParams(location.search).has('category'))requestAnimationFrame(()=>apply(fromURL(),{scroll:true}));
})();
