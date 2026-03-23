import { supabase } from "@/lib/supabase";
import { buildStoryPath, getBaseUrl } from "@/lib/story";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = getBaseUrl();

  // Google News sitemaps should only contain articles from the last 48 hours
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("hundred_word_articles")
    .select("id, headline, created_at, news_date")
    .gte("created_at", twoDaysAgo)
    .order("created_at", { ascending: false });

  const articles = data ?? [];

  const urls = articles
    .map((article) => {
      const loc = `${baseUrl}${buildStoryPath(article.id, article.headline)}`;
      const pubDate = new Date(article.created_at || article.news_date).toISOString();
      const title = article.headline
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>KRUX</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
