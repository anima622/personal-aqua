/* Production: verified operator email plus customer and operator LINE notifications. */
(() => {
  const params = new URLSearchParams(location.search);
  const config = {enabled: true, liffId: '2011810726-i3NW4lrJ', endpoint: 'https://watari-booking-receipts.wayo0402.workers.dev'};
  // Enable only after the participant / questionnaire integration is verified end to end.
  const onboardingConfig = {enabled:true,intakeUrl:'https://docs.google.com/forms/d/e/1FAIpQLSe-IXjpAZPVBa8f1LVDQy-pEXFxd-gkNz_fRn4wQoSY22cpZQ/viewform',intakeCodeEntry:'entry.642782807'};
  const forms = ['reserve-form', 'training-form', 'running-form', 'walking-form', 'event-form'].map(id => document.getElementById(id)).filter(Boolean);
  const messages = {
    line_login_required: 'ご予約には公式LINEの友だち追加が必要です。①友だち追加 → ②LINEでログインの順に進めてください。追加済みの方は②からで大丈夫です。',
    friend_required: '公式LINEの友だち追加を確認できませんでした。①友だち追加・ブロック解除を行い、このページに戻って②LINEでログインを押してください。まだ申込みは送信していません。',
    invalid_booking: '入力内容を確認してください。お名前は100文字、備考は1500文字以内で入力できます。',
    request_conflict: '受付内容の確認が必要です。再申込みせず、公式LINEへお問い合わせください。',
    too_many_requests: '短時間に多くの申込みがありました。公式LINEへお問い合わせください。',
    not_ready: 'LINE受付は現在準備中です。公式LINEへ直接ご相談ください。',
    event_closed: 'このイベントの受付は終了しました。公式LINEへお問い合わせください。',
    temporary_failure: '受付結果を確認できませんでした。入力内容を変えずに再度送信すると、同じ受付番号で確認します。'
  };
  const states = new Map();
  const notices = [];
  let ready, setupError, onboarding;
  function read(key) {try{return JSON.parse(sessionStorage.getItem(key));}catch{return null;}}
  function write(key,value) {try{sessionStorage.setItem(key,JSON.stringify(value));}catch{/* In-memory retry keys still work until reload. */}}
  function clear(key) {try{sessionStorage.removeItem(key);}catch{}}
  function say(text) {for(const n of notices)n.textContent=text;}
  const hash = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
  function draft(anchor=location.hash) {
    const values=[];
    // Free-text notes can contain health information; never persist them in browser drafts.
    for(const form of forms) for(const el of form.elements) if(el.id && ['INPUT','SELECT'].includes(el.tagName) && el.name!=='note') values.push({id:el.id,value:el.value,checked:el.checked});
    write('watari-booking-draft',{expires:Date.now()+30*60*1000,values,anchor,slots:Array.from(document.querySelectorAll('.slot.selected')).map(el=>el.dataset.id),active:document.querySelector('.service-toggle [aria-selected="true"]')?.id.replace('toggle-','') || 'aqua'});
  }
  function restore() {
    const saved=read('watari-booking-draft');clear('watari-booking-draft');
    if(!saved || saved.expires<Date.now())return;
    for(const value of saved.values||[]) {const el=document.getElementById(value.id);if(el && el.tagName!=='TEXTAREA' && el.name!=='note'){el.value=value.value;if(el.type==='checkbox')el.checked=value.checked;}}
    for(const id of saved.slots||[]) for(const el of document.querySelectorAll('.slot')) if(el.dataset.id===id && !el.classList.contains('selected'))el.click();
    if(['aqua','training','running','walking','event'].includes(saved.active))document.querySelector('[aria-controls="panel-'+saved.active+'"]')?.click();
    if(saved.anchor==='#event-reserve')location.hash='event-reserve';
  }
  async function loadSDK() {
    if(window.liff)return;
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://static.line-scdn.net/liff/edge/2/sdk.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
  }
  async function connection() {
    if(!window.liff.isLoggedIn()) {say(messages.line_login_required);return false;}
    const friend=await window.liff.getFriendship();
    if(!friend.friendFlag){say(messages.friend_required);return false;}
    say('LINE連携済み ✓ 申込み後、このLINEアカウントに受付控えをお送りします。');
    if(onboardingConfig.enabled)await onboarding.refresh();
    return true;
  }
  async function init() {
    if(!config.enabled)return;
    if(!config.liffId || !/^(https:\/\/|http:\/\/127\.0\.0\.1:)/.test(config.endpoint))throw new Error('not_ready');
    for(const form of forms){
      const region=document.createElement('div');region.className='field full';region.dataset.lineLoginRegion='true';
      const guide=document.createElement('p');guide.className='line-booking-guide';guide.textContent='ご予約の受付控え・日程調整は、公式LINEでお届けします😊 ①友だち追加 → ②LINEでログインの順に進めてください。追加済みの方は②からで大丈夫です。';
      const note=document.createElement('p');note.className='hint';note.setAttribute('role','status');note.textContent='ご予約には公式LINEの友だち追加とLINE連携が必要です。';notices.push(note);
      const connect=document.createElement('button');connect.type='button';connect.className='line-official-login';connect.setAttribute('aria-label','LINEでログインして予約用に連携する');connect.innerHTML='<img src="assets/line/login-icon.png" width="44" height="44" alt=""><span>LINEでログイン</span>';
      connect.addEventListener('click',async()=>{connect.disabled=true;try{await ready;if(!window.liff.isLoggedIn()){draft(form.id==='event-form'?'#event-reserve':location.hash);const service={'reserve-form':'aqua','training-form':'training','running-form':'running','walking-form':'walking','event-form':'event'}[form.id];const redirect=new URL(location.origin+location.pathname);redirect.searchParams.set('booking_service',service);const eventId=form.elements.namedItem('event_id')?.value;if(service==='event' && /^[a-z0-9-]{1,80}$/.test(eventId||''))redirect.searchParams.set('booking_event',eventId);window.liff.login({redirectUri:redirect.href});return;}await connection();}catch{say('LINEとの接続を確認できません。ページを開き直してください。');}finally{connect.disabled=false;}});
      const friend=document.createElement('a');friend.href='https://line.me/R/ti/p/%40177onnkx';friend.target='_blank';friend.rel='noopener';friend.className='line-official-friend';friend.setAttribute('aria-label','MOVENSE公式LINEを友だち追加（新しいタブ）');friend.innerHTML='<img src="assets/line/add-friend-ja.png" alt="友だち追加" width="232" height="72">';
      const purpose=document.createElement('p');purpose.className='hint';purpose.textContent='LINEの識別情報と申込み内容を、受付控えの送信・予約のご連絡に利用します。初回シートが未回答の方は、公式LINEに「問診票」とお送りください。初回は問診の確認後に予約確定をご連絡します。';
      if(form.id==='event-form'){
        guide.textContent='参加申込の受付控えと参加可否は、公式LINEでお届けします。①友だち追加 → ②LINEでログインの順に進めてください。追加済みの方は②からお進みください。';
        purpose.textContent='LINEの識別情報と申込み内容を、受付控えの送信・参加可否やお支払いのご連絡に利用します。送信だけでは予約確定・席の確保にはなりません。';
      }
      if(onboardingConfig.enabled){
        guide.textContent='① LINE連絡設定 → ② 初回シート → ③ 申込み';
        purpose.textContent='初回シートは未提出の方だけ。参加確定は申込み後にLINEでご案内します。';
      }
      const actions=document.createElement('div');actions.className='line-official-actions';const friendStep=document.createElement('div');friendStep.className='line-official-step';const friendLabel=document.createElement('p');friendLabel.textContent=onboardingConfig.enabled?'公式LINEを友だち追加':'① 公式LINEを友だち追加';friendStep.append(friendLabel,friend);const loginStep=document.createElement('div');loginStep.className='line-official-step';const loginLabel=document.createElement('p');loginLabel.textContent=onboardingConfig.enabled?'LINEでログインして連携':'② LINEでログインして連携';loginStep.append(loginLabel,connect);actions.append(friendStep,loginStep);region.append(guide,actions,note,purpose);form.prepend(region);
      const name=form.elements.namedItem('name');if(name)name.maxLength=100;
      const noteField=form.elements.namedItem('note');if(noteField)noteField.maxLength=1500;
    }
    if(onboardingConfig.enabled){
      if(!window.MovenseOnboarding || !window.MovenseOnboarding.configured(onboardingConfig))throw new Error('onboarding_not_ready');
      onboarding=window.MovenseOnboarding.create({config:onboardingConfig,endpoint:config.endpoint,getToken:()=>window.liff?.getAccessToken(),forms});onboarding.mount();
    }
    await loadSDK();await window.liff.init({liffId:config.liffId});
    // Do not consume the draft on LIFF's intermediate redirect.
    if(!params.has('liff.state'))restore();
    const resumedService=params.get('booking_service');
    if(['aqua','training','running','walking','event'].includes(resumedService)){
      document.querySelector('[aria-controls="panel-'+resumedService+'"]')?.click();
      if(resumedService==='event')location.hash='event-reserve';
    }
    await connection();
  }
  // Deferred so the existing calendar and its event listeners are ready for restoration.
  ready=new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true})).then(init).catch(error=>{setupError=error;say('LINEとの接続を確認できません。ページを開き直してください。');});
  window.WatariBooking={
    enabled:config.enabled,
    async submit(form){
      await ready;
      if(setupError)return {ok:false,message:messages.not_ready};
      if(!await connection())return {ok:false,message:window.liff?.isLoggedIn()?messages.friend_required:messages.line_login_required};
      let participantData={};
      if(onboardingConfig.enabled){try{participantData=await onboarding.beforeSubmit(form);}catch(error){return {ok:false,message:error.message};}}
      const booking=Object.fromEntries(new FormData(form));delete booking._subject;
      const fingerprint=await hash(JSON.stringify(onboardingConfig.enabled ? {booking,...participantData} : booking));
      const key='watari-booking-request-'+form.id;
      let saved=states.get(key)||read(key);
      if(!saved || saved.fingerprint!==fingerprint || saved.expires<Date.now()) saved={id:crypto.randomUUID(),fingerprint,expires:Date.now()+24*60*60*1000};
      states.set(key,saved);write(key,saved);
      if(saved.accepted)return {ok:true,message:saved.message};
      let response,data;
      try{
        response=await fetch(config.endpoint+'/reservations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+window.liff.getAccessToken()},body:JSON.stringify({id:saved.id,booking,...participantData}),signal:AbortSignal.timeout(20000)});
        data=await response.json();
      }catch{return {ok:false,message:messages.temporary_failure};}
      if(!response.ok || !data.accepted)return {ok:false,message:messages[data.error]||messages.temporary_failure};
      const next=booking.service==='特別イベント'?'定員・お申込み内容を確認し、参加可否とお支払いのご案内を公式LINEでお送りします。':'施設・日程を確認してご連絡します。';
      const message=`お申込みを受け付けました😊 受付番号：${data.receipt_number||data.id}。公式LINEへ内容の控えをお送りします。予約はまだ確定していません。${next}控えが届かない場合も再申込みせず、この受付番号を公式LINEへお知らせください。`;
      states.set(key,{...saved,accepted:true,message});write(key,{...saved,accepted:true,message});clear('watari-booking-draft');
      return {ok:true,message};
    }
  };
})();
