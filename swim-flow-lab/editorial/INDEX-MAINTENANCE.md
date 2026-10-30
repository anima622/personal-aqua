# 記事一覧の更新

2026-10-31本人指定：ヘッダーは「すべて→記事→既存カテゴリ」。最新記事タブは廃止。
「記事」は公開済み全記事を公開日・記事番号の降順に並べる。PCは横5列、狭い画面は3/2/1列へ折り返す。カードは既存latest-news-cardのデザインを使う。旧#latest-articlesも記事表示へ接続する。

公開時はarticles.jsonへ公開確定分だけを登録する。画像・本文のパス、タイトルと実際の公開日を確認し、リポジトリのルートから次を実行する。

```
python scripts/update-article-index.py
python scripts/update-article-index.py --check
```

articles.json、生成されたresearch-index.html、記事本文・画像を同じ公開へ含める。未来・未公開記事を登録しない。公開済みファイルの自動探索や日付による自動公開は行わない。旧publishXX系の「最新5件だけ差し替え」で一覧全体を上書きしない。

ホームページ・wireframe.htmlの最新記事欄は別の表示であり、必要に応じて公開作業で揃える。
告知GO待ちのイベントを含む旧準備ブランチ全体をmergeしない。今回の一般記事一覧の変更はイベント告知GOではない。
