(() => {
 const header=document.querySelector('.reader-header');if(!header)return;
 const measure=()=>document.documentElement.style.setProperty('--reader-header-height',`${Math.ceil(header.getBoundingClientRect().height)}px`);
 measure();new ResizeObserver(measure).observe(header);
 const rail=header.querySelector('.reader-categories');
 function alignCurrent(){const current=rail.querySelector('[aria-current]');if(current&&rail.scrollWidth>rail.clientWidth)rail.scrollLeft=Math.max(0,current.offsetLeft-rail.offsetLeft-20);}
 alignCurrent();document.addEventListener('reader-category-change',alignCurrent);addEventListener('resize',alignCurrent);
 function anchor(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target&&!document.querySelector('[data-library-group]'))target.scrollIntoView({block:'start',behavior:'instant'});}
 if(location.hash)requestAnimationFrame(anchor);
 document.fonts.ready.then(measure);
})();
