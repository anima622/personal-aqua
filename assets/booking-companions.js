/* Delegation exposes names and readiness only, never questionnaire answers. */
(() => {
  const key='movense-companion-invite';
  function captureInvite(){
    try{
      const code=new URLSearchParams(location.hash.slice(1)).get('companion');
      if(/^[a-f0-9]{64}$/.test(code||'')){
        sessionStorage.setItem(key,JSON.stringify({code,until:Date.now()+7*86400000}));
        history.replaceState(null,'',location.pathname+location.search+'#tog-lab');
        return code;
      }
      const saved=JSON.parse(sessionStorage.getItem(key)||'null');
      if(saved?.until>Date.now() && /^[a-f0-9]{64}$/.test(saved.code))return saved.code;
      sessionStorage.removeItem(key);
    }catch{/* No persistent storage: the current-tab link can still be used. */}
    return null;
  }
  const e=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
  const done=p=>['submitted','legacy_verified'].includes(p.intake_status);
  const multi=form=>['reserve-form','running-form','walking-form'].includes(form.id);
  const invitationText=url=>`一緒にMOVENSEのレッスンへ参加するためのご案内です。\n\n初めての方は、公式LINEを友だち追加してください。\nhttps://line.me/R/ti/p/%40177onnkx\n\n追加できたら、このメッセージに戻って下の「参加の手続き」を開いてください。登録済みの方は、そのまま手続きへ進めます。\n\n参加の手続き\n${url}\n\n予約は私がまとめて申し込みます。問診票は未提出の場合だけご記入ください。`;
  function create({api,refresh}){
    let code=captureInvite(),preview=null,loading=false,previewError='',current=null;
    const views=new Map(),links=new Map();
    const clearInvite=()=>{code=null;preview=null;previewError='';try{sessionStorage.removeItem(key);}catch{}};
    async function action(button,result,fn){button.disabled=true;result.textContent='処理中…';try{await fn();}catch(error){result.textContent=error.message;}finally{button.disabled=false;}}
    function mount(form,region,people){
      const incoming=e('div',null,'companion-box');incoming.hidden=true;
      const outgoing=e('details',null,'companion-box');outgoing.append(e('summary','一緒に参加する方を追加する'));outgoing.hidden=!multi(form);
      const body=e('div',null,'companion-body');outgoing.append(body);
      const management=e('details',null,'companion-box');management.append(e('summary','登録・許可の管理'));management.hidden=true;
      const manageBody=e('div',null,'companion-body');management.append(manageBody);
      people.before(incoming);region.append(outgoing,management);
      views.set(form,{incoming,outgoing,body,management,manageBody});
    }
    function redraw(){if(current)for(const form of views.keys())render(form,current);}
    async function loadPreview(){
      if(!code || preview || loading || previewError)return;
      loading=true;
      try{preview=await api('/companions/preview',{code});}catch(error){previewError=error.message;}
      finally{loading=false;redraw();}
    }
    function render(form,status){
      current=status;const v=views.get(form);if(!v)return;
      const ready=status.friend && status.message_received;
      const owned=status.participants.filter(p=>!p.shared),selves=owned.filter(p=>p.relationship==='self');
      v.incoming.hidden=!code;v.incoming.replaceChildren();
      if(code){
        v.incoming.append(e('h3','同行者の連携確認'));
        if(previewError)v.incoming.append(e('p',previewError));
        else if(!preview){v.incoming.append(e('p','LINE連携後に招待を確認します。'));loadPreview();}
        else if(preview.accepted){
          v.incoming.append(e('p',`${preview.issuer_name}さんへの許可は登録済みです。`));
          const p=owned.find(p=>p.id===preview.participant_id);
          v.incoming.append(e('p',p && done(p)?'準備完了です。申込みは代表者が行います。ご自身で同じ予約を送る必要はありません。':'下のご本人の欄から初回問診票を提出してください。申込みは代表者が行います。','hint'));
        }else{
          v.incoming.append(e('h4',`${preview.issuer_name}さんによる代理申込みを許可しますか？`));
          v.incoming.append(e('p','共有するのは氏名と初回準備の完了状況です。問診の回答内容は共有しません。許可は次回以降にも使われ、いつでも解除できます。','hint'));
          if(!ready)v.incoming.append(e('p','まず公式LINEへメッセージかスタンプを送ってください。'));
          else if(!selves.length)v.incoming.append(e('p','下で「ご本人」のお名前を登録してください。登録後、ここで許可できます。'));
          else{
            const label=e('label','ご本人の登録名');const select=e('select');select.setAttribute('aria-label','代理申込みを許可するご本人');
            for(const p of selves){const option=e('option',p.name);option.value=p.id;select.append(option);}label.append(select);
            const result=e('p',null,'onboarding-result');result.setAttribute('role','status');
            const accept=e('button','この代表者に許可する','pill solid');accept.type='button';
            accept.addEventListener('click',()=>action(accept,result,async()=>{
              await api('/companions/accept',{code,participant_id:select.value,consent:true});preview=null;await refresh();await loadPreview();
            }));v.incoming.append(label,accept,result);
          }
        }
        const close=e('button',preview?.accepted?'連携確認を閉じる':'今回は許可せず閉じる','pill');close.type='button';close.addEventListener('click',()=>{clearInvite();redraw();});v.incoming.append(close);
      }
      v.outgoing.hidden=!ready || !multi(form) || !!code;v.body.replaceChildren();
      if(!v.outgoing.hidden){
        v.body.append(e('p','すでに上にお名前がある方は、問診票の提出状況を確認して選んでください。お名前がない方には、次の手順でご案内を送ります。','hint'));
        const steps=e('ol');steps.style.paddingLeft='1.5em';
        for(const text of ['下の「同行者用リンクを作る」を押します。','「案内文をコピー」を押します。','一緒に参加する方とのLINEのトークを開き、コピーした案内文を貼り付けて送ります。'])steps.append(e('li',text));
        v.body.append(steps,e('p','受け取った方には、届いた案内を押して、ご自身のスマートフォンで手続きしていただきます。2人以上に送る場合は、1人ずつ同じ手順を繰り返してください。','hint'));
        const result=e('p',null,'onboarding-result');result.setAttribute('role','status');
        if(selves.length){
          const label=e('label','代表者として表示するご本人の名前');const select=e('select');select.setAttribute('aria-label','招待する代表者の名前');
          for(const p of selves){const option=e('option',p.name);option.value=p.id;select.append(option);}label.append(select);
          const make=e('button','同行者用リンクを作る','pill');make.type='button';
          make.addEventListener('click',()=>action(make,result,async()=>{
            const invite=await api('/companions/create',{participant_id:select.value});
            const url=new URL(location.origin+location.pathname);url.searchParams.set('booking_service',{'reserve-form':'aqua','running-form':'running','walking-form':'walking'}[form.id]);url.hash='companion='+invite.code;
            links.set(invite.id,url.href);await refresh();
          }));v.body.append(label,make,result);
        }else v.body.append(e('p','先にご本人のお名前を登録してください。'));
        for(const invite of status.invitations||[]){
          const row=e('div',null,'companion-row');
          const actions=e('div',null,'companion-actions');
          const feedback=e('div');
          row.append(e('strong',invite.accepted_at?`${invite.participant_name} · ${['submitted','legacy_verified'].includes(invite.intake_status)?'申込み可能 ✓':'初回準備待ち'}`:'同行者の許可待ち'));
          if(!invite.accepted_at){
            row.append(e('p','リンクを同行者へ送り、ご本人に「この代表者に許可する」を押してもらってください。','hint'));
            row.append(e('p',`リンクの有効期限：${new Date(invite.expires_at*1000).toLocaleDateString('ja-JP')}。予約はまだ完了していません。`,'hint'));
            if(links.has(invite.id)){
              const link=e('textarea');link.readOnly=true;link.rows=7;link.value=invitationText(links.get(invite.id));link.setAttribute('aria-label','同行者に送る案内文');row.append(link);
              const copied=e('p',null,'onboarding-result');copied.setAttribute('role','status');
              const copy=e('button','案内文をコピー','pill');copy.type='button';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(link.value);copied.textContent='案内文をコピーしました。一緒に参加する方とのLINEに貼り付けて送ってください。';}catch{link.focus();link.select();copied.textContent='案内文を選択しました。コピーして送ってください。';}});actions.append(copy);feedback.append(copied);
            }else row.append(e('p','リンクは作成直後だけ表示します。紛失した場合は取り消して作り直してください。','hint'));
          }
          const result=e('p',null,'onboarding-result');result.setAttribute('role','status');
          const cancel=e('button',invite.accepted_at?'この同行者との連携を外す':'この招待を取り消す','pill');cancel.type='button';cancel.addEventListener('click',()=>action(cancel,result,async()=>{await api('/companions/revoke',{id:invite.id});links.delete(invite.id);await refresh();}));actions.append(cancel);feedback.append(result);row.append(actions,feedback);v.body.append(row);
        }
        const waiting=(status.invitations||[]).filter(i=>!i.accepted_at).length;
        if(waiting){v.outgoing.open=true;v.body.append(e('p',`あと${waiting}名の許可待ちです。参加しない方の招待は取り消してください。`));}
      }
      v.management.hidden=!(status.archived?.length || status.permissions?.length);v.manageBody.replaceChildren();
      for(const p of status.archived||[]){
        const button=e('button',`${p.name}を一覧に戻す`,'pill');button.type='button';const result=e('p',null,'onboarding-result');result.setAttribute('role','status');button.addEventListener('click',()=>action(button,result,async()=>{await api('/participants/restore',{participant_id:p.id});await refresh();}));v.manageBody.append(button,result);
      }
      for(const grant of status.permissions||[]){
        const row=e('div',null,'companion-row');row.append(e('p',`${grant.issuer_name}さんに「${grant.participant_name}」の代理申込みを許可中`));
        const button=e('button','この許可を解除する','pill');button.type='button';const result=e('p',null,'onboarding-result');result.setAttribute('role','status');button.addEventListener('click',()=>action(button,result,async()=>{await api('/companions/revoke',{id:grant.id});if(preview?.participant_id){clearInvite();}await refresh();}));row.append(button,result);v.manageBody.append(row);
      }
    }
    return {mount,render,hasIncoming:()=>!!code};
  }
  window.MovenseCompanions={create};
})();
