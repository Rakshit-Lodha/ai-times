"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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

export type StoryCardProps = {
  article: Article;
  isPriority?: boolean;
};

const WORD_LIMIT = 120;

// Tiny 1x1 blur placeholder
const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWESEyIxUf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q==";

function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [translateY, setTranslateY] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const currentY = useRef<number>(0);

  useEffect(() => {
    // Animate in on next frame
    const frame = requestAnimationFrame(() => setTranslateY(0));
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setTranslateY(100);
    setTimeout(onClose, 250);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    currentY.current = 0;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || dragStartY.current === null) return;
    const deltaY = e.clientY - dragStartY.current;
    currentY.current = deltaY;
    if (deltaY > 0) {
      setTranslateY((deltaY / window.innerHeight) * 100);
    }
  };

  const onPointerUp = () => {
    setIsDragging(false);
    if (translateY > 20) {
      handleClose();
    } else {
      setTranslateY(0);
    }
    dragStartY.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{
        backgroundColor: `rgba(0,0,0,${0.7 * (1 - translateY / 100)})`,
        transition: isDragging ? "none" : "background-color 250ms ease-out"
      }}
    >
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
      />
      <div
        className="relative z-[201] w-full max-w-[560px] rounded-t-[20px] bg-[#161616] px-4 pb-safe pt-2"
        style={{
          transform: `translateY(${translateY}%)`,
          transition: isDragging ? "none" : "transform 250ms cubic-bezier(0.32, 0.72, 0, 1)",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Handle */}
        <div className="flex justify-center pb-4 pt-2">
          <div className="h-1 w-8 rounded-full bg-white/20" />
        </div>
        {children}
      </div>
    </div>
  );
}

function formatDate(newsDate: string): string {
  const parsed = new Date(`${newsDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return newsDate;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const articleDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

  if (articleDate.getTime() === today.getTime()) {
    return "Today";
  }
  if (articleDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function StoryCard({ article, isPriority = false }: StoryCardProps) {
  const [isSourcesSheetOpen, setIsSourcesSheetOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const sources = useMemo(() => parseSources(article.sources), [article.sources]);

  const normalizedOutput = normalizeText(article.output || "");
  const words = normalizedOutput ? normalizedOutput.split(" ") : [];
  const displayOutput = words.length > WORD_LIMIT
    ? `${words.slice(0, WORD_LIMIT).join(" ")}...`
    : normalizedOutput;

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

  // Get primary source name for display
  const primarySourceName = sources.length > 0
    ? (sources[0].name || new URL(sources[0].url || "https://krux.news").hostname.replace("www.", ""))
    : "krux";

  return (
    <>
      <article className="overflow-hidden rounded-[20px] bg-[#0a0a0a]">
        {/* Image section with overlays */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.headline}
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
              priority={isPriority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-orange-500/20 to-blue-500/20" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

          {/* Share button - top right */}
          <button
            onClick={openNativeOrFallbackShare}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all hover:bg-black/60 active:scale-90"
            aria-label="Share"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>

          {/* Bottom bar - sources and date */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {/* Source pill */}
            <button
              onClick={() => setIsSourcesSheetOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded bg-orange-500">
                <span className="text-[9px] font-bold text-white">K</span>
              </div>
              <span className="text-[11px] font-medium text-white/90">
                {sources.length > 1 ? `${sources.length} sources` : primarySourceName}
              </span>
            </button>

            {/* Date pill */}
            <div className="rounded-lg bg-black/50 px-2.5 py-1.5 backdrop-blur-md">
              <span className="text-[11px] font-medium text-white/70">{formatDate(article.news_date)}</span>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="px-5 pb-6 pt-4">
          <h2 className="text-[1.3rem] font-semibold leading-[1.3] tracking-[-0.02em] text-white sm:text-[1.45rem]">
            <Link href={storyPath} className="transition hover:text-white/80">
              {article.headline}
            </Link>
          </h2>

          <p className="mt-4 text-[0.95rem] leading-[1.8] text-white/60">{displayOutput}</p>
        </div>
      </article>

      {isSourcesSheetOpen && (
        <BottomSheet onClose={() => setIsSourcesSheetOpen(false)}>
          <div className="mb-4">
            <p className="text-[0.7rem] font-medium uppercase tracking-wider text-white/30">Researched from</p>
            <h3 className="mt-1 text-[1.1rem] font-semibold text-white">{sources.length} Sources</h3>
          </div>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto pb-2">
            {sources.map((source, idx) => {
              const domain = source.url ? new URL(source.url).hostname.replace("www.", "") : "";
              const displayName = source.name || domain || `Source ${idx + 1}`;

              return (
                <a
                  key={`${source.url}-${idx}`}
                  href={source.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  {/* Favicon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
                    {source.url ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                        alt=""
                        width={20}
                        height={20}
                        className="rounded"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                    )}
                  </div>

                  {/* Source info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9rem] font-medium text-white/90">{displayName}</p>
                    {domain && domain !== displayName && (
                      <p className="truncate text-[0.75rem] text-white/40">{domain}</p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/20">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </a>
              );
            })}
          </div>
        </BottomSheet>
      )}

      {isShareSheetOpen && (
        <BottomSheet onClose={() => setIsShareSheetOpen(false)}>
          <div className="mb-4">
            <h3 className="text-[0.9rem] font-semibold text-white/90">Share</h3>
          </div>
          <div className="flex justify-around">
            <a
              href={xShare}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-[0.7rem] text-white/60">X</span>
            </a>
            <a
              href={whatsappShare}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-[0.7rem] text-white/60">WhatsApp</span>
            </a>
            <a
              href={linkedinShare}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span className="text-[0.7rem] text-white/60">LinkedIn</span>
            </a>
            <button
              onClick={copyLink}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                {copyStatus === "copied" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </div>
              <span className="text-[0.7rem] text-white/60">
                {copyStatus === "copied" ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
