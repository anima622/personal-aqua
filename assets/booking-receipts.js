/* Production: verified operator email plus customer and operator LINE notifications. */
(() => {
  const params = new URLSearchParams(location.search);
  const config = {enabled: true, liffId: '2011810726-i3NW4lrJ', endpoint: 'https://watari-booking-receipts.wayo0402.workers.dev'};
  const forms = ['reserve-form', 'training-form'].map(id => document.getElementById(id));
  const messages = {
    line_login_required: '受付控えをお届けするため、先に「LINEと連携する」を押してください。',
    friend_required: '公式LINEの友だち追加・ブロック解除後に、もう一度連携を確認してください。まだ申込みは送信していません。',
    invalid_booking: '入力内容を確認してください。お名前は100文字、備考は1500文字以内で入力できます。',
    request_conflict: '受付内容の確認が必要です。再申込みせず、公式LINEへお問い合わせください。',
    too_many_requests: '短時間に多くの申込みがありました。公式LINEへお問い合わせください。',
    not_ready: 'LINE受付は現在準備中です。公式LINEへ直接ご相談ください。',
    temporary_failure: '受付結果を確認できませんでした。入力内容を変えずに再度送信すると、同じ受付番号で確認します。'
  };
  const states = new Map();
  const notices = [];
  let ready, setupError;
  function read(key) {try{return JSON.parse(sessionStorage.getItem(key));}catch{return null;}}
  function write(key,value) {try{sessionStorage.setItem(key,JSON.stringify(value));}catch{/* In-memory retry keys still work until reload. */}}
  function clear(key) {try{sessionStorage.removeItem(key);}catch{}}
  function say(text) {for(const n of notices)n.textContent=text;}
  const hash = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
  function draft() {
    const values=[];
    for(const form of forms) for(const el of form.elements) if(el.id && ['INPUT','SELECT','TEXTAREA'].includes(el.tagName)) values.push({id:el.id,value:el.value,checked:el.checked});
    write('watari-booking-draft',{expires:Date.now()+30*60*1000,values,slots:Array.from(document.querySelectorAll('.slot.selected')).map(el=>el.dataset.id),active:document.getElementById('panel-training')?.hidden?'aqua':'training'});
  }
  function restore() {
    const saved=read('watari-booking-draft');clear('watari-booking-draft');
    if(!saved || saved.expires<Date.now())return;
    for(const value of saved.values||[]) {const el=document.getElementById(value.id);if(el){el.value=value.value;if(el.type==='checkbox')el.checked=value.checked;}}
    for(const id of saved.slots||[]) for(const el of document.querySelectorAll('.slot')) if(el.dataset.id===id && !el.classList.contains('selected'))el.click();
    if(saved.active==='training')document.querySelector('[aria-controls="panel-training"]')?.click();
  }
  async function loadSDK() {
    if(window.liff)return;
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://static.line-scdn.net/liff/edge/2/sdk.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
  }
  async function connection() {
    if(!window.liff.isLoggedIn()) {say(messages.line_login_required);return false;}
    const friend=await window.liff.getFriendship();
    if(!friend.friendFlag){say(messages.friend_required);return false;}
    say('LINE連携済み ✓ 申込み後、このLINEアカウントに受付控えをお送りします。');return true;
  }
  async function init() {
    if(!config.enabled)return;
    if(!config.liffId || !/^(https:\/\/|http:\/\/127\.0\.0\.1:)/.test(config.endpoint))throw new Error('not_ready');
    for(const form of forms){
      const region=document.createElement('div');region.className='field full';
      const note=document.createElement('p');note.className='hint';note.setAttribute('role','status');note.textContent='申込み内容の控えは公式LINEに届きます。初めての方は、送信前にLINEと連携してください。';notices.push(note);
      const connect=document.createElement('button');connect.type='button';connect.className='pill';connect.textContent='LINEと連携する';
      connect.addEventListener('click',async()=>{connect.disabled=true;try{await ready;if(!window.liff.isLoggedIn()){draft();window.liff.login({redirectUri:location.origin+location.pathname});return;}await connection();}catch{say('LINEとの接続を確認できません。ページを開き直してください。');}finally{connect.disabled=false;}});
      const friend=document.createElement('a');friend.href='https://line.me/R/ti/p/%40177onnkx';friend.target='_blank';friend.rel='noopener';friend.className='pill';friend.textContent='公式LINEを友だち追加';
      const purpose=document.createElement('p');purpose.className='hint';purpose.textContent='LINEの識別情報と申込み内容を、受付控えの送信・予約のご連絡に利用します。';
      region.append(note,connect,document.createTextNode(' '),friend,purpose);form.prepend(region);
      const name=form.elements.namedItem('name');if(name)name.maxLength=100;
      const noteField=form.elements.namedItem('note');if(noteField)noteField.maxLength=1500;
    }
    await loadSDK();await window.liff.init({liffId:config.liffId});
    // Do not consume the draft on LIFF's intermediate redirect.
    if(!params.has('liff.state'))restore();
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
      const booking=Object.fromEntries(new FormData(form));delete booking._subject;
      const fingerprint=await hash(JSON.stringify(booking));
      const key='watari-booking-request-'+form.id;
      let saved=states.get(key)||read(key);
      if(!saved || saved.fingerprint!==fingerprint || saved.expires<Date.now()) saved={id:crypto.randomUUID(),fingerprint,expires:Date.now()+24*60*60*1000};
      states.set(key,saved);write(key,saved);
      if(saved.accepted)return {ok:true,message:saved.message};
      let response,data;
      try{
        response=await fetch(config.endpoint+'/reservations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+window.liff.getAccessToken()},body:JSON.stringify({id:saved.id,booking}),signal:AbortSignal.timeout(20000)});
        data=await response.json();
      }catch{return {ok:false,message:messages.temporary_failure+' 受付番号：'+saved.id};}
      if(!response.ok || !data.accepted)return {ok:false,message:messages[data.error]||messages.temporary_failure};
      const message=`お申込みを受け付けました😊 受付番号：${data.id}。公式LINEへ内容の控えをお送りします。予約はまだ確定していません。施設・日程を確認してご連絡します。控えが届かない場合も再申込みせず、この受付番号を公式LINEへお知らせください。`;
      states.set(key,{...saved,accepted:true,message});write(key,{...saved,accepted:true,message});clear('watari-booking-draft');
      return {ok:true,message};
    }
  };
})();
