import { supabase } from "@/lib/supabase";
import SwipeDeck from "@/components/SwipeDeck";
import { type Article } from "@/components/StoryCard";

export const revalidate = 300;

type Props = {
  searchParams: Promise<{ start?: string; today?: string }>;
};

function getIstMidnight(): string {
  const istDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return new Date(`${istDate}T00:00:00+05:30`).toISOString();
}

export default async function Home({ searchParams }: Props) {
  const { start, today } = await searchParams;
  const isTodayFilter = today === "1";

  let query = supabase
    .from("hundred_word_articles")
    .select("id, headline, output, news_date, created_at, image_url, sources, topic")
    .order("created_at", { ascending: false });

  if (isTodayFilter) {
    query = query.gte("created_at", getIstMidnight());
  }

  const { data } = await query.limit(30);

  let articles: Article[] = (data ?? []).map((article) => ({
    id: article.id,
    headline: article.headline,
    output: article.output,
    news_date: article.news_date,
    created_at: article.created_at,
    image_url: article.image_url,
    sources: article.sources,
    topic: article.topic,
  }));

  // Find the starting index if coming from a shared link
  let startIndex: number | undefined;
  if (start) {
    const articleId = parseInt(start, 10);
    const foundIndex = articles.findIndex((a) => a.id === articleId);
    if (foundIndex !== -1) {
      // +1 because index 0 is the intro card
      startIndex = foundIndex + 1;
    } else if (!isNaN(articleId)) {
      // Article not in initial batch (older article) — fetch it directly
      const { data: single } = await supabase
        .from("hundred_word_articles")
        .select("id, headline, output, news_date, created_at, image_url, sources, topic")
        .eq("id", articleId)
        .single();

      if (single) {
        articles.unshift({
          id: single.id,
          headline: single.headline,
          output: single.output,
          news_date: single.news_date,
          created_at: single.created_at,
          image_url: single.image_url,
          sources: single.sources,
          topic: single.topic,
        });
        startIndex = 1; // index 0 = intro, index 1 = the shared article
      }
    }
  }

  return <SwipeDeck articles={articles} startIndex={startIndex ?? (isTodayFilter ? 1 : undefined)} initialTodayFilter={isTodayFilter} />;
}
