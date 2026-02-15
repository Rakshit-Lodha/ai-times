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

const WORD_LIMIT = 100;

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSourcesSheetOpen, setIsSourcesSheetOpen] = useState(false);

  const sources = useMemo(() => parseSources(article.sources), [article.sources]);

  const normalizedOutput = (article.output || "").replace(/\s+/g, " ").trim();
  const words = normalizedOutput ? normalizedOutput.split(" ") : [];
  const isOverLimit = words.length > WORD_LIMIT;
  const trimmedOutput = isOverLimit ? `${words.slice(0, WORD_LIMIT).join(" ")}...` : normalizedOutput;
  const displayOutput = isExpanded ? normalizedOutput : trimmedOutput;

  return (
    <>
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0c] shadow-[0_14px_42px_rgba(0,0,0,0.5)]">
      {article.image_url && (
        <div className="relative aspect-[16/10] w-full">
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

        <h2 className="mt-2 text-[1.52rem] font-bold leading-[1.14] text-white sm:text-[1.7rem]">{article.headline}</h2>

        <p className="mt-3 text-[0.93rem] leading-[1.9] text-white/70">{displayOutput}</p>

        {isOverLimit && (
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="mt-3 rounded-full border border-orange-400/40 bg-orange-400/10 px-3.5 py-1.5 text-[0.72rem] font-mono uppercase tracking-[0.2em] text-orange-300 transition hover:border-orange-300/70 hover:text-orange-200"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}

        {sources.length > 0 && (
          <button
            onClick={() => setIsSourcesSheetOpen(true)}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-orange-400/35 bg-orange-400/10 px-3.5 py-2.5 text-left transition hover:border-orange-300/70"
          >
            <span className="text-[0.72rem] font-mono uppercase tracking-[0.22em] text-orange-300">Sources</span>
            <span className="text-[0.72rem] font-mono uppercase tracking-[0.2em] text-orange-200/90">{sources.length}</span>
          </button>
        )}
      </div>
    </article>
    {isSourcesSheetOpen && (
      <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/65 backdrop-blur-[1px]">
        <button
          aria-label="Close sources"
          className="absolute inset-0 cursor-default"
          onClick={() => setIsSourcesSheetOpen(false)}
        />
        <div className="relative z-[111] w-full max-w-[560px] rounded-t-3xl border border-white/15 bg-[#0b0b0d] px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">Sources</h3>
            <button
              onClick={() => setIsSourcesSheetOpen(false)}
              className="rounded-full border border-white/20 px-2.5 py-1 text-[0.68rem] font-mono uppercase tracking-[0.2em] text-white/65 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="max-h-[44vh] space-y-2 overflow-y-auto pr-1">
            {sources.map((source, idx) => (
              <a
                key={`${source.url}-${idx}`}
                href={source.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 transition hover:border-orange-300/50 hover:text-orange-200"
              >
                {source.name || source.url || `Source ${idx + 1}`}
              </a>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
