import { supabase } from "@/lib/supabase";
import SwipeDeck from "@/components/SwipeDeck";
import { type Article } from "@/components/StoryCard";

export const revalidate = 300;

export default async function Home() {
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

  return <SwipeDeck articles={articles} />;
}
