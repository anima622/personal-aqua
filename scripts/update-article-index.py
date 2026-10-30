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
section='<section class="library-section latest-library" id="latest-articles" data-library-group="latest-articles" data-label="最新記事"><div class="latest-news-heading"><div><h2>最新記事</h2><p>泳ぎの疑問を、ひとつずつ。</p></div></div><div class="article-index-grid is-latest">'+''.join(cards[:5])+'</div><div class="article-index-cta"><a href="articles.html">記事一覧 <span aria-hidden="true">↗</span></a><p>これまでの記事をすべて見る</p></div></section>'
archive='''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>記事一覧 | SWIM FLOW LAB</title><link rel="stylesheet" href="editorial-refresh.css?v=20261013-white2"><link rel="stylesheet" href="article-index.css?v=20261031-separate-articles"></head><body class="article-archive-page"><a class="archive-skip" href="#main">本文へ</a><header class="article-archive-header"><a href="../#hero">MOVENSE</a><a href="research-index.html">水を知るページへ戻る ↗</a></header><main id="main" class="article-archive-main"><h1>記事一覧</h1><p>これまでに公開したすべての記事。新しい順にご覧いただけます。</p><div class="article-index-grid">'''+''.join(cards)+'''</div></main><footer class="article-archive-footer"><a href="research-index.html">水を知るページへ戻る ↗</a></footer></body></html>'''
ap=root/'swim-flow-lab/articles.html'
s=p.read_text(encoding='utf-8')
updated,n=re.subn(r'<section\b[^>]*id="(?:latest-articles|articles)".*?</section>',lambda _:section,s,count=1,flags=re.S)
if n!=1:raise ValueError('Article section not found')
if '--check' in sys.argv:
    if updated!=s or not ap.exists() or ap.read_text(encoding='utf-8')!=archive:raise SystemExit('Index needs regeneration')
    print(f'Index current: {len(data)} articles')
else:
    p.write_text(updated,encoding='utf-8')
    ap.write_text(archive,encoding='utf-8')
    print(f'Generated {len(data)} articles')
