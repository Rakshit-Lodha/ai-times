import { supabase } from "@/lib/supabase";
import HomeShell from "@/components/HomeShell";
import { type Article } from "@/components/StoryCard";
import { type StackPreview } from "@/components/StackPreviewCard";

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

  // Fetch articles and stacks in parallel
  let articleQuery = supabase
    .from("hundred_word_articles")
    .select("id, headline, output, news_date, created_at, image_url, sources, topic")
    .order("created_at", { ascending: false });

  if (isTodayFilter) {
    articleQuery = articleQuery.gte("created_at", getIstMidnight());
  }

  const [articlesResult, stacksResult] = await Promise.all([
    articleQuery.limit(30),
    supabase
      .from("learn_stacks")
      .select("id, slug, title, emoji, description, cover_gradient, cover_image_url, card_count")
      .eq("is_published", true)
      .order("sort_order"),
  ]);

  let articles: Article[] = (articlesResult.data ?? []).map((article) => ({
    id: article.id,
    headline: article.headline,
    output: article.output,
    news_date: article.news_date,
    created_at: article.created_at,
    image_url: article.image_url,
    sources: article.sources,
    topic: article.topic,
  }));

  const stacks: StackPreview[] = (stacksResult.data ?? []).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    emoji: s.emoji,
    description: s.description,
    cover_gradient: s.cover_gradient,
    cover_image_url: s.cover_image_url,
    card_count: s.card_count,
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

  return (
    <HomeShell
      articles={articles}
      stacks={stacks}
      startIndex={startIndex ?? (isTodayFilter ? 1 : undefined)}
      initialTodayFilter={isTodayFilter}
    />
  );
}
