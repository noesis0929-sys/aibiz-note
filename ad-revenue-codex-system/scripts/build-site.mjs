import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataPath = path.join(rootDir, "content", "articles.json");
const publicDir = path.join(rootDir, "public");
const postsDir = path.join(publicDir, "posts");
const assetVersion = "20260521-news-curation";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || "https://example.com").replace(/\/+$/, "");
}

function absoluteUrl(site, pagePath = "") {
  const siteUrl = normalizeSiteUrl(site.siteUrl);
  if (!pagePath) return siteUrl;
  return `${siteUrl}${pagePath.startsWith("/") ? pagePath : `/${pagePath}`}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function articleJsonLd(site, article) {
  const siteUrl = normalizeSiteUrl(site.siteUrl);
  const payload = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: site.ownerName || site.name
    },
    publisher: {
      "@type": "Organization",
      name: site.name
    },
    mainEntityOfPage: `${siteUrl}/posts/${article.slug}.html`
  };

  return `<script type="application/ld+json">${JSON.stringify(payload).replaceAll("</", "<\\/")}</script>`;
}

function adsenseHead(site) {
  if (!site.googleAdsenseClient) return "";
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeHtml(site.googleAdsenseClient)}" crossorigin="anonymous"></script>`;
}

function adSlot(label, site) {
  if (!site.googleAdsenseClient) {
    return "";
  }

  return `<aside class="ad-slot placeholder" aria-label="${escapeHtml(label)}">
    <span>広告掲載予定</span>
    <strong>AI Biz Note</strong>
    <small>審査完了後、読書体験を妨げない位置に広告を配置します。</small>
  </aside>`;
}

function header(site, depth = ".") {
  return `<header class="topbar">
    <a class="brand" href="${depth}/">${escapeHtml(site.name)}</a>
    <nav aria-label="メインメニュー">
      <a href="${depth}/#articles">記事</a>
      <a href="${depth}/#categories">カテゴリ</a>
      <a href="${depth}/about.html">運営者情報</a>
      <a href="${depth}/consultation.html">相談メニュー</a>
      <a href="${depth}/privacy-policy.html">ポリシー</a>
      <a href="${depth}/contact.html">お問い合わせ</a>
    </nav>
  </header>`;
}

function socialMeta({ site, title, description, url, image, type = "website" }) {
  const shareImage = image || absoluteUrl(site, "/assets/ai-biz-note-org-chart.png");
  return `<link rel="canonical" href="${escapeHtml(url)}">
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:site_name" content="${escapeHtml(site.name)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${escapeHtml(shareImage)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(shareImage)}">`;
}

function shell({ site, title, description, body, depth = ".", structuredData = "", url = "", image = "", type = "website" }) {
  const pageTitle = `${title} | ${site.name}`;
  const pageUrl = url || absoluteUrl(site, "/");
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}">
    <title>${escapeHtml(pageTitle)}</title>
    ${socialMeta({ site, title: pageTitle, description, url: pageUrl, image, type })}
    ${adsenseHead(site)}
    ${structuredData}
    <link rel="stylesheet" href="${depth}/style.css?v=${assetVersion}">
  </head>
  <body>
    ${header(site, depth)}
    ${body}
  </body>
