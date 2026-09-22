// Review-only variants. The normal article always uses the selected static artwork.
(() => {
  const variant = new URLSearchParams(location.search).get('art');
  if (variant !== 'A' && variant !== 'B') return;
  const data = document.getElementById('article-art-options');
  const figure = document.querySelector('[data-article-art]');
  if (!data || !figure) return;
  const option = JSON.parse(data.textContent)[variant];
  if (!option) return;
  const img = figure.querySelector('img');
  img.src = option.src;
  img.alt = option.alt;
  figure.querySelector('figcaption').textContent = option.caption;
  document.documentElement.dataset.artVariant = variant;
})();
