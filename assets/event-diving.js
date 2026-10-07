/* Event requests use the existing authenticated, durable LINE receipt path. */
(() => {
  const events = {
    'diving-20261018': {label:'10.18',date:'2026年10月18日（日）',time:'11:00〜13:00',meeting:'10:45',start:'2026-10-18T11:00:00+09:00'},
    'diving-20261025': {label:'10.25',date:'2026年10月25日（日）',time:'10:00〜12:00',meeting:'9:45',start:'2026-10-25T10:00:00+09:00'}
  };
  const form=document.getElementById('event-form');
  if(!form)return;
  const select=document.getElementById('event-date');
  const result=document.getElementById('event-result');
  const button=form.querySelector('button[type="submit"]');
  const summary=document.getElementById('event-form-summary');
  const label=document.getElementById('event-form-label');
  const detailLink=document.getElementById('event-detail-link');
  const status=document.getElementById('event-date-status');
  const eventLinks=Array.from(document.querySelectorAll('[data-event-id]'));
  let sending=false, sendingEventId=null, sentEventId=null, manualEventId=null;
  const closed=id=>events[id] && Date.now()>=Date.parse(events[id].start);
  const requestedEvent=(()=>{
    let incoming=new URLSearchParams(location.search);
    if(incoming.has('liff.state')){
      try{incoming=new URL(incoming.get('liff.state'),location.origin+location.pathname).searchParams;}catch{return null;}
    }
    const id=incoming.get('booking_event');
    return events[id]?id:null;
  })();

  function updateRoute(id){
    // LIFF owns its intermediate authentication URL until its initialization finishes.
    if(new URLSearchParams(location.search).has('liff.state'))return;
    const url=new URL(location.href);
    if(events[id])url.searchParams.set('booking_event',id);
    else url.searchParams.delete('booking_event');
    history.replaceState(history.state,'',url.href);
  }
  function render(){
    if(sending)select.value=sendingEventId;
    const id=select.value, event=events[id];
    for(const option of select.options){
      if(!events[option.value])continue;
      const item=events[option.value];
      option.disabled=!!closed(option.value);
      option.textContent=`${item.label.replace('.', '/')}（日）${item.time}${option.disabled?'［受付終了］':''}`;
    }
    for(const link of eventLinks){
      if(!link.dataset.openLabel)link.dataset.openLabel=link.textContent;
      const ended=!!closed(link.dataset.eventId);
      link.setAttribute('aria-disabled',String(ended));
      link.classList.toggle('event-closed',ended);
      link.textContent=ended?`${events[link.dataset.eventId].label.replace('.', '/')}の受付は終了しました`:link.dataset.openLabel;
    }
    if(event){
      label.textContent=`SPECIAL EVENT / ${event.label}`;
      summary.replaceChildren(document.createTextNode(`${event.date} ${event.time}`),document.createElement('br'),document.createTextNode(`BumB東京スポーツ文化館｜集合 ${event.meeting}｜3,000円／名`));
      detailLink.href=`#${id}`;
      status.textContent=closed(id)?'この開催日の受付は終了しました。受付中の開催日をお選びください。':`集合 ${event.meeting}・スポーツ文化センター入口ロビー。定員10名・3,000円／名。`;
    }else{
      label.textContent='SPECIAL EVENT / 10.18 & 10.25';
      summary.replaceChildren(document.createTextNode('10/18（日）11:00〜13:00・集合10:45'),document.createElement('br'),document.createTextNode('10/25（日）10:00〜12:00・集合9:45'),document.createElement('br'),document.createTextNode('BumB東京スポーツ文化館｜各3,000円／名'));
      detailLink.href='#events';
      status.textContent='各開催10名・3,000円／名。参加したい開催日をお選びください。';
    }
    button.disabled=sending || !!closed(id) || sentEventId===id && !!id;
    button.textContent=sending?'送信中…':closed(id)?'この開催日の受付は終了しました':sentEventId===id && id?'参加申込を受け付けました':'申込内容を確認する';
  }
  function choose(id,{manual=false}={}){
    if(sending){select.value=sendingEventId;return;}
    select.value=events[id]?id:'';
    if(manual){manualEventId=select.value;sentEventId=null;result.hidden=true;updateRoute(select.value);}
    render();
  }
  function openEvent(){
    if(['#event-reserve','#event-form'].includes(location.hash)){
      if(!select.value && location.hash==='#event-reserve')choose(requestedEvent||'diving-20261018');
      setService('event');
    }
  }
  function scrollToEvent(){
    requestAnimationFrame(()=>{
      const target=document.getElementById('event-reserve');
      const top=target.getBoundingClientRect().top+window.scrollY-(document.querySelector('header')?.getBoundingClientRect().height||80)-24;
      window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
    });
  }
  for(const link of eventLinks)link.addEventListener('click',e=>{
    if(closed(link.dataset.eventId)){e.preventDefault();return;}
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
    e.preventDefault();
    if(sending)return;
    history.pushState(history.state,'',link.href);
    choose(link.dataset.eventId,{manual:true});setService('event');scrollToEvent();
  });
  document.querySelectorAll('a[href="#event-reserve"]').forEach(link=>link.addEventListener('click',()=>{
    if(!select.value)choose('diving-20261018');
    setService('event');
  }));
  select.addEventListener('change',()=>choose(select.value,{manual:true}));
  window.addEventListener('hashchange',openEvent);
  window.addEventListener('popstate',()=>{
    const id=new URLSearchParams(location.search).get('booking_event');
    if(events[id])choose(id);
    openEvent();
  });
  // LINE initializes asynchronously and restores fields after this script has run.
  window.addEventListener('watari-booking-draft-restored',()=>{
    choose(manualEventId!==null?manualEventId:requestedEvent||select.value);
  });
  form.addEventListener('reset',()=>{
    const id=select.value;
    queueMicrotask(()=>{select.value=id;render();});
  });
  window.addEventListener('pageshow',render);
  window.addEventListener('focus',render);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render();});
  setInterval(render,30000);
  if(requestedEvent){choose(requestedEvent);setService('event');}
  openEvent();render();

  form.addEventListener('submit',event=>{
    event.preventDefault();render();
    if(sending || button.disabled || !form.reportValidity())return;
    const eventId=select.value, selected=events[eventId];
    if(!selected)return;
    const name=form.elements.name.value.trim();
    if(!name){form.elements.name.focus();return;}
    const note=form.elements.note.value.trim();
    openConfirmModal([
      ['イベント','飛び込み練習会'],['日時',`${selected.date} ${selected.time}`],
      ['集合',`${selected.meeting} スポーツ文化センター入口ロビー`],['会場','BumB東京スポーツ文化館'],
      ['お名前',name],['参加人数','1名'],['参加費','3,000円'],['支払方法',form.elements.payment_method.value],
      ['キャンセル','前日まで受付。当日キャンセルは返金不可'],
      ['受付について','参加可否・お支払いの詳細と予約確定を公式LINEでご案内'],
      ...(note?[['連絡事項',note]]:[])
    ],async()=>{
      if(sending)return;
      if(select.value!==eventId || closed(eventId)){
        result.hidden=false;result.classList.add('error');result.textContent='開催日または受付状況が変わりました。申込内容をもう一度確認してください。';render();return;
      }
      sending=true;sendingEventId=eventId;select.disabled=true;
      // A disabled select is omitted by FormData. Keep exactly the confirmed date in the payload.
      const eventField=document.createElement('input');eventField.type='hidden';eventField.name='event_id';eventField.value=eventId;form.append(eventField);
      render();
      try{
        const response=window.WatariBooking?.enabled
          ?await window.WatariBooking.submit(form)
          :{ok:false,message:'LINE受付に接続できません。入力内容を残したままページを開き直してください。'};
        result.hidden=false;result.classList.toggle('error',!response.ok);result.textContent=response.message;
        if(response.ok){sentEventId=eventId;form.reset();select.value=eventId;}
      }catch{
        result.hidden=false;result.classList.add('error');result.textContent='受付結果を確認できません。入力内容を変えずに再度送信してください。';
      }finally{
        eventField.remove();select.disabled=false;sending=false;sendingEventId=null;render();
      }
    });
  });
})();