</html>`;
}

function articleCard(article) {
  const updatedDate = formatDate(article.updatedAt || article.publishedAt);
  return `<article class="article-card">
    <div class="article-meta">
      <span>${escapeHtml(article.category)}</span>
      <span>${article.readingMinutes}分で読める</span>
      <span>更新 ${escapeHtml(updatedDate)}</span>
    </div>
    <h3><a href="./posts/${escapeHtml(article.slug)}.html">${escapeHtml(article.title)}</a></h3>
    <p>${escapeHtml(article.description)}</p>
    <a class="text-link" href="./posts/${escapeHtml(article.slug)}.html">記事を読む</a>
  </article>`;
}

function renderHome(data) {
  const { site, featured, categories, articles } = data;
  const latest = articles.slice(0, 3).map(articleCard).join("");
  const allArticles = articles.map(articleCard).join("");
  const categoryList = categories.map((category) => `<span>${escapeHtml(category)}</span>`).join("");

  return shell({
    site,
    title: "AI時代のニュース解説と事業活用ノート",
    description: site.tagline,
    url: absoluteUrl(site, "/"),
    body: `<main>
      <section class="hero">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="hero-inner">
          <p class="eyebrow">AI Biz Note</p>
          <h1>${escapeHtml(featured.title)}</h1>
          <p>${escapeHtml(featured.lead)}</p>
          <div class="hero-actions">
            <a class="button primary" href="#articles">記事を読む</a>
            <a class="button secondary" href="./consultation.html">相談メニューを見る</a>
          </div>
        </div>
      </section>

      <section class="metrics" aria-label="メディアの特徴">
        <div>
          <span>対象</span>
          <strong>ニュース解説</strong>
        </div>
        <div>
          <span>テーマ</span>
          <strong>AI・経済・SNS</strong>
        </div>
        <div>
          <span>目的</span>
          <strong>事業活用</strong>
        </div>
        <div>
          <span>方針</span>
          <strong>実装目線</strong>
        </div>
      </section>

      <section class="section intro">
        <div class="section-heading">
          <p class="eyebrow">Start Here</p>
          <h2>まず読んでほしい記事</h2>
        <p class="lead">AI、テック、経済、検索・広告、SNS、働き方、企業動向まで、事業のヒントになるニュースと解説を選びました。</p>
        </div>
        <div class="article-grid featured-grid">
          ${latest}
        </div>
      </section>

      <section class="section">
        ${adSlot("トップページ中部", site)}
      </section>

      <section id="categories" class="section compact">
        <div class="section-heading">
          <p class="eyebrow">Categories</p>
          <h2>扱うテーマ</h2>
        </div>
        <div class="watch-list">${categoryList}</div>
      </section>

      <section class="section consultation-band">
        <div class="section-heading">
          <p class="eyebrow">Consultation</p>
          <h2>記事で学んだことを、実装まで進める</h2>
          <p class="lead">ニュースで見えた変化を、自分の事業、商品、SNS、問い合わせ導線、業務自動化へ落とし込む作業を個別相談で前に進めます。</p>
        </div>
        <a class="button dark" href="./consultation.html">相談メニューを見る</a>
      </section>

      <section id="articles" class="section articles">
        <div class="section-heading">
          <p class="eyebrow">Articles</p>
          <h2>新着記事</h2>
          <p class="lead">AIニュース、テック・経済、検索・広告・SNS、働き方、副業、収益化、ツール活用を中心に、実務で使える内容を増やしています。</p>
        </div>
        <div class="article-grid">
          ${allArticles}
        </div>
      </section>
    </main>`
  });
}

function renderArticle(site, article, related) {
  const sections = article.sections.map((section) => `<section>
    <h2>${escapeHtml(section.heading)}</h2>
    <p>${escapeHtml(section.body)}</p>
  </section>`).join("");

  const relatedCards = related.map((item) => `<li><a href="./${escapeHtml(item.slug)}.html">${escapeHtml(item.title)}</a></li>`).join("");
  const publishedDate = formatDate(article.publishedAt);
  const updatedDate = formatDate(article.updatedAt || article.publishedAt);
  const articleUrl = absoluteUrl(site, `/posts/${article.slug}.html`);
  const articleImage = article.image ? absoluteUrl(site, `/${article.image.src}`) : "";
  const articleFigure = article.image ? `<figure class="post-figure">
    <img src="../${escapeHtml(article.image.src)}" alt="${escapeHtml(article.image.alt || article.title)}" loading="lazy">
    ${article.image.caption ? `<figcaption>${escapeHtml(article.image.caption)}</figcaption>` : ""}
  </figure>` : "";

  return shell({
    site,
    title: article.title,
    description: article.description,
    depth: "..",
    url: articleUrl,
    image: articleImage,
    type: "article",
    structuredData: articleJsonLd(site, article),
    body: `<main class="article-page">
      <article class="post">
        <div class="article-meta">
          <span>${escapeHtml(article.category)}</span>
          <span>${article.readingMinutes}分で読める</span>
        </div>
        <h1>${escapeHtml(article.title)}</h1>
        <dl class="post-dates" aria-label="記事の日付">
          <div><dt>投稿日</dt><dd><time datetime="${escapeHtml(article.publishedAt || "")}">${escapeHtml(publishedDate)}</time></dd></div>
          <div><dt>更新日</dt><dd><time datetime="${escapeHtml(article.updatedAt || article.publishedAt || "")}">${escapeHtml(updatedDate)}</time></dd></div>
        </dl>
        <p class="post-lead">${escapeHtml(article.description)}</p>
        ${articleFigure}
        <div class="share-box" aria-label="記事を共有">
          <span>この記事を共有</span>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}" target="_blank" rel="noopener">Xで共有</a>
          <a href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(articleUrl)}" target="_blank" rel="noopener">LINEで共有</a>
        </div>
        ${adSlot("記事上部", site)}
        ${sections}
        <section class="post-consultation">
          <p class="eyebrow">Next Step</p>
          <h2>この記事を実務に落とし込みたいときは</h2>
          <p>AI活用、記事構成、LP改善、問い合わせ導線の整理など、状況に合わせて小さく相談できます。現在のサイトURLや困っていることが分かる範囲であれば、相談フォームから送れます。</p>
          <a class="button dark" href="../consultation.html">相談メニューを見る</a>
        </section>
        <section class="post-related">
          <h2>あわせて読みたい</h2>
          <ul>${relatedCards}</ul>
        </section>
      </article>
    </main>`
  });
}

function getRelatedArticles(articles, article) {
  const sameCategory = articles.filter((item) => item.slug !== article.slug && item.category === article.category);
  const otherArticles = articles.filter((item) => item.slug !== article.slug && item.category !== article.category);
  return [...sameCategory, ...otherArticles].slice(0, 3);
}

function renderAbout(site) {
  return shell({
    site,
    title: "運営者情報",
    description: `${site.name}の運営者情報です。`,
    body: `<main class="plain-page">
      <section class="section doc">
        <p class="eyebrow">About</p>
        <h1>運営者情報</h1>
        <p>${escapeHtml(site.name)}は、AI、テック、経済、検索・広告、SNS、働き方、企業動向のニュースを広く整理し、事業成長と収益化に使える視点まで解説するメディアです。</p>
        <dl class="article-stats">
          <div><dt>運営者</dt><dd>${escapeHtml(site.ownerName)}</dd></div>
          <div><dt>連絡先</dt><dd>${escapeHtml(site.contactEmail)}</dd></div>
        </dl>
        <h2>編集方針</h2>
        <p>当サイトでは、AI活用やWeb集客を「明日から試せる実務」に落とし込むことを重視しています。記事では、一般論だけでなく、作業手順、確認ポイント、失敗しやすい点、改善の順番をできるだけ具体的に整理します。</p>
        <p>内容は公開後も見直し、Search Consoleや実務上の変化に合わせて更新します。古くなりやすいツール名、広告サービス、各種仕様については、必要に応じて公式情報を確認したうえで判断してください。</p>
        <h2>広告と収益化について</h2>
        <p>当サイトでは、Google AdSenseなどの広告配信サービスや、将来的に関連サービスの紹介リンクを利用する場合があります。広告や紹介を行う場合でも、読者の判断を妨げないよう、本文の読みやすさと情報の透明性を優先します。</p>
        <p>掲載内容は正確性に配慮して作成しますが、個別の成果や収益を保証するものではありません。実施前には各サービスの公式情報も確認してください。</p>
      </section>
    </main>`
  });
}

function renderContact(site) {
  return shell({
    site,
    title: "お問い合わせ",
    description: `${site.name}へのお問い合わせページです。`,
    body: `<main class="plain-page">
      <section class="section doc">
        <p class="eyebrow">Contact</p>
        <h1>お問い合わせ</h1>
        <p>記事内容、広告掲載、業務相談に関するお問い合わせは、以下のメールアドレスまでご連絡ください。</p>
        <p><strong>${escapeHtml(site.contactEmail)}</strong></p>
        <h2>相談できる内容</h2>
        <p>AI活用の始め方、Web集客記事の作成、LP改善、Googleビジネスプロフィールの整備、業務自動化の小さな設計などについて相談できます。まだ内容が固まっていない段階でも、現状と困っていることを簡単に送ってください。</p>
        <h2>お問い合わせ時に書いてほしいこと</h2>
        <p>返信をスムーズにするため、事業内容、現在の課題、希望する改善内容、参考ページがあれば一緒に記載してください。広告掲載やPR相談の場合は、掲載したい内容と対象ページもお知らせください。</p>
      </section>
    </main>`
  });
}

function renderConsultation(site) {
  return shell({
    site,
    title: "相談メニュー",
    description: "AI戦略、検索・広告、SNS導線、商品化、問い合わせ導線、業務自動化を実装へ進める相談メニューです。",
    body: `<main class="plain-page">
      <section class="section doc">
        <p class="eyebrow">Consultation</p>
        <h1>AI時代の事業成長・収益化相談</h1>
        <p>AI Biz Noteでは、事業者、個人事業主、チーム向けに、AI活用、検索・広告、SNS導線、商品化、問い合わせ導線、業務自動化を実務へ落とし込む相談を受け付けています。記事で学んだ内容を、自分のサイト、商品、相談導線、日々の業務にどう実装するかを一緒に整理します。</p>
        <div class="service-list">
          <section>
            <h2>AI活用の実装相談</h2>
            <p>問い合わせ返信、議事録、記事構成、SNS投稿、社内メモ整理など、今の仕事でAIに任せやすい作業を洗い出します。使うツールよりも、依頼文、確認ルール、保存するテンプレートを先に整えます。</p>
          </section>
          <section>
            <h2>記事テーマと集客導線の相談</h2>
            <p>検索から読まれる記事を増やすため、読者の悩み、検索意図、内部リンク、収益導線を整理します。記事数を増やすだけでなく、相談や問い合わせにつながるテーマを優先します。</p>
          </section>
          <section>
            <h2>LP・サービスページ改善相談</h2>
            <p>ファーストビュー、料金表示、FAQ、実績、問い合わせボタンなどを確認し、訪問者が迷いやすい場所を見つけます。全面リニューアルではなく、今日直せる順番に分けて提案します。</p>
          </section>
        </div>
        <h2>相談前に用意すると進みやすいもの</h2>
        <p>現在のサイトURL、困っていること、増やしたい問い合わせの種類、参考にしているページ、過去のお客様からよく聞かれる質問があると、具体的な改善案にしやすくなります。</p>
        <h2>相談フォーム</h2>
        <p>以下の項目を分かる範囲で入力すると、メールアプリが開きます。内容を確認して送信してください。</p>
        <form class="consultation-form" action="mailto:${escapeHtml(site.contactEmail)}?subject=AI%20Biz%20Note%20%E7%9B%B8%E8%AB%87%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0" method="POST" enctype="text/plain">

          <label>
            お名前
            <input type="text" name="name" autocomplete="name" required>
          </label>

          <label>
            メールアドレス
            <input type="email" name="email" autocomplete="email" required>
          </label>

          <label>
            事業内容
            <input type="text" name="business_type" placeholder="例: 整体院、美容室、士業、個人事業など" required>
          </label>

          <label>
            相談したい内容
            <select name="consultation_topic" required>
              <option value="">選択してください</option>
              <option value="AI活用の実装相談">AI活用の実装相談</option>
              <option value="記事テーマと集客導線">記事テーマと集客導線</option>
              <option value="LP・サービスページ改善">LP・サービスページ改善</option>
              <option value="問い合わせ導線の整理">問い合わせ導線の整理</option>
              <option value="その他">その他</option>
            </select>
          </label>

          <label>
            現在のサイトURL
            <input type="url" name="current_url" placeholder="https://example.com">
          </label>

          <label>
            困っていること・必要事項
            <textarea name="message" rows="8" required placeholder="例:
