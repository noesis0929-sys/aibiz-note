import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataPath = path.join(rootDir, "content", "articles.json");
const outputDir = path.join(rootDir, "social-drafts");

function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || "https://example.com").replace(/\/+$/, "");
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekKey(date) {
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date - firstDay) / 86400000) + 1;
  const week = Math.ceil((dayOfYear + firstDay.getDay()) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function pickItems(items, start, count) {
  return Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
}

function compact(text, max = 90) {
  const value = String(text || "").replace(/\s+/g, "");
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function firstSection(article) {
  return article.sections?.[0]?.body || article.description;
}

function articleUrl(site, article) {
  return `${normalizeSiteUrl(site.siteUrl)}/posts/${article.slug}.html`;
}

function makeXPosts(site, article) {
  const url = articleUrl(site, article);
  const section = compact(firstSection(article), 86);
  const checklist = (article.sections || [])
    .slice(0, 4)
    .map((sectionItem) => `- ${sectionItem.heading}`)
    .join("\n");

  return [
    `[${article.category}] ${article.title}

${section}

Point: Start by choosing one place where this applies to your own work.

${url}`,
    `${article.title}

Checklist:
${checklist}

The article organizes the points in the order people usually get stuck.

${url}`,
    `After reading, you may still wonder what to improve first in your own business.

AI Biz Note can help with AI use, web traffic, LP improvement, and inquiry flow.

Article: ${url}
Consultation: ${normalizeSiteUrl(site.siteUrl)}/consultation.html`
  ];
}

function makeThreadsPost(site, article) {
  return `${article.title}

${compact(article.description, 100)}

AI Biz Note is designed so readers can move from learning in articles to implementation through consultation.

${articleUrl(site, article)}`;
}

function makeNoteDraft(site, articles, weekKey) {
  const lines = [];
  lines.push("# Weekly note draft: AI use and web traffic");
  lines.push("");
  lines.push("AI Biz Note collects practical articles about AI use, web traffic, LP improvement, and small-business operations.");
  lines.push("");
  lines.push("This weekly note draft summarizes five articles and links readers back to the main site.");
  lines.push("");

  for (const [index, article] of articles.entries()) {
    lines.push(`## ${index + 1}. ${article.title}`);
    lines.push("");
    lines.push(article.description);
    lines.push("");
    lines.push(`First point to check: ${article.sections?.[0]?.heading || article.category}`);
    lines.push("");
    lines.push(`Article: ${articleUrl(site, article)}`);
    lines.push("");
  }

  lines.push("## Consultation");
  lines.push("");
  lines.push("If you know the article is useful but are unsure what to change first, use the consultation menu.");
  lines.push("");
  lines.push(`Consultation: ${normalizeSiteUrl(site.siteUrl)}/consultation.html`);
  lines.push("");
  lines.push("## Before posting");
  lines.push("");
  lines.push(`- Week ID: ${weekKey}`);
  lines.push("- Do not copy full site articles into note.");
  lines.push("- Use this as a summary and link guide.");
  lines.push("- Avoid exaggerated income claims.");

  return lines.join("\n");
}

function makeChecklist(dateLabel) {
  return `# Posting checklist ${dateLabel}

## X / Threads

- URL opens correctly.
- One post has one theme.
- No exaggerated claims such as guaranteed income.
- Use the consultation link carefully, not in every post.
- Check line breaks on mobile before posting.

## note

- The note draft is not a full copy of the site article.
- It is rewritten as a summary, insight, and practical guide.
- Main site article URLs and consultation URL are included.
- Tags are limited to 3 to 5.
- Title and body match before publishing.

## Publishing rule

- Codex creates drafts only.
- A human reviews before posting to X, Threads, or note.
- During AdSense review, prioritize useful information over promotion.
`;
}

const data = JSON.parse(await readFile(dataPath, "utf8"));
const now = new Date();
const dateLabel = formatDate(now);
const weekKey = getWeekKey(now);
const dayIndex = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000);

const dailyArticles = pickItems(data.articles, dayIndex % data.articles.length, 3);
const weeklyArticles = pickItems(data.articles, (dayIndex + 7) % data.articles.length, 5);

await mkdir(outputDir, { recursive: true });

const dailyLines = [];
dailyLines.push(`# X / Threads drafts ${dateLabel}`);
dailyLines.push("");
dailyLines.push("These are drafts only. Please review before posting.");
dailyLines.push("");

for (const [index, article] of dailyArticles.entries()) {
  dailyLines.push(`## Target ${index + 1}: ${article.title}`);
  dailyLines.push("");
  dailyLines.push(`URL: ${articleUrl(data.site, article)}`);
  dailyLines.push("");
  makeXPosts(data.site, article).forEach((post, postIndex) => {
    dailyLines.push(`### X draft ${postIndex + 1}`);
    dailyLines.push("");
    dailyLines.push(post);
    dailyLines.push("");
  });
  dailyLines.push("### Threads draft");
  dailyLines.push("");
  dailyLines.push(makeThreadsPost(data.site, article));
  dailyLines.push("");
}

const allLines = [];
allLines.push("# X drafts by article");
allLines.push("");
allLines.push("Each article has three patterns: issue, checklist, and consultation route.");
allLines.push("");
for (const article of data.articles) {
  allLines.push(`## ${article.title}`);
  allLines.push("");
  allLines.push(`URL: ${articleUrl(data.site, article)}`);
  makeXPosts(data.site, article).forEach((post, postIndex) => {
    allLines.push("");
    allLines.push(`### Draft ${postIndex + 1}`);
    allLines.push("");
    allLines.push(post);
  });
  allLines.push("");
}

await writeFile(path.join(outputDir, `${dateLabel}-x-threads.md`), `${dailyLines.join("\n")}\n`, "utf8");
await writeFile(path.join(outputDir, `${dateLabel}-all-article-x.md`), `${allLines.join("\n")}\n`, "utf8");
await writeFile(path.join(outputDir, `${weekKey}-note-draft.md`), `${makeNoteDraft(data.site, weeklyArticles, weekKey)}\n`, "utf8");
await writeFile(path.join(outputDir, `${dateLabel}-posting-checklist.md`), makeChecklist(dateLabel), "utf8");

console.log(`Generated social drafts in ${outputDir}`);
