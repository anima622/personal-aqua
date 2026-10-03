/* Event requests use the existing authenticated, durable LINE receipt path. */
(() => {
  const openEvent=()=>{if(location.hash==='#event-reserve')setService('event');};
  document.querySelectorAll('a[href="#event-reserve"]').forEach(link=>link.addEventListener('click',()=>setService('event')));
  window.addEventListener('hashchange',openEvent);
  openEvent();
  const form=document.getElementById('event-form');
  const result=document.getElementById('event-result');
  const button=form.querySelector('button[type="submit"]');
  if(Date.now()>=Date.parse('2026-10-18T11:00:00+09:00')){
    button.disabled=true;button.textContent='このイベントの受付は終了しました';
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity() || button.disabled)return;
    const name=form.elements.name.value.trim();
    if(!name){form.elements.name.focus();return;}
    const note=form.elements.note.value.trim();
    openConfirmModal([
      ['イベント','飛び込み練習会'],['日時','2026年10月18日（日）11:00〜13:00'],
      ['集合','10:45 スポーツ文化センター入口ロビー'],['会場','BumB東京スポーツ文化館'],
      ['お名前',name],['参加人数','1名'],['参加費','3,000円'],['支払方法',form.elements.payment_method.value],
      ['キャンセル','前日まで受付。当日キャンセルは返金不可'],
      ['受付について','参加可否・お支払いの詳細と予約確定を公式LINEでご案内'],
      ...(note?[['連絡事項',note]]:[])
    ],async()=>{
      button.disabled=true;button.textContent='送信中…';
      try{
        // Never fall back to a route without LINE identity and duplicate protection.
        const response=window.WatariBooking?.enabled
          ?await window.WatariBooking.submit(form)
          :{ok:false,message:'LINE受付に接続できません。入力内容を残したままページを開き直してください。'};
        result.hidden=false;result.classList.toggle('error',!response.ok);result.textContent=response.message;
        if(response.ok){form.reset();button.textContent='参加申込を受け付けました';}
        else{button.disabled=false;button.textContent='申込内容を確認する';}
      }catch{
        result.hidden=false;result.classList.add('error');result.textContent='受付結果を確認できません。入力内容を変えずに再度送信してください。';button.disabled=false;button.textContent='申込内容を確認する';
      }
    });
  });
})();
