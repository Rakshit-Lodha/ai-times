import { supabase } from "@/lib/supabase";
import { buildStoryPath, getBaseUrl, getFirstWords, normalizeText } from "@/lib/story";

export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

export async function GET() {
  const baseUrl = getBaseUrl();

  const { data } = await supabase
    .from("hundred_word_articles")
    .select("id, headline, output, created_at, news_date")
    .order("created_at", { ascending: false })
    .limit(50);

  const articles = data ?? [];

  const items = articles
    .map((article) => {
      const url = `${baseUrl}${buildStoryPath(article.id, article.headline)}`;
      const description = getFirstWords(normalizeText(article.output), 30);
      const pubDate = toRfc822(article.created_at || article.news_date);

      return `    <item>
      <title>${escapeXml(article.headline)}</title>
      <link>${url}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${url}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KRUX - AI News in 100 Words</title>
    <link>${baseUrl}</link>
    <description>AI news synthesized from multiple sources in 100 words.</description>
    <language>en</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
