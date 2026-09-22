/* Kinematic teaching model: prescribed centres, not a Navier–Stokes solver. */
(()=>{
const duration=16, speed=.072, interval=1.35;
function centres(time){const list=[];for(let id=0;id<7;id++){const born=.8+id*interval,age=time-born;if(age<0)continue;const side=id%2===0?-1:1;list.push({id,born,age,x:.14+speed*age,y:.5+side*.105,spin:-side,growth:Math.min(1,age/1.25),opacity:Math.max(0,Math.min(1,(1.12-(.14+speed*age))/.2))})}return list}
window.VortexMotion={duration,centres,speed};
window.createVortexRenderer=function(host){
const canvas=document.createElement('canvas');canvas.className='vortex-canvas';canvas.setAttribute('aria-hidden','true');host.replaceChildren(canvas);const ctx=canvas.getContext('2d');let time=0,tracking=false,w=1,h=1;const texture=new Image();texture.src='/personal-aqua/swim-flow-lab/vortex-water-texture.png';texture.onload=()=>render(time);
if(!ctx)return {render(){},track(){}};
function render(t){time=t;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);const d=canvas.width/w;ctx.setTransform(d,0,0,d,0,0);const s=Math.min(w/1000,h/460);ctx.translate((w-1000*s)/2,(h-460*s)/2);ctx.scale(s,s);
const bg=ctx.createLinearGradient(0,0,1000,460);bg.addColorStop(0,'#f4fcff');bg.addColorStop(.5,'#d8f1fa');bg.addColorStop(1,'#eefaff');ctx.fillStyle=bg;ctx.fillRect(0,0,1000,460);
// Quiet caustic-like lighting, constant in time so it cannot suggest reverse flow.
for(let i=0;i<27;i++){ctx.beginPath();for(let j=0;j<=100;j++){const x=j*10,y=i*22-65+22*Math.sin(x*.009+i*1.8)+13*Math.sin(x*.023+i*.73);j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle='rgba(255,255,255,.34)';ctx.lineWidth=1+(i%3)*.5;ctx.stroke()}
const fade=ctx.createLinearGradient(0,0,1000,0);fade.addColorStop(0,'#e9f7fc00');fade.addColorStop(.1,'#218cc244');fade.addColorStop(1,'#348bbb00');
for(let i=0;i<13;i++){ctx.beginPath();for(let j=0;j<=100;j++){const x=j*10,off=(i-6)*4.4,near=Math.exp(-(((x-132)/82)**2)),y=230+off+Math.sign(off||1)*near*48*Math.exp(-Math.abs(off)/55);j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=fade;ctx.lineWidth=.6;ctx.stroke()}
const list=centres(t);for(const v of list){if(v.x>1.13)continue;const cx=v.x*1000,cy=v.y*460,R=52*(.06+.94*v.growth),rotation=v.spin*v.age*.78;
ctx.save();ctx.globalAlpha=v.opacity*Math.min(1,v.age/.32);ctx.globalCompositeOperation='multiply';
if(texture.complete&&texture.naturalWidth){ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha*=.8;ctx.translate(cx,cy);ctx.rotate(rotation);ctx.scale(1,v.spin);const size=R*3.2;ctx.drawImage(texture,-size*.534,-size*.54,size,size);ctx.restore()}else for(let strand=0;strand<58;strand++){const band=(strand/57-.5),phase=rotation+band*.45;ctx.beginPath();for(let k=0;k<=100;k++){const u=k/100,r=R*(.075+.925*u)*(1+band*.3),a=v.spin*(1-u)*Math.PI*3.05+phase,noise=1+.035*Math.sin(u*25+strand*.9+v.id);const x=cx+Math.cos(a)*r*noise,y=cy+Math.sin(a)*r*.84; k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=`rgba(${strand%5===0?'8,98,170':'25,146,206'},${.026+(strand%7)*.005})`;ctx.lineWidth=strand%9===0?1.4:.65;ctx.stroke()}
ctx.globalCompositeOperation='source-over';for(let j=0;j<8;j++){const a=rotation+v.spin*j*.65,r=R*(.24+j*.074);ctx.beginPath();ctx.ellipse(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.84,1.2,.7,a,0,Math.PI*2);ctx.fillStyle='#ffffffa0';ctx.fill()}ctx.restore();
if(tracking&&v.id===1){ctx.strokeStyle='#086d95';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.stroke();ctx.font='16px sans-serif';ctx.fillStyle='#12506a';ctx.fillText('同じ渦の中心 →',cx-45,cy+90)}
}
const plate=ctx.createLinearGradient(128,0,139,0);plate.addColorStop(0,'#8dadba');plate.addColorStop(.5,'#edf8fc');plate.addColorStop(1,'#618b9b');ctx.fillStyle=plate;ctx.beginPath();ctx.roundRect(128,179,9,102,4);ctx.fill();
ctx.fillStyle='#3e7589';ctx.font='15px sans-serif';ctx.fillText('流れの向き  →',38,118);
canvas.dataset.time=t.toFixed(3);
}
function resize(){w=host.clientWidth;h=host.clientHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);render(time)}new ResizeObserver(resize).observe(host);resize();return{render,track(value){tracking=value;render(time)}};
};
})();



