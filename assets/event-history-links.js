/* Preserve previously shared detail anchors without exposing ended application forms. */
(() => {
  const ended = new Set(['#diving-20261018', '#diving-20261025']);
  function route(){
    if(!ended.has(location.hash)) {
      if(['#event-reserve','#event-form'].includes(location.hash) && typeof setService === 'function') setService('event');
      return;
    }
    const destination = new URL('past-events.html', location.href);
    destination.hash = location.hash;
    location.replace(destination.href);
  }
  route();
  window.addEventListener('hashchange', route);
})();
