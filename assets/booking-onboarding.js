/* Opt-in onboarding. This module never stores questionnaire answers in the browser. */
(() => {
  const normalizeName = value => String(value || '').normalize('NFKC').replace(/\s/g, '');
  const submitted = person => ['submitted','legacy_verified'].includes(person.intake_status);
  const singleParticipant = form => ['event-form','training-form'].includes(form.id);
  const mobileLine = (ua, touchPoints=0) => /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && touchPoints > 1);
  function configured(config) {
    try {
      const url = new URL(config.intakeUrl);
      return url.origin === 'https://docs.google.com' && /^\/forms\//.test(url.pathname) && /^entry\.\d+$/.test(config.intakeCodeEntry);
    } catch { return false; }
  }
  function validate(status, ids, count, name) {
    if (!status || status.enabled !== true) return '初回受付の準備ができていません。時間をおいて再度お試しください。';
    if (status.friend !== true) return '公式LINEを友だち追加して、もう一度確認してください。';
    if (status.message_received !== true) return '公式LINEへメッセージかスタンプを1つ送り、戻って確認してください。';
    if (!Number.isInteger(count) || count < 1 || ids.length !== count || new Set(ids).size !== ids.length) return '参加人数分の参加者を選んでください。';
    const people = ids.map(id => status.participants?.find(person => person.id === id));
    if (people.some(person => !person)) return '参加者を選び直してください。';
    if (people.some(person => !submitted(person))) return '参加される全員の初回シートをご提出ください。';
    if (normalizeName(name) !== normalizeName(people[0].name)) return '参加者を選び直してください。お名前は自動で反映されます。';
    return '';
  }
  function returnUrl(location, service, eventId) {
    const url = new URL(location.origin + location.pathname);
    if (['aqua','training','running','walking','event'].includes(service)) url.searchParams.set('booking_service', service);
    if (service === 'event' && /^[a-z0-9-]{1,80}$/.test(eventId || '')) url.searchParams.set('booking_event', eventId);
    return url.href;
  }
  function updateIntroductions(config, root=document) {
    if(config.enabled!==true)return;
    const copy={
      '#personal > p:not(.rl)':'LINE連絡設定 → 初回シート → 申込み。初回シートは未提出の方だけ必要です。',
      '#flow .stepc:nth-child(2) h3':'連絡設定・初回シート・申込み',
      '#flow .stepc:nth-child(2) p':'LINE連絡設定と初回シートの送信後、そのまま申込みへ。受付控えはLINEに届きます。',
      '.reserve-aside li:nth-child(1) span':'サービス・ご希望日時を選ぶ',
      '.reserve-aside li:nth-child(2) span':'LINE連絡設定・初回シート（提出済みの方は不要）',
      '.reserve-aside li:nth-child(3) span':'内容を確認して申し込む'
    };
    for(const [selector,text] of Object.entries(copy)){const node=root.querySelector(selector);if(node)node.textContent=text;}
    const link=root.querySelector('#personal > a.textlink');
    if(link){link.textContent='申込みに進む ↓';link.setAttribute('href','#tog-lab');link.removeAttribute('target');link.removeAttribute('rel');}
  }
  function unlockOnboardingGate(config, unlock=window.unlockGate) {
    if(config.enabled!==true)return;
    if(typeof unlock!=='function')throw new Error('申込み画面を開けませんでした。ページを開き直してください。');
    // Do not persist this override: switching the feature off must restore the legacy gate.
    unlock(false);
    const content=document.getElementById('gated-content');
    if(content){
      // The legacy reveal animation can leave an unlocked form at opacity zero.
      window.gsap?.killTweensOf?.(content);
      content.style.setProperty('opacity','1','important');
      content.style.setProperty('visibility','visible','important');
    }
  }
  function create({config, endpoint, getToken, forms}) {
    const regions = new Map();
    let status = null, refreshing = null, lastRefresh = 0, listenersMounted = false;
    async function api(path, body) {
      const token = getToken();
      if (!token) throw new Error('LINEでログインしてからお進みください。');
      let response,data;
      try {
        response = await fetch(endpoint + path, {method:body ? 'POST' : 'GET',headers:{Authorization:'Bearer ' + token,...(body ? {'Content-Type':'application/json'} : {})},...(body ? {body:JSON.stringify(body)} : {}),signal:AbortSignal.timeout(15000)});
        data = await response.json();
        if(!data || typeof data!=='object')throw new Error('invalid_response');
      } catch {throw new Error('接続を確認できませんでした。入力を残したまま、もう一度お試しください。');}
      if (!response.ok) {
        const companionErrors={invite_unavailable:'この招待は使用できません。取り消し済み、または別の方が使用済みです。',invite_expired:'招待の期限が切れています。代表者に新しいリンクを作ってもらってください。',invite_self:'これはあなたが作った招待です。同行者へリンクを送ってください。',self_required:'ご本人のお名前を登録・選択してください。',consent_required:'代理申込みへの許可を確認してください。'};
        const errors={line_login_required:'LINEでログインし直してからお進みください。',friend_required:'公式LINEを友だち追加して、もう一度確認してください。',message_required:'公式LINEにメッセージかスタンプを1つ送ってください。',intake_required:'参加される全員の初回シートをご提出ください。',invalid_participants:'参加人数と参加者の選択を確認してください。',participant_name_mismatch:'参加者のお名前を確認してください。',participant_not_found:'参加者を選び直してください。',participant_conflict:'参加者情報を確認できません。公式LINEへご相談ください。',too_many_requests:'少し時間をおいてから、もう一度お試しください。',not_ready:'初回受付の準備ができていません。時間をおいて再度お試しください。'};
        throw new Error(companionErrors[data.error] || (data.error==='companion_pending'?'同行者の許可待ちです。参加しない方の招待は取り消してください。':errors[data.error]) || '確認できませんでした。少し待って、もう一度お試しください。');
      }
      return data;
    }
    const element = (tag, text, className) => {const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
    const companionUI=window.MovenseCompanions?.create({api,refresh});
    const receiptFeedback = current => current.friend!==true?'友だち追加をまだ確認できません。追加後にもう一度お試しください。':current.message_received!==true?'まだメッセージを確認できません。LINEで送信後、もう一度押してください。':'メッセージを確認しました ✓ '+(current.participants.length?'参加者と初回シートの状態を更新しました。':'下に参加者のお名前をご入力ください。');
    function selected(view) {return Array.from(view.list.querySelectorAll('input:checked')).map(input => input.value);}
    function count(form, ids) {return form.id === 'reserve-form' ? Number.parseInt(form.elements.namedItem('people')?.value,10) : ['running-form','walking-form'].includes(form.id) ? ids.length : 1;}
    function sync(form, view) {
      const people=selected(view).map(id=>status?.participants?.find(person=>person.id===id)).filter(Boolean);
      const name=form.elements.namedItem('name');
      if(name){name.readOnly=true;if(people[0]){name.value=people[0].name;name.dispatchEvent(new Event('input',{bubbles:true}));}else{name.value='';}}
      const participants=form.elements.namedItem('participants');
      if(participants){participants.value=people.length ? `${people.length}名（${people.map(person=>person.name).join('・')}）` : '';participants.readOnly=true;}
      if(view.price){
        const n=people.length;
        if(form.id==='reserve-form')view.price.textContent=n>0&&n<=4?`${n}名・1枠の料金（税込）：平日${[11000,16500,21000,24500][n-1].toLocaleString()}円／土日祝${[12500,18000,22500,26000][n-1].toLocaleString()}円`:n>4?'アクアは1〜4名でお申し込みください。':'';
        else if(['running-form','walking-form'].includes(form.id))view.price.textContent=n?`${n}名・通常料金合計（税込）：${((form.id==='running-form'?7000:6000)+(n-1)*1000).toLocaleString()}円。体験は1名料金を掲載しています。複数名の体験料金は事前にご相談ください。`:'';
      }
      if(status?.friend && status?.message_received && people.length){
        view.note.textContent=companionUI?.hasIncoming()?'同行者としての連携を確認してください。申込みは代表者が行います。':!singleParticipant(form)&&(status.invitations||[]).some(i=>!i.accepted_at)?'同行者の許可待ちです。下の招待状況をご確認ください。':people.every(submitted)?'準備完了 ✓ この下で申込み内容をご入力ください。':'② 参加者全員の初回シートが必要です。未提出の方はご本人の画面からご提出ください。';
      }
      else if(status?.friend && status?.message_received && status.participants.length)view.note.textContent='今回参加する方を選んでください。';
    }
    function render() {
      for(const [form,view] of regions){
        const eligible=(status?.participants||[]).filter(p=>(!singleParticipant(form)||!p.shared) && p.relationship!=='other');
        const previous=selected(view);
        // Only a sole participant is unambiguous. Never guess between siblings or overwrite a deliberate deselection.
        if(!view.initialized && !previous.length && eligible.length===1)previous.push(eligible[0].id);
        view.initialized=true;view.list.replaceChildren();
        const received=status?.enabled===true && status.friend===true && status.message_received===true;
        view.talk.hidden=received || !getToken();view.retry.hidden=!getToken();view.people.hidden=!received;
        // A focus refresh may complete after an earlier "not received" result.
        // Keep that result aligned with the latest response, not the last click.
        if(view.checkResult.textContent && !view.retry.disabled)view.checkResult.textContent=receiptFeedback(status);
        view.note.textContent=status?.enabled!==true ? '初回受付の準備ができていません。時間をおいて再度お試しください。' : status.friend!==true ? '公式LINEを友だち追加して、もう一度確認してください。' : !received ? '① 公式LINEにメッセージかスタンプを1つ送り、このページに戻ってください。' : status.participants.length ? '② 参加者を選んでください。提出済みの初回シートは再入力不要です。' : '② 参加される方のお名前を登録し、初回シートへ進んでください。';
        for(const person of status?.participants || []){
          if(singleParticipant(form) && person.shared)continue;
          const row=element('div',null,'field');const label=element('label');const input=element('input');input.type='checkbox';input.value=person.id;input.checked=previous.includes(person.id);input.addEventListener('change',()=>{if(singleParticipant(form) && input.checked)for(const other of view.list.querySelectorAll('input'))if(other!==input)other.checked=false;sync(form,view);});
          if(person.relationship==='other'){input.disabled=true;input.checked=false;}
          label.className='participant-choice';
          label.append(input,document.createTextNode(' '+person.name));row.append(label);
          row.append(element('p',submitted(person)?'初回問診票：提出済み':'初回問診票：未提出','participant-intake-status'));
          if(person.shared)row.append(element('p',submitted(person)?'本人が代理申込みを許可済みです。':'ご本人の初回シート提出をお待ちください。代表者による記入は不要です。','hint'));
          if(person.relationship==='other')row.append(element('p','同行者ご本人のLINEとの連携が必要です。「同行者と一緒に申し込む」から招待してください。','hint'));
          if(!submitted(person) && !person.shared && person.relationship!=='other'){
            const start=element('button','初回シートを開く','pill');start.type='button';
            start.addEventListener('click',async()=>{start.disabled=true;try{const session=await api('/intake-session',{participant_id:person.id});if(session.submitted===true && session.participant_id===person.id){await refresh();return;}if(!session.code || session.participant_id!==person.id || !(session.expires_at*1000>Date.now()))throw new Error('初回シートを開けませんでした。もう一度お試しください。');const url=new URL(config.intakeUrl);url.searchParams.set('usp','pp_url');url.searchParams.set(config.intakeCodeEntry,session.code);const link=element('a','初回シートへ（別タブ）','pill solid');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.referrerPolicy='no-referrer';start.replaceWith(link);view.note.textContent='シート送信後、このページへ戻り「送信状況を確認」を押してください。';}catch(error){view.note.textContent=error.message;start.disabled=false;}});row.append(start);
            const existing=element('p','すでに回答済みの方は、再記入せずご連絡ください。','hint');
            const contact=element('a','回答済みをLINEで知らせる');contact.href='https://line.me/R/oaMessage/%40177onnkx/?'+encodeURIComponent('問診票回答済みです。参加者名：');contact.target='_blank';contact.rel='noopener noreferrer';existing.append(document.createTextNode(' '),contact);row.append(existing);
          }
          if(!person.shared){
            const remove=element('button','一覧から削除','pill');remove.type='button';
            const removal=element('p',null,'onboarding-result');removal.setAttribute('role','status');
            remove.addEventListener('click',async()=>{remove.disabled=true;removal.textContent='一覧から外しています…';try{await api('/participants/archive',{participant_id:person.id});await refresh();view.checkResult.textContent='一覧から外しました。予約・問診記録は残っています。「登録・許可の管理」から元に戻せます。';}catch(error){removal.textContent=error.message;remove.disabled=false;}});row.append(remove,removal);
          }
          view.list.append(row);
        }
        if(view.registration && !view.registrationInitialized){view.registration.open=!(status?.participants||[]).some(p=>!p.shared && p.relationship!=='other');view.registrationInitialized=received;}
        sync(form,view);
        companionUI?.render(form,status);
      }
    }
    async function refresh() {
      if(refreshing)return refreshing;
      if(!configured(config))throw new Error('初回シートの接続を準備しています。時間をおいて再度お試しください。');
      refreshing=(async()=>{
        lastRefresh=Date.now();
        const next=await api('/onboarding/status');
        if(next.enabled!==true || !Array.isArray(next.participants))throw new Error('初回受付の準備ができていません。時間をおいて再度お試しください。');
        status=next;render();return status;
      })();
      try{return await refreshing;}finally{refreshing=null;}
    }
    function mount() {
      if(config.enabled!==true)return;
      unlockOnboardingGate(config);
      updateIntroductions(config);
      for(const form of forms){
        // Keep the payload field, but collect the name only through participant registration.
        const bookingName=form.elements.namedItem('name');
        if(bookingName){bookingName.readOnly=true;bookingName.required=false;bookingName.type='hidden';const field=bookingName.closest?.('.field');if(field)field.hidden=true;}
        const region=element('section',null,'field full onboarding');region.setAttribute('aria-label','LINE連絡設定と初回シート');
        const note=element('p','LINEログイン後に、参加者と初回シートを確認します。','hint');note.setAttribute('role','status');
        const messageUrl='https://line.me/R/oaMessage/%40177onnkx/?'+encodeURIComponent('申込みの連絡設定');
        const isMobile=mobileLine(typeof navigator==='undefined'?'':navigator.userAgent,typeof navigator==='undefined'?0:navigator.maxTouchPoints);
        const talk=element('div',null,'onboarding-contact');talk.hidden=true;
        const phoneHelp=element('details',null,'onboarding-phone');
        phoneHelp.append(element('summary','PCの方：スマホでLINEを開く'));
        const qr=element('img');qr.src='assets/line/message-qr.svg';qr.alt='MOVENSEのLINEトークをスマホで開くQRコード';qr.width=200;qr.height=200;
        phoneHelp.append(element('p','スマホのカメラで読み取り、LINEで「送信」を押してください。PCへのアプリ追加は不要です。','hint'),qr,element('p','送信後、このPCで「送信状況を確認」を押してください。ログインと同じLINEアカウントをご利用ください。','hint'));
        const openLine=element('a','スマホで公式LINEを開く','pill solid');openLine.href=messageUrl;openLine.target='_blank';openLine.rel='noopener noreferrer';
        if(isMobile)talk.append(openLine,phoneHelp);else{phoneHelp.open=true;talk.append(phoneHelp);}
        const checkResult=element('p',null,'onboarding-result');checkResult.setAttribute('role','status');checkResult.setAttribute('aria-live','polite');
        const retry=element('button','送信状況を確認','pill');retry.hidden=true;retry.type='button';retry.addEventListener('click',async()=>{retry.disabled=true;retry.textContent='確認中…';checkResult.textContent='LINEの送信状況を確認しています。';try{const current=await refresh();checkResult.textContent=receiptFeedback(current);}catch(error){checkResult.textContent=error.message;}finally{retry.disabled=false;retry.textContent='送信状況を確認';}});
        const actions=element('div',null,'onboarding-actions');actions.append(retry);
        const people=element('div',null,'onboarding-people');people.hidden=true;const list=element('div',null,'onboarding-list');
        const heading=element('h3','今回参加する方');
        const explanation=element('p',singleParticipant(form)?'参加する方を1名選んでください。':'今回参加する方全員にチェックしてください。','hint');
        const addName=element('input');addName.type='text';addName.maxLength=100;addName.autocomplete='off';addName.setAttribute('aria-label','追加する参加者のフルネーム');addName.placeholder='参加者のフルネーム';
        const relation=element('select');relation.setAttribute('aria-label','LINEご利用者との関係');for(const [value,text] of [['self','ご本人'],['child','お子さま（保護者として登録）']]){const option=element('option',text);option.value=value;relation.append(option);}
        const add=element('button','参加者を追加','pill');add.type='button';let pending=null;
        const addResult=element('p',null,'onboarding-result');addResult.id=form.id+'-participant-result';addResult.setAttribute('role','status');addResult.setAttribute('aria-live','polite');addName.setAttribute('aria-describedby',addResult.id);
        addName.addEventListener('input',()=>addName.removeAttribute('aria-invalid'));
        add.addEventListener('click',async()=>{const name=addName.value.trim();if(!name){addResult.textContent='参加される方のフルネームを入力してください。';addName.setAttribute('aria-invalid','true');addName.focus();return;}addName.removeAttribute('aria-invalid');add.disabled=true;add.textContent='追加中…';addResult.textContent='参加者を登録しています。';try{if(!pending || pending.name!==name || pending.relationship!==relation.value)pending={id:crypto.randomUUID(),name,relationship:relation.value};const created=await api('/participants',pending);const newId=created.participant?.id;if(!newId)throw new Error('参加者を確認できませんでした。もう一度お試しください。');await refresh();pending=null;addName.value='';for(const input of list.querySelectorAll('input')){if(singleParticipant(form))input.checked=input.value===newId;else if(input.value===newId)input.checked=true;}sync(form,regions.get(form));addResult.textContent='参加者を追加しました ✓ 上の参加者欄から初回シートへお進みください。';}catch(error){addResult.textContent=error.message;}finally{add.disabled=false;add.textContent='参加者を追加';}});
        const nameLabel=element('label','参加される方のフルネーム');nameLabel.append(addName);
        const relationLabel=element('label','LINEご利用者との関係');relationLabel.append(relation);
        const addFields=element('div',null,'onboarding-add');addFields.append(nameLabel,relationLabel,add);
        const registration=element('details',null,'companion-box');registration.append(element('summary','本人・お子さまのお名前を登録する'),addFields,addResult);
        const price=element('p',null,'onboarding-result');price.setAttribute('role','status');
        people.append(heading,explanation,list,price,registration);region.append(note,talk,actions,checkResult,people);companionUI?.mount(form,region,people);const loginRegion=form.querySelector('[data-line-login-region]');if(loginRegion)loginRegion.after(region);else form.append(region);regions.set(form,{note,talk,retry,people,list,checkResult,registration,price});
      }
      if(!listenersMounted){
        const resume=()=>{if(document.visibilityState==='hidden' || !getToken() || refreshing || Date.now()-lastRefresh<1500)return;refresh().catch(error=>{for(const view of regions.values())view.note.textContent=error.message;});};
        window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);listenersMounted=true;
      }
    }
    async function beforeSubmit(form) {
      if(config.enabled!==true)return {};
      const view=regions.get(form);
      if(!view)throw new Error('受付を読み直してください。まだ申込みは送信していません。');
      const ids=selected(view);const number=count(form,ids);const name=form.elements.namedItem('name')?.value;
      const latest=await refresh();const error=validate(latest,ids,number,name);if(error)throw new Error(error);
      if(companionUI?.hasIncoming())throw new Error('招待の確認中です。同行者としての申込みは代表者が行います。ご自身の別予約へ進む場合は「連携確認を閉じる」を押してください。');
      if(!singleParticipant(form) && latest.invitations?.some(i=>!i.accepted_at))throw new Error('同行者の許可待ちです。参加しない方の招待は取り消してください。');
      return {participant_ids:ids,...(['running-form','walking-form'].includes(form.id)?{participant_count:number}:{})};
    }
    return {mount,refresh,beforeSubmit};
  }
  window.MovenseOnboarding={create,validate,configured,returnUrl,updateIntroductions,unlockOnboardingGate,mobileLine};
})();
