"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buildStoryPath, getFirstWords, normalizeText, parseSources } from "@/lib/story";

export type Source = {
  name?: string;
  url?: string;
};

export type Article = {
  id: number;
  headline: string;
  output: string;
  news_date: string;
  created_at?: string | null;
  image_url: string | null;
  sources: Source[] | string | null;
};

const WORD_LIMIT = 100;

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
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const sources = useMemo(() => parseSources(article.sources), [article.sources]);

  const normalizedOutput = normalizeText(article.output || "");
  const words = normalizedOutput ? normalizedOutput.split(" ") : [];
  const isOverLimit = words.length > WORD_LIMIT;
  const trimmedOutput = isOverLimit ? `${words.slice(0, WORD_LIMIT).join(" ")}...` : normalizedOutput;
  const displayOutput = isExpanded ? normalizedOutput : trimmedOutput;

  const storyPath = buildStoryPath(article.id, article.headline);
  const summary20 = getFirstWords(normalizedOutput, 20);

  const getShareUrl = () => {
    if (typeof window === "undefined") return storyPath;
    return `${window.location.origin}${storyPath}`;
  };

  const openNativeOrFallbackShare = async () => {
    const shareUrl = getShareUrl();
    const shareData = {
      title: article.headline,
      text: summary20,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        const shareError = error as { name?: string };
        if (shareError?.name === "AbortError") return;
      }
    }

    setIsShareSheetOpen(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    window.setTimeout(() => setCopyStatus("idle"), 1600);
  };

  const shareUrl = typeof window !== "undefined" ? getShareUrl() : `https://krux.news${storyPath}`;
  const xShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${article.headline}\n\n${summary20}\n\n${shareUrl}`)}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.headline}\n${summary20}\n${shareUrl}`)}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

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

          <h2 className="mt-2 text-[1.52rem] font-bold leading-[1.14] text-white sm:text-[1.7rem]">
            <Link href={storyPath} className="transition hover:text-orange-200">
              {article.headline}
            </Link>
          </h2>

          <p className="mt-3 text-[0.93rem] leading-[1.9] text-white/70">{displayOutput}</p>

          {isOverLimit && (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-3 rounded-full border border-orange-400/40 bg-orange-400/10 px-3.5 py-1.5 text-[0.72rem] font-mono uppercase tracking-[0.2em] text-orange-300 transition hover:border-orange-300/70 hover:text-orange-200"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsSourcesSheetOpen(true)}
              className="flex items-center justify-between rounded-xl border border-orange-400/35 bg-orange-400/10 px-3.5 py-2.5 text-left transition hover:border-orange-300/70"
            >
              <span className="text-[0.72rem] font-mono uppercase tracking-[0.22em] text-orange-300">Sources</span>
              <span className="text-[0.72rem] font-mono uppercase tracking-[0.2em] text-orange-200/90">{sources.length}</span>
            </button>

            <button
              onClick={openNativeOrFallbackShare}
              className="flex items-center justify-between rounded-xl border border-sky-400/35 bg-sky-400/10 px-3.5 py-2.5 text-left transition hover:border-sky-300/70"
            >
              <span className="text-[0.72rem] font-mono uppercase tracking-[0.22em] text-sky-300">Share</span>
              <span className="text-[0.72rem] font-mono uppercase tracking-[0.2em] text-sky-200/90">↗</span>
            </button>
          </div>
        </div>
      </article>

      {isSourcesSheetOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/65 backdrop-blur-[1px]">
          <button aria-label="Close sources" className="absolute inset-0 cursor-default" onClick={() => setIsSourcesSheetOpen(false)} />
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

      {isShareSheetOpen && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/65 backdrop-blur-[1px]">
          <button aria-label="Close share" className="absolute inset-0 cursor-default" onClick={() => setIsShareSheetOpen(false)} />
          <div className="relative z-[121] w-full max-w-[560px] rounded-t-3xl border border-white/15 bg-[#0b0b0d] px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">Share story</h3>
              <button
                onClick={() => setIsShareSheetOpen(false)}
                className="rounded-full border border-white/20 px-2.5 py-1 text-[0.68rem] font-mono uppercase tracking-[0.2em] text-white/65 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={xShare}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white/85 transition hover:border-sky-300/60 hover:text-sky-200"
              >
                Share on X
              </a>
              <a
                href={whatsappShare}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white/85 transition hover:border-green-300/60 hover:text-green-200"
              >
                WhatsApp
              </a>
              <a
                href={linkedinShare}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white/85 transition hover:border-blue-300/60 hover:text-blue-200"
              >
                LinkedIn
              </a>
              <button
                onClick={copyLink}
                className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2.5 text-left text-sm text-white/85 transition hover:border-orange-300/60 hover:text-orange-200"
              >
                {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
