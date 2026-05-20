# 広告収益メディア Codex 運用パッケージ

YouTubeで紹介されていた「AIエージェントに作業を渡して継続運用する」考え方を、Codexで回せるようにしたスターターです。

第一目標は、広告収入だけに頼らず、note販売、相談、受託支援、アフィリエイトを組み合わせて月100万円以上を狙うことです。ただし広告収益はアクセス数、ジャンル、広告単価、掲載審査、記事品質に大きく左右されます。このパッケージは「毎日トレンドを確認し、記事を増やし、SNSで拡散し、検索流入と相談導線を測り、改善する」ための土台です。

## できること

- 広告掲載を想定した情報メディアのトップページを表示
- 記事データから記事一覧と収益目安を自動表示
- Codexに依頼するための調査、記事作成、改善プロンプトを保存
- 月100万円に必要な収益導線とPVの目安を確認

## 使い方

```powershell
node ad-revenue-codex-system/scripts/build-site.mjs
node server.js
```

ブラウザで開くURL:

```text
http://localhost:4173/media/
```

## Localhostで開けないとき

ワークスペース直下の `open-media-site.cmd` をダブルクリックしてください。ページ生成、サーバー起動、ブラウザ表示までまとめて実行します。

それでも開けない場合は、サーバーなしで次のファイルを直接開けます。

```text
ad-revenue-codex-system/open-directly.html
```

## 公開と広告導入

公開・広告導入の手順は `PUBLISH_CHECKLIST.md` にまとめています。

Codex側では、広告枠、固定ページ、サイトマップ、robots.txt、ads.txt、Netlify設定まで用意できます。AdSenseアカウント作成、サイト審査申請、本人確認、支払い情報、独自ドメイン購入やDNS設定は、アカウント所有者であるあなたの操作が必要です。

Netlify CLIにログイン済みなら、次のファイルで生成から本番公開まで実行できます。

```text
ad-revenue-codex-system/deploy-netlify.cmd
```

`.cmd` が開けない場合は、PowerShellで次を実行してください。

```powershell
powershell -ExecutionPolicy Bypass -File ad-revenue-codex-system\build-upload-zip.ps1
```

これはNetlifyアップロード用ZIPだけを作ります。

## まず狙うジャンル

最初は「地域ビジネスの集客・LP・AI活用」に寄せています。理由は、既存のワークスペースにLP制作系の素材があり、広告だけでなく将来的に制作案件やアフィリエイトにも展開しやすいからです。

## 月100万円の目安

広告RPMが800円の場合、広告だけで月100万円には約125万PVが必要です。事業メディアでは、広告だけでなく、note販売、相談、受託支援、アフィリエイトを組み合わせて収益を作ります。

個人運用では、最初から広告だけに依存すると遠回りになりがちです。初期は以下の順で伸ばすのが現実的です。

1. 検索記事でアクセスを集める
2. Google AdSenseなどの広告審査に通す
3. 高単価ジャンルの記事を増やす
4. 相談、テンプレート販売、アフィリエイトも追加する
5. 伸びた記事をCodexでリライトし続ける

## Codexへの依頼場所

- `prompts/research.md`: キーワード調査
- `prompts/write-article.md`: 記事作成
- `prompts/improve-article.md`: 既存記事の改善
- `prompts/monthly-review.md`: 月次レビュー

## 注意

動画内容そのものの完全な字幕は取得できなかったため、確認できた周辺情報から「Claude/AIエージェントを使った自動化」の思想をCodex向けに置き換えています。動画の具体的な手順が追加で分かれば、このパッケージへ合わせて反映できます。
