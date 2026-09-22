(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)');document.querySelectorAll('[data-water-scene]').forEach(host=>{const c=document.createElement('canvas'),ctx=c.getContext('2d');if(!ctx){host.dataset.failed='true';return}host.append(c);let w=0,h=0,active=false,frame=0,t=0,last=0;const kind=host.dataset.waterScene;function size(){w=host.clientWidth;h=host.clientHeight;const d=Math.min(devicePixelRatio,1.5);c.width=w*d;c.height=h*d;ctx.setTransform(d,0,0,d,0,0);draw()}
function draw(){ctx.clearRect(0,0,w,h);if(kind==='vortex'){
ctx.fillStyle='#031921';ctx.fillRect(0,0,w,h);
const cycle=reduced.matches?7:Math.min(15.999,t);
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const curl=smooth((cycle-2)/5),travel=smooth((cycle-7)/6),fade=1-smooth((cycle-12)/4);
const cx=w*(w<700?.57:.66)+travel*w*.24,cy=h*.48,scale=Math.min(w,h)*.34;
const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.5);glow.addColorStop(0,'#0c4250');glow.addColorStop(1,'#031921');ctx.globalAlpha=.3+.7*curl*fade;ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
ctx.globalCompositeOperation='screen';
for(let j=0;j<78;j++){ctx.beginPath();const band=(j/77-.5);for(let k=0;k<=150;k++){
const u=k/150,r=(.08+u)*scale;
const angle=Math.log(u+.065)*4.2+band*.7+t*.22;
const straightX=cx+(u-.5)*scale*3.3,straightY=cy+band*scale*.72;
const rollX=cx+Math.cos(angle)*r,rollY=cy+Math.sin(angle)*r*.65;
const x=straightX+(rollX-straightX)*curl,y=straightY+(rollY-straightY)*curl;
if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}
ctx.strokeStyle=`rgba(140,224,232,${(.055+(j%7)*.01)*(.15+.85*fade)})`;ctx.lineWidth=j%9===0?1.3:.65;ctx.stroke()}
// Persistent upstream traces show the direction while the rolled-up form travels away.
for(let j=0;j<12;j++){const y=cy+(j-5.5)*scale*.09;ctx.beginPath();ctx.moveTo(w*.08,y);ctx.bezierCurveTo(w*.3,y,w*.4,y-20*curl,w*.48,y-40*curl);ctx.strokeStyle='#82dae71a';ctx.lineWidth=1;ctx.stroke();const x=w*.08+((t*.09+j*.061)%1)*w*.35;ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fillStyle='#afeaf16a';ctx.fill()}
ctx.globalCompositeOperation='source-over';
const phase=cycle<2?0:cycle<7?1:cycle<12?2:3;
const phases=[['01 / 流れを見る','流れている線を、たどる。'],['02 / 巻き込む','流れの形が曲がり、巻き込みが育つ。'],['03 / 運ばれる','回転する形が、流れとともに移動する。'],['04 / ほどける','輪郭が広がり、見えにくくなる。']];
const parent=host.closest('section'),label=parent.querySelector('.vortex-phase'),caption=parent.querySelector('.vortex-description');
if(label&&label.textContent!==phases[phase][0].split(' / ')[1]){label.textContent=phases[phase][0].split(' / ')[1];caption.textContent=phases[phase][1]}
host.dataset.phase=String(phase);
}else{const cx=w*.5,cy=h*.5,R=Math.min(w,h)*.16;ctx.fillStyle='#e8efed';ctx.fillRect(0,0,w,h);for(let j=-10;j<=10;j++){if(j===0)continue;const y0=j*h/24;ctx.beginPath();for(let k=0;k<=100;k++){const x=k*w/100;const dx=x-cx;const spread=Math.exp(-dx*dx/(R*R*4))*R*.95*Math.sign(y0);const y=cy+y0+spread*Math.exp(-Math.abs(y0)/(R*2.5));if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.strokeStyle='#3a7b8b50';ctx.lineWidth=1;ctx.stroke();const x=((t*45+j*73)% (w+100)+w+100)%(w+100)-50;const dx=x-cx,y=cy+y0+Math.exp(-dx*dx/(R*R*4))*R*.95*Math.sign(y0)*Math.exp(-Math.abs(y0)/(R*2.5));ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fillStyle='#23748b';ctx.fill()}
const g=ctx.createRadialGradient(cx-R*.4,cy-R*.5,1,cx,cy,R);g.addColorStop(0,'#b5d3d8');g.addColorStop(.55,'#3d7587');g.addColorStop(1,'#102f40');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,R*.68,R,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f1ffffaa';ctx.lineWidth=1;ctx.stroke()}}
function tick(now){frame=0;if(kind==='vortex')return;if(!active||document.hidden||reduced.matches)return;if(now-last>32){t+=Math.min((now-last)/1000,.06);last=now;draw()}frame=requestAnimationFrame(tick)}function sync(){cancelAnimationFrame(frame);frame=0;if(active&&!document.hidden&&!reduced.matches){last=performance.now();frame=requestAnimationFrame(tick)}else draw()}if(kind==='vortex'){const scrollDraw=()=>{const section=host.closest('section');t=Math.max(0,Math.min(1,-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)))*16;draw()};addEventListener('scroll',scrollDraw,{passive:true});addEventListener('resize',scrollDraw);scrollDraw()}new ResizeObserver(size).observe(host);new IntersectionObserver(([e])=>{active=e.isIntersecting;sync()},{rootMargin:'100px'}).observe(host);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);size()})})();