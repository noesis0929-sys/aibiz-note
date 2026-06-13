# AdSense「有用性の低いコンテンツ」改善計画

記録日: 2026-05-31

## 否認理由

AdSense審査で「有用性の低いコンテンツ」と判断された。

Google公式ヘルプでは、AdSense向けサイトに、訪問者に関連する独自コンテンツと優れたユーザー体験が必要と説明されている。

## 監査で見つかった問題

- 公開記事46本のうち、本文が1000文字未満の記事が10本あった。
- 20記事で同一段落が使われていた。
- 一部の記事では、似た段落が記事内で4回繰り返されていた。
- 記事数を増やす運用が先行し、テーマ固有の具体例、実体験、独自の判断基準が弱い記事があった。

## 実施した対応

- 公開対象を、独自性が比較的高い7記事へ絞った。
- 39記事は削除せず、`content/articles-archive-low-value-2026-05-31.json` に退避した。
- 公開フォルダから退避対象の記事HTMLを外した。
- トップページ、サイトマップ、関連記事リンクを公開7記事に合わせた。
- 新規記事の量産を止め、既存記事の品質改善を優先する。

## 現在の公開対象

1. `ai-search-ads-seo-foundation-2026`
2. `self-running-ai-agents-security-2026`
3. `fujitsu-self-evolving-multi-ai-agents-2026`
4. `openai-deployment-company-ai-implementation-business-2026`
5. `ai-agent-for-small-business`
6. `ai-search-content-funnel`
7. `google-search-io-2026-ai-agents`

## 記事を公開へ戻す条件

- 他記事と同じ段落を使わない。
- テーマ固有の具体例を入れる。
- 読者が実行できる手順またはチェックリストを入れる。
- 参考情報とAI Biz Noteの見解を分ける。
- 記事タイトルに対する答えが本文で明確になっている。
- 関連記事を無理に増やさず、読者が次に読む理由があるリンクだけを置く。

## 再申請までの順番

1. 公開7記事を目視で読み、一般論を具体化する。
2. 運営者情報、問い合わせ、プライバシーポリシー、相談ページをブラウザで確認する。
3. GitHubへ変更を反映し、Cloudflare Pagesで公開する。
4. Search Consoleでサイトマップを再送信する。
5. 1週間程度、公開状態とインデックス状況を確認する。
6. 改善内容を整理してからAdSenseへ再審査を依頼する。

## 改善進捗

### 2026-06-01

- `fujitsu-self-evolving-multi-ai-agents-2026` を改善。
- 富士通公式発表の具体例、平均28ポイントの精度向上、設計仕様書検索への適用を追加。
- 小規模チーム向けの週次改善4ステップと記録テンプレートを追加。
- 次回の改善対象: `self-running-ai-agents-security-2026`

### 2026-06-08

- 停止していた2026-06-02から2026-06-08までの品質改善をまとめて実行。
- 公開7記事すべてに、公式情報、具体例、手順、確認表、運営ルールのいずれかを追加。
- 公開7記事の完全一致段落は0件。
- 公開HTMLリンク切れは0件。
- 再申請前チェックを実施したが、GitHub / Cloudflare Pagesへ未反映のため再申請は保留。
- 公開URL確認で、下書きへ戻した旧記事が拡張子なしURLでまだ表示されていることを確認。
- 旧記事39本について、拡張子なしURLと `.html` URLをトップへ301リダイレクトする設定を追加。
- リダイレクト設定の公開反映確認が終わるまで、AdSense再申請は保留。

## 参照したGoogle公式情報

- https://support.google.com/adsense/answer/7299563/make-sure-that-your-site-s-pages-are-ready-for-adsense
- https://support.google.com/adsense/answer/81904
- https://developers.google.com/search/docs/essentials/spam-policies?hl=ja
