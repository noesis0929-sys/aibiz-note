# Cloudflare Pages 移行メモ

AI Biz NoteをNetlifyからCloudflare Pagesへ移すための設定メモです。

## GitHub接続

- Repository: `noesis0929-sys/aibiz-note`
- Branch: `main`

## Build settings

Cloudflare Pagesの「Build settings」には次を入れます。

```text
Framework preset: None
Build command: node ad-revenue-codex-system/scripts/build-site.mjs
Build output directory: ad-revenue-codex-system/public
Root directory: /
```

環境変数は現在不要です。

## Custom domain

Pagesの初回デプロイ後、Cloudflare Pagesの「Custom domains」から次を追加します。

```text
aibiz-note.jp
www.aibiz-note.jp
```

Cloudflare側で提示されるDNSレコードに従って、`aibiz-note.jp` の向き先をPagesへ切り替えます。

## 公開後チェック

- `https://aibiz-note.jp/` が最新トップ記事を表示している
- `https://aibiz-note.jp/ads.txt` が `google.com, pub-2367995267394493, DIRECT, f08c47fec0942fa0` を表示している
- `https://aibiz-note.jp/sitemap.xml` が表示できる
- 記事ページが開ける
- AdSense側でサイト確認と `ads.txt` 確認を行う

## Cloudflare用ファイル

Cloudflare Pagesは、公開フォルダ内の `_redirects` と `_headers` を読みます。
このリポジトリでは `node ad-revenue-codex-system/scripts/build-site.mjs` 実行時に `_headers` を生成します。
