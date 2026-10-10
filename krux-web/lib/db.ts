// Krux content lives as JSON files in krux-web/data/, written by the daily
// pipeline (krux-pipeline) and committed to git. Every commit redeploys the
// site, so reading them at build/request time is always up to date.
import articlesData from "@/data/hundred_word_articles.json";
import stacksData from "@/data/learn_stacks.json";
import stackCardsData from "@/data/learn_stack_cards.json";

export type ArticleRow = {
  id: number;
  event_id?: string | null;
  headline: string;
  output: string;
  news_date: string;
  created_at: string | null;
  image_url: string | null;
  sources: unknown;
  topic: string | null;
};

export type StackRow = {
  id: number;
  slug: string;
  title: string;
  emoji: string | null;
  description: string | null;
  cover_gradient: string | null;
  cover_image_url: string | null;
  card_count: number | null;
  is_published: boolean;
  sort_order: number | null;
};

export type StackCardRow = {
  id: number;
  stack_id: number;
  position: number;
  headline: string;
  output: string;
  image_url: string | null;
};

const timeOf = (a: ArticleRow) => new Date(a.created_at || a.news_date).getTime();

// Newest first, matching the old `order("created_at", { ascending: false })`.
const ARTICLES: ArticleRow[] = [...(articlesData as ArticleRow[])].sort(
  (a, b) => timeOf(b) - timeOf(a)
);
const STACKS = stacksData as StackRow[];
const STACK_CARDS = stackCardsData as StackCardRow[];

export function listArticles(
  options: { topic?: string; since?: string; offset?: number; limit?: number } = {}
): ArticleRow[] {
  const { topic, since, offset = 0, limit } = options;
  const sinceMs = since ? new Date(since).getTime() : null;

  const filtered = ARTICLES.filter(
    (a) => (!topic || a.topic === topic) && (sinceMs === null || timeOf(a) >= sinceMs)
  );
  return filtered.slice(offset, limit === undefined ? undefined : offset + limit);
}

export function getArticle(id: number): ArticleRow | null {
  return ARTICLES.find((a) => a.id === id) ?? null;
}

export function listPublishedStacks(): StackRow[] {
  return STACKS.filter((s) => s.is_published).sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
}

export function getPublishedStack(
  slug: string
): { stack: StackRow; cards: StackCardRow[] } | null {
  const stack = STACKS.find((s) => s.slug === slug && s.is_published);
  if (!stack) return null;

  const cards = STACK_CARDS.filter((c) => c.stack_id === stack.id).sort(
    (a, b) => a.position - b.position
  );
  return { stack, cards };
}
