import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  buildStoryPath,
  buildStorySlug,
  extractStoryId,
  getBaseUrl,
  getFirstWords,
  normalizeText,
  parseSources,
  splitStorySections,
} from "@/lib/story";

type StoryRecord = {
  id: number;
  headline: string;
  output: string;
  news_date: string;
  created_at: string | null;
  image_url: string | null;
  sources: unknown;
};

const getStoryById = cache(async (storyId: number): Promise<StoryRecord | null> => {
  const { data, error } = await supabase
    .from("hundred_word_articles")
    .select("id, headline, output, news_date, created_at, image_url, sources")
    .eq("id", storyId)
    .maybeSingle();

  if (error || !data) return null;
  return data as StoryRecord;
});

function formatDate(value: string | null): string {
  if (!value) return "Unknown date";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string | null): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storySlug: string }>;
}): Promise<Metadata> {
  const { storySlug } = await params;
  const storyId = extractStoryId(storySlug);
  if (!storyId) return {};

  const story = await getStoryById(storyId);
  if (!story) return {};

  const baseUrl = getBaseUrl();
  const canonicalPath = buildStoryPath(story.id, story.headline);
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const description = getFirstWords(normalizeText(story.output), 20);
  const ogImage = story.image_url || `${baseUrl}/og-default.svg`;

  return {
    title: `${story.headline} | Krux`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: story.headline,
      description,
      url: canonicalUrl,
      siteName: "Krux",
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: story.headline,
      description,
      images: [ogImage],
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ storySlug: string }>;
}) {
  const { storySlug } = await params;
  const storyId = extractStoryId(storySlug);
  if (!storyId) notFound();

  const story = await getStoryById(storyId);
  if (!story) notFound();

  const canonicalSlug = buildStorySlug(story.id, story.headline);
  if (storySlug !== canonicalSlug) {
    redirect(`/story/${canonicalSlug}`);
  }

  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}${buildStoryPath(story.id, story.headline)}`;
  const ogImage = story.image_url || `${baseUrl}/og-default.svg`;
  const { summary100, whatHappened, whyItMatters } = splitStorySections(story.output);
  const sources = parseSources(story.sources);
  const publishedAt = story.created_at || story.news_date;
  const modifiedAt = story.created_at || story.news_date;

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.headline,
    image: [ogImage],
    datePublished: publishedAt,
    dateModified: modifiedAt,
    description: getFirstWords(summary100, 30),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
      name: "Krux.News",
    },
    url: canonicalUrl,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1d2f5f_0%,_#0a0a0a_40%,_#020202_100%)] px-4 py-6 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />

      <article className="mx-auto w-full max-w-[760px] rounded-3xl border border-white/10 bg-[#0b0b0b]/95 p-5 shadow-[0_18px_54px_rgba(0,0,0,0.5)] md:p-7">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/?reset=1"
            className="rounded-full border border-white/20 px-3 py-1.5 text-[0.72rem] font-mono uppercase tracking-[0.2em] text-white/75 transition hover:text-white"
          >
            Back to feed
          </Link>
          <p className="text-[0.7rem] font-mono uppercase tracking-[0.18em] text-white/50">Krux</p>
        </div>

        {story.image_url && (
          <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
            <Image src={story.image_url} alt={story.headline} fill sizes="(max-width: 768px) 100vw, 760px" className="object-cover" priority />
          </div>
        )}

        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-orange-300">{formatDate(story.news_date)}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">{story.headline}</h1>

        <div className="mt-4 grid gap-2 text-[0.78rem] font-mono uppercase tracking-[0.18em] text-white/45">
          <p>Published: {formatDateTime(publishedAt)}</p>
          <p>Updated: {formatDateTime(modifiedAt)}</p>
        </div>

        <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="text-[0.76rem] font-mono uppercase tracking-[0.2em] text-orange-300">100-word summary</h2>
          <p className="mt-3 text-[1.04rem] leading-8 text-white/80">{summary100}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-[0.76rem] font-mono uppercase tracking-[0.2em] text-orange-300">What happened</h2>
          <p className="mt-3 text-[1.02rem] leading-8 text-white/78">{whatHappened}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-[0.76rem] font-mono uppercase tracking-[0.2em] text-orange-300">Why it matters</h2>
          <p className="mt-3 text-[1.02rem] leading-8 text-orange-200/92">{whyItMatters}</p>
        </section>

        <section className="mt-7">
          <h2 className="text-[0.76rem] font-mono uppercase tracking-[0.2em] text-orange-300">Sources</h2>
          <div className="mt-3 space-y-2">
            {sources.map((source, idx) => (
              <a
                key={`${source.url}-${idx}`}
                href={source.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/85 transition hover:border-orange-300/60 hover:text-orange-200"
              >
                {source.name || source.url || `Source ${idx + 1}`}
              </a>
            ))}
            {!sources.length && <p className="text-sm text-white/55">No sources listed.</p>}
          </div>
        </section>
      </article>
    </main>
  );
}
