"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export type Source = {
  name?: string;
  url?: string;
};

export type Article = {
  id: number;
  headline: string;
  output: string;
  news_date: string;
  image_url: string | null;
  sources: Source[] | string | null;
};

function parseSources(raw: Article["sources"]): Source[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter((item) => Boolean(item?.name || item?.url));
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item: Source) => Boolean(item?.name || item?.url));
      }
      return [];
    } catch {
      return [];
    }
  }

  return [];
}

function formatDate(newsDate: string): string {
  const parsed = new Date(`${newsDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return newsDate;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function StoryCard({ article }: { article: Article }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const sources = useMemo(() => parseSources(article.sources), [article.sources]);
  const paragraphs = article.output?.split("\n").filter(Boolean) ?? [];
  const body = paragraphs.length > 1 ? paragraphs.slice(0, -1).join(" ") : article.output;
  const closer = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : "";

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0c] shadow-[0_14px_42px_rgba(0,0,0,0.5)]">
      {article.image_url && (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={article.image_url}
            alt={article.headline}
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/35 to-transparent" />
        </div>
      )}

      <div className="px-5 pb-5 pt-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-orange-400">{formatDate(article.news_date)}</p>

        <h2 className="mt-2 text-[1.9rem] font-bold leading-[1.1] text-white">{article.headline}</h2>

        <p className="mt-4 text-[1.06rem] leading-8 text-white/70">{body}</p>

        {closer && <p className="mt-4 text-[1.05rem] italic leading-8 text-orange-300">{closer}</p>}

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/35">{article.news_date}</span>

          {sources.length > 0 && (
            <button
              onClick={() => setSourcesOpen((prev) => !prev)}
              className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 transition hover:text-orange-400"
            >
              {sourcesOpen ? "Hide" : "Sources"} ({sources.length})
            </button>
          )}
        </div>

        {sourcesOpen && sources.length > 0 && (
          <div className="mt-3 grid gap-1.5">
            {sources.map((source, idx) => (
              <a
                key={`${source.url}-${idx}`}
                href={source.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs font-mono text-white/45 transition hover:text-orange-300"
              >
                ↗ {source.name || source.url || "Source"}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
