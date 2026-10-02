/* Published announcements only. No client-side capacity or automatic confirmation.
   Registration stays closed until an independently verified intake endpoint exists. */
(() => {
  const labels={announced:'開催予告',full:'満席',closed:'受付終了',ended:'終了'};
  fetch('assets/programs.json').then(r=>{if(!r.ok)throw new Error('unavailable');return r.json();}).then(data=>{
    if(data.schemaVersion!==1 || !Array.isArray(data.programs))return;
    for(const kind of ['group','event']){
      const host=document.querySelector('[data-program-kind="'+kind+'"]');
      const entries=data.programs.filter(p=>p.kind===kind && p.published===true && labels[p.status] && typeof p.title==='string');
      if(!entries.length || !host)return;
      host.replaceChildren();
      for(const p of entries){
        const article=document.createElement('article');article.className='program-entry';
        const status=document.createElement('p');status.className='rl';status.textContent=labels[p.status];
        const title=document.createElement('h3');title.textContent=p.title;
        const list=document.createElement('dl');
        for(const [key,label] of [['dateLabel','日時'],['venue','会場'],['audience','対象'],['coach','担当'],['priceLabel','参加費'],['capacityLabel','定員'],['conditions','受付条件']]){
          if(typeof p[key]!=='string'||!p[key].trim())continue;
          const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=p[key];list.append(dt,dd);
        }
        const note=document.createElement('p');note.textContent=p.status==='announced'?'募集開始と申込方法は、条件が整い次第ご案内します。':'現在、この開催のお申込みは受け付けていません。';
        article.append(status,title,list,note);host.append(article);
      }
    }
  }).catch(()=>{/* Keep the truthful preparation state when no verified catalog is available. */});
})();
