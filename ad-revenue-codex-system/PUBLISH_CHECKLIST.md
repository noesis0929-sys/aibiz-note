# 公開・広告導入チェックリスト

Codex側でできるところは、公開ファイル、広告枠、固定ページ、サイトマップ、robots.txt、ads.txtの土台まで整備済みです。

## Codexで対応済み

- トップページ生成
- 広告枠の仮配置
- AdSense ID設定後に広告タグを自動出力する仕組み
- 運営者情報ページ
- お問い合わせページ
- プライバシーポリシー
- robots.txt
- sitemap.xml
- ads.txt
- Netlify用設定
- Netlify CLI用の公開スクリプト

## Codexから公開まで自動化する方法

Netlify CLIを使える環境なら、次のファイルを実行すると、ページ生成から本番公開までまとめて行えます。

```text
ad-revenue-codex-system/deploy-netlify.cmd
```

初回だけ、あなたのNetlifyアカウントでログインが必要です。

```powershell
npm install -g netlify-cli
netlify login
```

その後は、`deploy-netlify.cmd` をダブルクリックすれば本番公開できます。

## あなた側で必要な作業

1. 公開先を決める
   - Netlify
   - Vercel
   - GitHub Pages
   - 独自サーバー

2. 独自ドメインを用意する
   - AdSense審査を考えるなら、独自ドメイン推奨です。

3. `content/articles.json` を本番情報へ変更する
   - `siteUrl`
   - `ownerName`
   - `contactEmail`

4. Google AdSenseに登録する
   - サイトURLを追加
   - 審査用コード、または広告コードを取得
   - 承認後に `googleAdsenseClient` へ `ca-pub-...` を入れる
   - `googlePublisherId` へ `pub-...` を入れる

5. 再生成する

```powershell
node scripts/build-site.mjs
```

6. 公開する

Netlifyなら `ad-revenue-codex-system` フォルダをプロジェクトとして公開できます。

## 注意

AdSenseは、サイト全体がポリシーに合っているか審査されます。記事が少なすぎる、独自性が弱い、連絡先やポリシーが未整備、広告だけが目立つ状態だと通りにくくなります。

最初は10〜20本ほど、読者の問題をしっかり解決する記事を入れてから申請するのが現実的です。
