"""Regenerate the published editorial index; register confirmed publications only."""
from pathlib import Path
import json, re, html, sys
root=Path(__file__).resolve().parents[1]
p=root/'swim-flow-lab/research-index.html'
data=json.loads((root/'swim-flow-lab/editorial/articles.json').read_text(encoding='utf-8'))['articles']
if len({a['number'] for a in data})!=len(data) or len({a['href'] for a in data})!=len(data):
    raise ValueError('Duplicate article')
data=sorted(data,key=lambda a:(a['publishedOn'],a['number']),reverse=True)
cards=[]
for a in data:
    for key in ['href','image']:
        if not (root/'swim-flow-lab'/a[key]).is_file(): raise ValueError(a[key])
    e=lambda k:html.escape(str(a[k]),quote=True)
    cards.append(f'<a class="latest-news-card" href="{e("href")}"><img src="{e("image")}" alt="{e("title")}" width="1536" height="1024" loading="lazy"><div class="latest-news-copy"><span class="latest-news-tag">ARTICLE {a["number"]:02}</span><time class="article-published" datetime="{e("publishedOn")}">{e("publishedOn").replace("-",".")}</time><h3>{e("title")}</h3><span class="latest-news-action">記事を読む ↗</span></div></a>')
section='<section class="library-section article-library" id="articles" data-library-group="articles" data-label="記事"><span id="latest-articles" aria-hidden="true"></span><div class="latest-news-heading"><div><h2 data-article-heading>記事</h2><p data-article-description>これまでに公開したすべての記事。新しい順にご覧いただけます。</p></div><a class="all-articles-link" href="#articles" data-open-articles>すべての記事を見る ↗</a></div><div class="article-index-grid">'+''.join(cards)+'</div></section>'
s=p.read_text(encoding='utf-8')
updated,n=re.subn(r'<section\b[^>]*id="(?:latest-articles|articles)".*?</section>',lambda _:section,s,count=1,flags=re.S)
if n!=1:raise ValueError('Article section not found')
if '--check' in sys.argv:
    if updated!=s:raise SystemExit('Index needs regeneration')
    print(f'Index current: {len(data)} articles')
else:
    p.write_text(updated,encoding='utf-8')
    print(f'Generated {len(data)} articles')
