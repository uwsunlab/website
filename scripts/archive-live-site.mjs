import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url);
const archiveRoot = path.join(root.pathname, 'Archive', 'live-site');
const pagesDir = path.join(archiveRoot, 'pages');
const rawDir = path.join(archiveRoot, 'raw-html');
const mediaDir = path.join(archiveRoot, 'media');
const sitemapUrl = 'https://www.camsunlab.com/sitemap.xml';

const decodeEntities = (value) =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');

const stripTags = (html) => decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const slugFromUrl = (url) => {
  const parsed = new URL(url);
  const slug = parsed.pathname.replace(/^\/+|\/+$/g, '') || 'home';
  return slug.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
};

const extensionFromUrl = (url, contentType = '') => {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).replace(/[^a-z0-9.]/gi, '').toLowerCase();
  if (ext) return ext;
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('svg')) return '.svg';
  return '.jpg';
};

const markdownEscape = (value) => value.replace(/\|/g, '\\|').replace(/\n/g, ' ');

const parseSitemap = (xml) => {
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
    const block = match[1];
    const loc = decodeEntities(block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim() ?? '');
    const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim() ?? '';
    const images = [...block.matchAll(/<image:image>([\s\S]*?)<\/image:image>/g)].map((imageMatch) => {
      const imageBlock = imageMatch[1];
      return {
        url: decodeEntities(imageBlock.match(/<image:loc>([\s\S]*?)<\/image:loc>/)?.[1]?.trim() ?? ''),
        title: stripTags(imageBlock.match(/<image:title>([\s\S]*?)<\/image:title>/)?.[1] ?? ''),
        caption: stripTags(imageBlock.match(/<image:caption>([\s\S]*?)<\/image:caption>/)?.[1] ?? '')
      };
    }).filter((image) => image.url);
    return { loc, slug: slugFromUrl(loc), lastmod, images };
  });
  return entries.filter((entry) => entry.loc);
};

const mainHtml = (html) => {
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0];
  return main ?? html.match(/<body\b[\s\S]*?<\/body>/i)?.[0] ?? html;
};

const extractText = (html) => {
  const content = mainHtml(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '\n')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '\n')
    .replace(/<!--[\s\S]*?-->/g, '\n')
    .replace(/<(h[1-6]|p|li|blockquote|figcaption|div|section|article|br)\b[^>]*>/gi, '\n')
    .replace(/<\/(h[1-6]|p|li|blockquote|figcaption|div|section|article)>/gi, '\n');

  const lines = decodeEntities(content.replace(/<[^>]+>/g, ' '))
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((line) => !/^var |^window\.|^Static\.|^SQUARESPACE_|^\{|^\}|^@media|^\.|^#/.test(line));

  const deduped = [];
  for (const line of lines) {
    if (deduped[deduped.length - 1] !== line) deduped.push(line);
  }
  return deduped;
};

const extractTitle = (html, fallback) => {
  const h1 = mainHtml(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = h1 ? stripTags(h1) : stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  return title || fallback;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'CamsunLabArchiveBot/1.0 (+local migration)'
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
};

const fetchBinary = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'CamsunLabArchiveBot/1.0 (+local migration)'
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') ?? ''
  };
};

await mkdir(pagesDir, { recursive: true });
await mkdir(rawDir, { recursive: true });
await mkdir(mediaDir, { recursive: true });

const sitemapXml = await fetchText(sitemapUrl);
await writeFile(path.join(archiveRoot, 'sitemap.xml'), sitemapXml);

const entries = parseSitemap(sitemapXml);
const imageByUrl = new Map();

for (const entry of entries) {
  for (const image of entry.images) {
    if (!imageByUrl.has(image.url)) {
      imageByUrl.set(image.url, { ...image, pages: [] });
    }
    imageByUrl.get(image.url).pages.push(entry.slug);
  }
}

