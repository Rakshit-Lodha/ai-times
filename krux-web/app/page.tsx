import { supabase } from "@/lib/supabase";
import SwipeDeck from "@/components/SwipeDeck";
import { type Article } from "@/components/StoryCard";

export const revalidate = 300;

type Props = {
  searchParams: Promise<{ start?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const { start } = await searchParams;

  const { data } = await supabase
    .from("hundred_word_articles")
    .select("id, headline, output, news_date, image_url, sources")
    .order("news_date", { ascending: false })
    .limit(40);

  const articles: Article[] = (data ?? []).map((article) => ({
    id: article.id,
    headline: article.headline,
    output: article.output,
    news_date: article.news_date,
    image_url: article.image_url,
    sources: article.sources,
  }));

  // Find the starting index if coming from a shared link
  let startIndex: number | undefined;
  if (start) {
    const articleId = parseInt(start, 10);
    const foundIndex = articles.findIndex((a) => a.id === articleId);
    if (foundIndex !== -1) {
      // +1 because index 0 is the intro card
      startIndex = foundIndex + 1;
    }
  }

  return <SwipeDeck articles={articles} startIndex={startIndex} />;
}
