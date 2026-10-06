/* Booking first; questionnaire and consent remain required before attendance. */
(() => {
 const legacy=window.MovenseOnboarding;
 const e=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const submitted=p=>['submitted','legacy_verified'].includes(p?.intake_status);
 const services={'reserve-form':'aqua','training-form':'training','running-form':'running','walking-form':'walking','event-form':'event'};
 const captured=new URLSearchParams(location.search);
 let followupId=captured.get('booking_followup');
 if(!followupId && captured.has('liff.state'))try{followupId=new URL(captured.get('liff.state'),location.origin+location.pathname).searchParams.get('booking_followup');}catch{}
 if(followupId && !/^[a-f0-9-]{36}$/.test(followupId))followupId=null;
 function create({config,endpoint,getToken,forms}){
  let status=null,inflight=null,poll=null,followup=null,followupLoading=false;
  const views=new Map();
  async function api(path,body){
   if(!getToken())throw Error('LINEでログインしてください。');
   let r,d;try{r=await fetch(endpoint+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+getToken(),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});d=await r.json();}catch{throw Error('通信を確認できませんでした。入力はそのままで、もう一度お試しください。');}
   if(!r.ok)throw Error(({line_login_required:'LINEでログインし直してください。',friend_required:'公式LINEを友だち追加してください。',message_required:'公式LINEにスタンプを1つ送ってください。',booking_not_found:'この申込みをしたLINEアカウントでログインしてください。',duplicate_guest:'この方は同じ申込みに登録済みです。',invite_unavailable:'この招待は取り消し済みか、利用できません。公式LINEへご連絡ください。',self_required:'同行者ご本人のお名前で登録してください。',participant_name_mismatch:'登録名と入力したお名前が一致しません。',too_many_requests:'少し時間をおいてお試しください。'})[d.error]||'処理できませんでした。公式LINEへご連絡ください。');return d;
  }
  const companion=window.MovenseCompanions?.create({api,refresh,deferred:true,onUpdate:render});
  const ready=()=>status?.friend&&status?.message_received;
  function total(form){return ['training-form','event-form'].includes(form.id)?1:Number((form.elements.namedItem('people')?.value||views.get(form).count?.value||'').replace(/名$/,''));}
  function own(){return (status?.participants||[]).filter(p=>!p.shared&&['self','child'].includes(p.relationship));}
  function sync(form,v){
   const p=own().find(p=>p.id===v.select.value),name=form.elements.namedItem('name');
   if(p){name.value=p.name;name.readOnly=true;}else name.readOnly=false;
   const n=total(form),multi=form.elements.namedItem('participants');if(multi)multi.value=Number.isInteger(n)?n+'名':'';
   if(form.id==='reserve-form')v.price.textContent=n>=1&&n<=4?`${n}名・1枠（税込）：平日${[11000,16500,21000,24500][n-1].toLocaleString()}円／土日祝${[12500,18000,22500,26000][n-1].toLocaleString()}円`:'';
   if(['running-form','walking-form'].includes(form.id)){const trial=form.elements.namedItem('lesson_type')?.value==='初回体験';v.price.textContent=n?trial?(n===1?`初回体験（税込）：${form.id==='running-form'?'5,000':'4,000'}円`:'複数名の体験料金は、公式LINEでご相談ください。'):`${n}名・通常料金合計（税込）：${((form.id==='running-form'?7000:6000)+(n-1)*1000).toLocaleString()}円`:'';}
  }
  async function openIntake(person,button,result){
   button.disabled=true;result.textContent='問診票を開いています…';
   try{const s=await api('/intake-session',{participant_id:person.id});if(s.submitted){await refresh();return;}
    if(!/^[a-f0-9]{64}$/.test(s.code||'')||s.participant_id!==person.id)throw Error('問診票を確認できませんでした。');
    const u=new URL(config.intakeUrl);u.searchParams.set(config.intakeCodeEntry,s.code);u.searchParams.set('usp','pp_url');location.assign(u.href);
   }catch(err){result.textContent=err.message;}finally{button.disabled=false;}
  }
  function intakeCard(person,container){
   if(!person)return;
   container.append(e('p',person.name+'：'+(submitted(person)?'問診票は提出済みです。再入力不要です。':'初回問診票をご回答ください。')));
   if(!submitted(person)){
    const b=e('button','初回問診票に回答する','pill solid'),r=e('p',null,'hint');b.type='button';r.setAttribute('role','status');b.onclick=()=>openIntake(person,b,r);container.append(b,r,e('p','すでに回答したのに未提出と出る場合は、再回答せず公式LINEへお知らせください。','hint'));
   }
  }
  async function showFollowup(form,v){
   v.after.replaceChildren();v.after.hidden=!followupId&&!companion?.hasIncoming();
   if(companion?.hasIncoming()){
    v.after.hidden=false;v.after.append(e('h3','参加の準備'));
    const accepted=companion.acceptedParticipant();for(const p of own().filter(p=>p.id===accepted))intakeCard(p,v.after);if(!accepted)v.after.hidden=true;
    return;
   }
   if(!followupId)return;
   if(!followup){v.after.hidden=false;v.after.append(e('p','申込み後のご案内を確認しています…'));return;}
   v.after.append(e('h3','申込みを受け付けました'),e('p','受付番号：'+followup.receipt_number),e('p','予約確定は公式LINEでご案内します。'),e('p',followup.deadline));
   intakeCard(followup.primary,v.after);
   if(followup.count>1){
    v.after.append(e('h3','一緒に参加する方へ'),e('p','下の案内を1人ずつ、ご本人とのLINEに貼り付けて送ってください。'));
    for(let slot=1;slot<followup.count;slot++){
     const g=followup.guests.find(g=>g.slot===slot),row=e('div',null,'companion-box');
     if(g?.accepted_at&&!g.revoked_at&&g.name)row.append(e('p',g.name+'：参加確認済み／問診'+(submitted(g)?'提出済み':'未提出')));
     else if(g?.revoked_at||g?.accepted_at)row.append(e('p','この方の登録・許可を確認できません。参加者を変更する場合は、受付番号を添えて公式LINEへご連絡ください。'));
     else{
      const known=(status?.participants||[]).filter(p=>p.shared&&!followup.guests.some(g=>g.id===p.id&&!g.revoked_at));
      if(!g&&known.length){const label=e('label','登録・許可済みの方を選ぶ'),select=e('select');for(const p of known){const o=e('option',p.name);o.value=p.id;select.append(o);}label.append(select);const add=e('button','この方を参加者にする','pill');add.type='button';const result=e('p');result.setAttribute('role','status');add.onclick=async()=>{add.disabled=true;try{await api('/bookings/guest-existing',{booking_id:followupId,slot,participant_id:select.value});await refresh();}catch(err){result.textContent=err.message;add.disabled=false;}};row.append(label,add,result,e('p','新しい方には、下の案内を送ってください。','hint'));}
      const b=e('button',`同行者${slot}人目の案内を表示`,'pill');b.type='button';const result=e('p');result.setAttribute('role','status');
      b.onclick=async()=>{b.disabled=true;try{const invite=await api('/bookings/guest-link',{booking_id:followupId,slot});const text='MOVENSEのレッスンを一緒に申し込みました。こちらからご自身のLINEで参加の確認をお願いします。初回問診票は未提出の場合だけご回答ください。\n'+invite.url;
       const area=e('textarea');area.readOnly=true;area.rows=5;area.value=text;area.setAttribute('aria-label','同行者'+slot+'人目に送る案内');const copy=e('button','案内をコピー','pill');copy.type='button';copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);result.textContent='コピーしました。同行者とのLINEに貼り付けて送ってください。';}catch{area.focus();area.select();result.textContent='文章を選択しました。コピーして送ってください。';}};b.replaceWith(area,copy);
      }catch(err){result.textContent=err.message;b.disabled=false;}};row.append(b,result);
     }v.after.append(row);
    }
    v.after.append(e('p',`${followup.count}名の申込み／参加者登録 ${followup.registered}名／問診提出 ${followup.submitted}名`,'hint'));
   }
   const again=e('button','別の日・種目を申し込む','pill');again.type='button';again.onclick=()=>{followupId=null;followup=null;const u=new URL(location.href);u.searchParams.delete('booking_followup');history.replaceState(null,'',u.href);for(const [f,v]of views){f.reset();if(f.id==='reserve-form')v.count.value='1名';}refresh().catch(err=>v.note.textContent=err.message);};v.after.append(again);
  }
  function render(){
   for(const [form,v] of views){
    const ps=own(),old=v.select.value,key=ps.map(p=>p.id+p.name).join('|');
    if(v.key!==key){v.key=key;v.select.replaceChildren();for(const p of ps){const o=e('option',p.name);o.value=p.id;v.select.append(o);}const add=e('option','新しい方・お子さまのお名前を入力');add.value='new';v.select.append(add);v.select.value=ps.some(p=>p.id===old)?old:ps.length===1?ps[0].id:'new';}
    v.select.hidden=!ps.length;v.nameBox.hidden=v.select.value!=='new';v.relationLabel.hidden=v.select.value!=='new';
    v.register.hidden=!companion?.hasIncoming()||v.select.value!=='new';
    const incoming=companion?.hasIncoming();v.identity.hidden=!ready()||!!followupId||(incoming&&ps.some(p=>p.relationship==='self'));if(v.count){const field=v.count.closest('.field')||v.count.closest('label');if(field)field.hidden=!!incoming;}v.price.hidden=!!incoming;v.partyHint.hidden=!!incoming;v.title.textContent=incoming?'参加するご本人のお名前':['event-form','training-form'].includes(form.id)?'参加する方':'参加する方（複数名は代表の方）';if(incoming){v.relation.value='self';v.relationLabel.hidden=true;}v.talk.hidden=!getToken()||status?.message_received===true;v.retry.hidden=!getToken()||ready();
    v.note.textContent=!getToken()?'LINE連携後に、お名前・人数・日時を選んでお申し込みください。':!ready()?'公式LINEへスタンプを1つ送って、この画面へ戻ってください。送信状況は自動で確認します。':followupId?'申込み済みです。下で受講までの準備をご確認ください。':companion?.hasIncoming()?'LINEの連絡設定ができました。下で参加の確認をしてください。':'LINEの連絡設定ができました。人数・日時を選んでお申し込みください。';
    v.admin.hidden=!status?.is_operator;
    v.manage.hidden=!ps.length||!!followupId||!!incoming;v.manageBody.replaceChildren();for(const person of ps){const button=e('button',person.name+'を名前の一覧から外す','pill');button.type='button';const result=e('p');result.setAttribute('role','status');button.onclick=async()=>{button.disabled=true;try{await api('/participants/archive',{participant_id:person.id});await refresh();}catch(err){result.textContent=err.message;button.disabled=false;}};v.manageBody.append(button,result);}
    const special=!!followupId||companion?.hasIncoming();v.details.hidden=special||!ready();
    if(status)companion?.render(form,status);showFollowup(form,v);sync(form,v);
   }
  }
  async function refresh(){
   if(inflight)return inflight;
   inflight=(async()=>{status=await api('/onboarding/status');if(!status.deferred_intake)throw Error('予約受付を更新中です。少し待ってから開き直してください。');render();
    if(followupId&&!followupLoading){followupLoading=true;try{followup=await api('/bookings/followup',{booking_id:followupId});for(const [f,v]of views)showFollowup(f,v);}catch(err){for(const v of views.values()){v.after.hidden=false;v.after.replaceChildren(e('p',err.message));}}finally{followupLoading=false;}}
    if(ready()&&poll){clearInterval(poll);poll=null;}return status;
   })();try{return await inflight;}finally{inflight=null;}
  }
  function mount(){
   legacy.unlockOnboardingGate(config);
   const intro=document.querySelector('#personal > p:not(.rl)');if(intro)intro.textContent='LINEをつなぐ → 人数・日時を選ぶ → 申込み。問診票は申込み後に、未提出の方だけご案内します。';
   for(const form of forms){
    const region=e('section',null,'field full onboarding');region.setAttribute('aria-label','LINE連絡設定と予約');
    const note=e('p','LINE連携を確認しています…','hint');note.setAttribute('role','status');
    const talk=e('div',null,'onboarding-contact'),open=e('a','公式LINEへスタンプを送る','pill solid');open.href='https://line.me/R/oaMessage/%40177onnkx/';open.target='_blank';open.rel='noopener';talk.append(open);
    const pc=e('details');pc.append(e('summary','PCの方：スマホでLINEを開く'));const qr=e('img');qr.src='assets/line/message-qr.svg';qr.width=180;qr.height=180;qr.alt='公式LINEをスマホで開くQRコード';pc.append(e('p','スマホで読み取り、ログインしたLINEからスタンプを送ってください。PCへのLINEアプリ追加は不要です。'),qr);talk.append(pc);
    if(!legacy.mobileLine(navigator.userAgent,navigator.maxTouchPoints)){open.hidden=true;pc.open=true;}
    const retry=e('button','送信状況を再確認','pill');retry.type='button';retry.onclick=()=>refresh().catch(err=>note.textContent=err.message);
    const identity=e('div'),select=e('select');select.setAttribute('aria-label','参加する方・代表の登録名');const title=e('h3','参加する方（複数名は代表の方）');identity.append(title,select);
    const name=form.elements.namedItem('name'),nameBox=name.closest('.field');name.required=true;name.maxLength=100;identity.append(nameBox);
    const relationLabel=e('label','登録する方'),relation=e('select');relation.setAttribute('aria-label','登録する方');for(const [value,text]of [['self','ご本人'],['child','お子さま（保護者として登録）']]){const o=e('option',text);o.value=value;relation.append(o);}relationLabel.append(relation);identity.append(relationLabel);
    const price=e('p',null,'onboarding-result');price.setAttribute('role','status');
    let count=null;
    if(form.id==='reserve-form'){count=form.elements.namedItem('people');if(!count.value)count.value='1名';identity.append(count.closest('.field'));}
    if(['running-form','walking-form'].includes(form.id)){const original=form.elements.namedItem('participants');original.type='hidden';original.required=false;original.closest('.field').hidden=true;const label=e('label','参加人数'),c=e('input');c.type='number';c.min='1';c.max='20';c.step='1';c.value='1';c.required=true;c.setAttribute('aria-label','参加人数');label.append(c);identity.append(label);count=c;}
    const partyHint=e('p','同行者のお名前・問診票は、申込み後にご案内します。','hint');identity.append(price);if(!['training-form','event-form'].includes(form.id))identity.append(partyHint);
    const details=e('div',null,'simple-booking-details');for(const child of Array.from(form.children))if(!child.matches('[data-line-login-region]')&&child!==nameBox)details.append(child);form.append(details);
    const after=e('section',null,'field full simple-followup');after.hidden=true;after.tabIndex=-1;
    const register=e('button','この名前で登録する','pill');register.type='button';register.hidden=true;identity.append(register);
    region.append(note,talk,retry,identity,after);const login=form.querySelector('[data-line-login-region]');if(login)login.after(region);else form.prepend(region);
    const admin=e('details');admin.hidden=true;admin.append(e('summary','受講前の準備状況（管理者）'));const list=e('div'),load=e('button','最新100件の準備状況を確認','pill');load.type='button';load.onclick=async()=>{load.disabled=true;try{const data=await api('/bookings/preparations',{});list.replaceChildren();for(const item of data.items){const row=e('div',null,'companion-box');row.append(e('strong',item.receipt_number+'／'+(item.primary?.name||'登録確認中')),e('p',item.service+'・'+item.dates),e('p',`${item.count}名／登録 ${item.registered}名／問診提出 ${item.submitted}名`));for(const p of [item.primary,...item.guests.filter(g=>g.name&&!g.revoked_at)])if(p&&!submitted(p))row.append(e('p',p.name+'：問診未提出'));list.append(row);}if(!data.items.length)list.append(e('p','新しい受付方式の申込みはまだありません。'));}catch(err){list.textContent=err.message;}finally{load.disabled=false;}};admin.append(e('p','日程を確認し、受講3日前までに未提出の方へLINEでご案内ください。自動催促・自動キャンセルは行いません。','hint'),load,list);region.append(admin);
    const manage=e('details'),manageBody=e('div');manage.append(e('summary','間違えた名前を一覧から外す'),e('p','予約・問診の記録は残ります。「登録・許可の管理」から一覧に戻せます。','hint'),manageBody);identity.append(manage);
    const v={region,note,talk,retry,identity,select,nameBox,relationLabel,relation,count,price,details,after,register,admin,title,partyHint,manage,manageBody};views.set(form,v);
    register.onclick=async()=>{register.disabled=true;try{if(!ready())throw Error('LINE連絡設定を先に済ませてください。');const n=name.value.trim();if(!n)throw Error('フルネームを入力してください。');if(!v.pending||v.pending.name!==n||v.pending.relationship!==relation.value)v.pending={id:crypto.randomUUID(),name:n,relationship:relation.value};const p=(await api('/participants',v.pending)).participant;await refresh();select.value=p.id;render();}catch(err){note.textContent=err.message;}finally{register.disabled=false;}};
    select.onchange=()=>{if(select.value==='new')name.value='';render();};count?.addEventListener('change',()=>sync(form,v));form.elements.namedItem('lesson_type')?.addEventListener('change',()=>sync(form,v));
    companion?.mount(form,region,identity);
    form.addEventListener('reset',()=>setTimeout(()=>sync(form,v),0));
   }
   const resume=()=>{if(document.visibilityState!=='hidden'&&getToken())refresh().catch(err=>{for(const v of views.values())v.note.textContent=err.message;});};
   window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);window.addEventListener('pageshow',resume);
   render();poll=setInterval(()=>{if(!ready())resume();},7000);
  }
  async function beforeSubmit(form){
   const v=views.get(form);await refresh();if(!ready())throw Error('LINE連携とスタンプ送信を先に済ませてください。');
   if(companion?.hasIncoming()||followupId)throw Error('この画面は参加の準備用です。同じ予約を送信する必要はありません。');
   let p=own().find(p=>p.id===v.select.value);
   if(!p){const name=form.elements.namedItem('name').value.trim();if(!name)throw Error('参加される方のフルネームを入力してください。');if(!v.pending||v.pending.name!==name||v.pending.relationship!==v.relation.value)v.pending={id:crypto.randomUUID(),name,relationship:v.relation.value};p=(await api('/participants',v.pending)).participant;await refresh();v.select.value=p.id;sync(form,v);}
   const n=total(form);if(!Number.isInteger(n)||n<1||n>(form.id==='reserve-form'?4:20))throw Error('参加人数を確認してください。');
   return {booking_flow:'deferred-intake-v1',participant_ids:[p.id],participant_count:n};
  }
  function afterSubmit(form,data){
   if(!data?.id)return;followupId=data.id;followup=null;
   const u=new URL(location.href);u.searchParams.set('booking_followup',followupId);history.replaceState(null,'',u.href);
   refresh().finally(()=>{const v=views.get(form);if(v){v.after.focus({preventScroll:true});window.scrollTo({top:v.after.getBoundingClientRect().top+scrollY-100,behavior:'instant'});}}).catch(()=>{});
  }
  return {mount,refresh,beforeSubmit,afterSubmit,redirectContext:()=>({followupId,companionCode:companion?.currentCode?.()})};
 }
 window.MovenseOnboarding={...legacy,create};
})();