const mediaManifest = [];
let imageIndex = 1;
for (const [url, image] of imageByUrl) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 10);
  try {
    const { buffer, contentType } = await fetchBinary(url);
    const ext = extensionFromUrl(url, contentType);
    const filename = `${String(imageIndex).padStart(3, '0')}-${hash}${ext}`;
    await writeFile(path.join(mediaDir, filename), buffer);
    mediaManifest.push({ ...image, filename, contentType, bytes: buffer.length });
  } catch (error) {
    mediaManifest.push({ ...image, filename: '', error: error.message });
  }
  imageIndex += 1;
}

const pageManifest = [];
for (const entry of entries) {
  try {
    const html = await fetchText(entry.loc);
    const title = extractTitle(html, entry.slug);
    const lines = extractText(html);
    const pageImages = entry.images.map((image) => {
      const local = mediaManifest.find((item) => item.url === image.url);
      return { ...image, local: local?.filename ? `../media/${local.filename}` : '' };
    });

    await writeFile(path.join(rawDir, `${entry.slug}.html`), html);
    await writeFile(
      path.join(pagesDir, `${entry.slug}.md`),
      [
        '---',
        `title: ${JSON.stringify(title)}`,
        `source_url: ${JSON.stringify(entry.loc)}`,
        `lastmod: ${JSON.stringify(entry.lastmod)}`,
        `slug: ${JSON.stringify(entry.slug)}`,
        '---',
        '',
        `# ${title}`,
        '',
        `Source: ${entry.loc}`,
        entry.lastmod ? `Last modified: ${entry.lastmod}` : '',
        '',
        '## Extracted text',
        '',
        lines.length ? lines.map((line) => line).join('\n\n') : '_No main text extracted._',
        '',
        '## Images',
        '',
        pageImages.length
          ? pageImages
              .map((image) => `- [${markdownEscape(image.title || path.basename(new URL(image.url).pathname))}](${image.local || image.url}) — ${image.url}${image.caption ? ` — ${markdownEscape(image.caption)}` : ''}`)
              .join('\n')
          : '_No images listed in sitemap for this page._',
        ''
      ].filter((line) => line !== '').join('\n')
    );
    pageManifest.push({ ...entry, title, textLines: lines.length, imageCount: pageImages.length, rawHtml: `raw-html/${entry.slug}.html`, markdown: `pages/${entry.slug}.md` });
  } catch (error) {
    pageManifest.push({ ...entry, error: error.message });
  }
}

await writeFile(path.join(archiveRoot, 'sitemap.json'), JSON.stringify(pageManifest, null, 2));
await writeFile(path.join(archiveRoot, 'media-manifest.json'), JSON.stringify(mediaManifest, null, 2));

const inventory = [
  '# Live Squarespace Archive',
  '',
  `Archived from ${sitemapUrl}.`,
  '',
  `- Pages in sitemap: ${pageManifest.length}`,
  `- Unique sitemap images: ${mediaManifest.length}`,
  `- Page Markdown: \`pages/\``,
  `- Raw HTML: \`raw-html/\``,
  `- Downloaded media: \`media/\``,
  '',
  '## Pages',
  '',
  '| Slug | Source | Last modified | Text lines | Images |',
  '|---|---|---:|---:|---:|',
  ...pageManifest.map((page) => `| ${page.slug} | ${page.loc} | ${page.lastmod || ''} | ${page.textLines ?? 0} | ${page.imageCount ?? page.images?.length ?? 0} |`),
  '',
  '## Notes',
  '',
  '- This archive is intentionally outside `src/pages` and is not publicly routed.',
  '- Markdown files contain extracted text for editing/reference.',
  '- Raw HTML is preserved for any content the text extractor misses.',
  '- Media files are downloaded from Squarespace image URLs listed in the sitemap.',
  ''
];

await writeFile(path.join(archiveRoot, 'README.md'), inventory.join('\n'));

console.log(`Archived ${pageManifest.length} pages and ${mediaManifest.length} unique images to ${archiveRoot}`);