・今の課題
・増やしたい問い合わせ
・見てほしいページ
・希望する改善内容
・いつまでに相談したいか"></textarea>
          </label>

          <label>
            希望する進め方・予算感
            <input type="text" name="budget_timing" placeholder="例: まずは相談のみ、今月中に改善したい、など">
          </label>

          <button class="button dark" type="submit">メールアプリで送信する</button>
        </form>
        <p class="form-note">送信ボタンでメールアプリが開かない場合は、${escapeHtml(site.contactEmail)} 宛に「AI Biz Note相談希望」と書いて送ってください。</p>
      </section>
    </main>`
  });
}

function renderThanks(site) {
  return shell({
    site,
    title: "送信完了",
    description: `${site.name}の相談フォーム送信完了ページです。`,
    body: `<main class="plain-page">
      <section class="section doc">
        <p class="eyebrow">Thanks</p>
        <h1>送信ありがとうございました</h1>
        <p>相談内容を受け付けました。内容を確認したうえで、必要に応じてご連絡します。</p>
        <p>初回のみ、フォーム送信サービスから確認メールが届く場合があります。その場合はメール内の確認を完了してください。</p>
        <p><a class="text-link" href="./">トップページへ戻る</a></p>
      </section>
    </main>`
  });
}

function renderPrivacy(site) {
  return shell({
    site,
    title: "プライバシーポリシー",
    description: `${site.name}のプライバシーポリシーです。`,
    body: `<main class="plain-page">
      <section class="section doc">
        <p class="eyebrow">Privacy Policy</p>
        <h1>プライバシーポリシー</h1>
        <p>${escapeHtml(site.name)}では、アクセス解析、広告配信、お問い合わせ対応のためにCookie、IPアドレス、ブラウザ情報などを利用する場合があります。</p>
        <h2>広告配信について</h2>
        <p>当サイトでは、第三者配信の広告サービスを利用する場合があります。広告配信事業者は、利用者の興味に応じた広告を表示するためCookie等を使用することがあります。</p>
        <p>Googleを含む第三者配信事業者がCookieを使用して、利用者が当サイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信する場合があります。</p>
        <p>Googleによる広告で使用されるCookieや、パーソナライズ広告の管理については、Googleの広告設定ページなどから確認できます。</p>
        <h2>広告・PR表記について</h2>
        <p>当サイトでは、記事内容に関連する広告、PR、紹介リンクを掲載する場合があります。紹介によって収益が発生する場合でも、掲載内容の判断は読者にとって有用かどうかを基準に行います。</p>
        <h2>アクセス解析について</h2>
        <p>当サイトでは、サイト改善のためアクセス解析ツールを利用する場合があります。収集される情報は個人を直接特定するものではありません。</p>
        <h2>免責事項</h2>
        <p>当サイトの情報は、可能な限り正確な内容を掲載するよう努めますが、正確性や安全性を保証するものではありません。掲載情報の利用によって生じた損害について、当サイトは責任を負いかねます。</p>
        <h2>お問い合わせ</h2>
        <p>お問い合わせや相談フォームから送信された内容は、返信および相談内容の確認のために利用します。フォーム送信には外部のフォーム送信サービスを利用する場合があります。</p>
        <p>個人情報の取り扱いに関するお問い合わせは、${escapeHtml(site.contactEmail)} までご連絡ください。</p>
      </section>
    </main>`
  });
}

function renderRobots(siteUrl) {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

function renderSitemap(siteUrl, articles) {
  const pages = ["", "/about.html", "/consultation.html", "/thanks.html", "/privacy-policy.html", "/contact.html"];
  const posts = articles.map((article) => `/posts/${article.slug}.html`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages, ...posts].map((page) => `  <url><loc>${siteUrl}${page}</loc></url>`).join("\n")}
</urlset>
`;
}

