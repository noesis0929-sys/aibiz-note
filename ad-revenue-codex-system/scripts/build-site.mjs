import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataPath = path.join(rootDir, "content", "articles.json");
const publicDir = path.join(rootDir, "public");
const postsDir = path.join(publicDir, "posts");

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

  return `<aside class="ad-slot" aria-label="広告枠">
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${escapeHtml(site.googleAdsenseClient)}"
      data-ad-slot="0000000000"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </aside>`;
}

function header(site, depth = ".") {
  return `<header class="topbar">
    <a class="brand" href="${depth}/">${escapeHtml(site.name)}</a>
    <nav aria-label="メインメニュー">
      <a href="${depth}/#articles">記事</a>
      <a href="${depth}/#categories">カテゴリ</a>
      <a href="${depth}/about.html">運営者情報</a>
      <a href="${depth}/privacy-policy.html">ポリシー</a>
      <a href="${depth}/contact.html">お問い合わせ</a>
    </nav>
  </header>`;
}

function shell({ site, title, description, body, depth = ".", structuredData = "" }) {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}">
    <title>${escapeHtml(title)} | ${escapeHtml(site.name)}</title>
    ${adsenseHead(site)}
    ${structuredData}
    <link rel="stylesheet" href="${depth}/style.css">
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
    title: "AIとWeb集客の実務ノート",
    description: site.tagline,
    body: `<main>
      <section class="hero">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="hero-inner">
          <p class="eyebrow">AI Biz Note</p>
          <h1>${escapeHtml(featured.title)}</h1>
          <p>${escapeHtml(featured.lead)}</p>
          <div class="hero-actions">
            <a class="button primary" href="#articles">記事を読む</a>
            <a class="button secondary" href="./about.html">このサイトについて</a>
          </div>
        </div>
      </section>

      <section class="metrics" aria-label="メディアの特徴">
        <div>
          <span>対象</span>
          <strong>小さな事業</strong>
        </div>
        <div>
          <span>テーマ</span>
          <strong>AI活用</strong>
        </div>
        <div>
          <span>目的</span>
          <strong>集客改善</strong>
        </div>
        <div>
          <span>方針</span>
          <strong>実務目線</strong>
        </div>
      </section>

      <section class="section intro">
        <div class="section-heading">
          <p class="eyebrow">Start Here</p>
          <h2>まず読んでほしい記事</h2>
          <p class="lead">AIやWeb集客に詳しくなくても、仕事の中で使えるところから始められる記事を選びました。</p>
        </div>
        <div class="article-grid featured-grid">
          ${latest}
        </div>
        <div class="update-note" aria-label="更新確認">
          <strong>Publish test 2026.05.13</strong>
          <span>GitHub連携による自動公開の確認中です。</span>
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

      <section id="articles" class="section articles">
        <div class="section-heading">
          <p class="eyebrow">Articles</p>
          <h2>新着記事</h2>
          <p class="lead">店舗集客、LP改善、AI自動化、広告収益化を中心に、実務で使える内容を増やしています。</p>
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

  return shell({
    site,
    title: article.title,
    description: article.description,
    depth: "..",
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
        ${adSlot("記事上部", site)}
        ${sections}
        <section class="post-related">
          <h2>あわせて読みたい</h2>
          <ul>${relatedCards}</ul>
        </section>
      </article>
    </main>`
  });
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
        <p>${escapeHtml(site.name)}は、小さな事業のWeb集客、LP改善、AI活用を実務目線で整理する情報メディアです。</p>
        <dl class="article-stats">
          <div><dt>運営者</dt><dd>${escapeHtml(site.ownerName)}</dd></div>
          <div><dt>連絡先</dt><dd>${escapeHtml(site.contactEmail)}</dd></div>
        </dl>
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
        <h2>アクセス解析について</h2>
        <p>当サイトでは、サイト改善のためアクセス解析ツールを利用する場合があります。収集される情報は個人を直接特定するものではありません。</p>
        <h2>免責事項</h2>
        <p>当サイトの情報は、可能な限り正確な内容を掲載するよう努めますが、正確性や安全性を保証するものではありません。掲載情報の利用によって生じた損害について、当サイトは責任を負いかねます。</p>
        <h2>お問い合わせ</h2>
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
  const pages = ["", "/about.html", "/privacy-policy.html", "/contact.html"];
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
await writeFile(path.join(publicDir, "contact.html"), renderContact(data.site), "utf8");
await writeFile(path.join(publicDir, "privacy-policy.html"), renderPrivacy(data.site), "utf8");
await writeFile(path.join(publicDir, "robots.txt"), renderRobots(siteUrl), "utf8");
await writeFile(path.join(publicDir, "sitemap.xml"), renderSitemap(siteUrl, data.articles), "utf8");
await writeFile(path.join(publicDir, "ads.txt"), renderAdsTxt(data.site), "utf8");

for (const article of data.articles) {
  const related = data.articles.filter((item) => item.slug !== article.slug).slice(0, 3);
  await writeFile(path.join(postsDir, `${article.slug}.html`), renderArticle(data.site, article, related), "utf8");
}
