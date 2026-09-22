(() => {
 const boot=()=>{
 const rail=document.createElement('aside');rail.className='chapter-progress';rail.setAttribute('aria-label','現在の章のスクロール進行');
 rail.innerHTML='<span class="cp-name"></span><span class="cp-percent"></span><div class="cp-track" role="progressbar" aria-label="章の進行" aria-valuemin="0" aria-valuemax="100"><i></i><div class="cp-ticks"></div></div><span class="cp-end">章の終わり</span>';
 document.body.append(rail);
 const name=rail.querySelector('.cp-name'),percent=rail.querySelector('.cp-percent'),track=rail.querySelector('.cp-track'),fill=rail.querySelector('i'),ticks=rail.querySelector('.cp-ticks');
 const definitions=[
 ['.water-journey','水滴',true,.16,[.16,.294,.3945,.696,.83]],
 ['#water-vortex','渦',true,0,[.30,.445,.59,.735,.89]],
 ['#vortex-explanation','図解',true,0,[.08,.36,.64,.94]],
 ['#water-properties','密度・粘性と水深・圧力',false,0,[]],
 ['#water-flow','形と流れ',false,0,[]],
 ['#water-fields','水を見る視点',false,0,[]],
 ['#feature','特集',false,0,[]],
 ['#journal','読み物',false,0,[]]];
 let frame=0,last='';
 const clamp=x=>Math.max(0,Math.min(1,x));
 function update(){frame=0;let found=null;for(const d of definitions){const el=document.querySelector(d[0]);if(!el)continue;const r=el.getBoundingClientRect();if(r.top<=innerHeight*.12&&r.bottom>innerHeight*.12){found={d,el,r};break;}}
 if(!found){rail.hidden=true;return;}const {d,el,r}=found;const span=d[2]?Math.max(1,(d[0]==='#vortex-explanation'?el.shadowRoot?.querySelector('.story')?.offsetHeight||r.height:r.height)-innerHeight):Math.max(1,r.height-innerHeight*.24);
 const raw=clamp(-r.top/span);if(raw<d[3]){rail.hidden=true;return;}rail.hidden=false;
 const value=clamp((raw-d[3])/(1-d[3])),n=Math.round(value*100);name.textContent=d[1];percent.textContent=n+'%';track.setAttribute('aria-valuenow',String(n));track.setAttribute('aria-valuetext',d[1]+'の章 '+n+'パーセント');fill.style.transform='scaleY('+value+')';track.style.setProperty('--progress',String(value));
 if(last!==d[0]){last=d[0];ticks.replaceChildren();d[4].forEach((point,i)=>{const tick=document.createElement('b');tick.style.top=(clamp((point-d[3])/(1-d[3]))*100)+'%';tick.textContent=i===d[4].length-1?'次':String(i+1).padStart(2,'0');ticks.append(tick)});}
 }
 function request(){if(!frame)frame=requestAnimationFrame(update);}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);update();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