function renderAdsTxt(site) {
  if (!site.googlePublisherId) {
    return "# Add your AdSense publisher ID after approval, then rebuild.\n";
  }

  return `google.com, ${site.googlePublisherId}, DIRECT, f08c47fec0942fa0\n`;
}

const data = JSON.parse(await readFile(dataPath, "utf8"));
const siteUrl = normalizeSiteUrl(data.site.siteUrl);

await mkdir(publicDir, { recursive: true });
await mkdir(postsDir, { recursive: true });
await writeFile(path.join(publicDir, "index.html"), renderHome(data), "utf8");
await writeFile(path.join(publicDir, "about.html"), renderAbout(data.site), "utf8");
await writeFile(path.join(publicDir, "consultation.html"), renderConsultation(data.site), "utf8");
await writeFile(path.join(publicDir, "thanks.html"), renderThanks(data.site), "utf8");
await writeFile(path.join(publicDir, "contact.html"), renderContact(data.site), "utf8");
await writeFile(path.join(publicDir, "privacy-policy.html"), renderPrivacy(data.site), "utf8");
await writeFile(path.join(publicDir, "robots.txt"), renderRobots(siteUrl), "utf8");
await writeFile(path.join(publicDir, "sitemap.xml"), renderSitemap(siteUrl, data.articles), "utf8");
await writeFile(path.join(publicDir, "ads.txt"), renderAdsTxt(data.site), "utf8");

for (const article of data.articles) {
  const related = getRelatedArticles(data.articles, article);
  await writeFile(path.join(postsDir, `${article.slug}.html`), renderArticle(data.site, article, related), "utf8");
}
