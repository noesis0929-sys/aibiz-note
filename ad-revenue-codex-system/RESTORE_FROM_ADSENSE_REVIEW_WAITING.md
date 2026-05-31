# AdSense否認後の改善・再申請準備メモ

このチャットで再開する対象プロジェクトは、AI Biz Noteです。

## プロジェクト場所

- 作業フォルダ: `C:\Users\noesi\OneDrive\ドキュメント\New project\aibiz-note-github`
- サイト本体: `ad-revenue-codex-system`
- 記事データ: `ad-revenue-codex-system/content/articles.json`
- 生成済みサイト: `ad-revenue-codex-system/public`
- 公開先ドメイン: `https://aibiz-note.jp/`
- GitHub repo: `noesis0929-sys/aibiz-note`

## 現在の復旧状態

- Cloudflare Pages移行後、AdSense審査は否認された。
- 現在は、否認理由の確認、サイト改善、再申請準備の段階。
- AdSenseクライアントID: `ca-pub-2367995267394493`
- Publisher ID: `pub-2367995267394493`
- `ads.txt` は生成済み。
- `sitemap.xml` は生成済み。
- `consultation.html` と `thanks.html` は生成済み。
- 公開記事HTMLは45本。
- `0000000000` の仮広告ユニットIDは公開HTML内に残っていない。

## このチャットで確認済み

- 生成スクリプト `ad-revenue-codex-system/scripts/build-site.mjs` は実行成功。
- `ad-revenue-codex-system/public/ads.txt` は次の内容:

```text
google.com, pub-2367995267394493, DIRECT, f08c47fec0942fa0
```

- `ad-revenue-codex-system/public/sitemap.xml` に固定ページと記事ページが含まれている。

## 次にやること

1. GitHubへ未反映の変更を反映する。
2. Cloudflare Pagesで最新デプロイを確認する。
3. 公開後に次を確認する。
   - `https://aibiz-note.jp/`
   - `https://aibiz-note.jp/ads.txt`
   - `https://aibiz-note.jp/sitemap.xml`
   - `https://aibiz-note.jp/consultation.html`
4. Google Search Consoleで `sitemap.xml` を送信する。
5. AdSense管理画面または通知メールで具体的な否認理由を確認する。
6. 理由に対応する改善を行い、改善内容を記録する。
7. 改善後にAdSenseの再審査を依頼する。
8. 承認後、正式な広告ユニットIDで広告配置を少なめに開始する。

## 再開キーワード

「AI Biz Noteの続き。RESTORE_FROM_ADSENSE_REVIEW_WAITING.mdを見て、AdSense否認後の改善から再開」
