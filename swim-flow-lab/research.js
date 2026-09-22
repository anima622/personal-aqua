import Lenis from '/personal-aqua/swim-flow-lab/vendor/lenis.mjs';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const lenis=new Lenis({smoothWheel:!reduced.matches,autoRaf:true,anchors:true});
const gs=window.gsap;

const sections=[...document.querySelectorAll('.answer')];let raf=0;
function paint(){raf=0;document.documentElement.style.setProperty('--read',scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));const current=[...sections].reverse().find(s=>s.getBoundingClientRect().top<innerHeight*.4);document.querySelectorAll('.question-index nav a').forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+current?.id)));if(gs&&!reduced.matches){/* Keep the reading illustration still, so it does not hurry the reader. */}}
addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(paint)},{passive:true});paint();
const track=document.querySelector('.frame-track');function slide(d){track.scrollBy({left:d*(track.querySelector('figure').getBoundingClientRect().width+28),behavior:reduced.matches?'instant':'smooth'})}document.querySelector('.frame-prev')?.addEventListener('click',()=>slide(-1));document.querySelector('.frame-next')?.addEventListener('click',()=>slide(1));track?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();slide(e.key==='ArrowRight'?1:-1)}});reduced.addEventListener('change',()=>{lenis.options.smoothWheel=!reduced.matches;if(reduced.matches&&gs){gs.globalTimeline.getChildren().forEach(t=>t.progress(1));}});

if(!sessionStorage.getItem('water-return')){document.querySelector('.return-link') && (document.querySelector('.return-link').textContent='水滴の観察へ ↗');}
