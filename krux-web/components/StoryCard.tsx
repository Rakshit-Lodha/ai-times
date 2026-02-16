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
  onUndo?: () => void;
  canUndo?: boolean;
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

export default function StoryCard({ article, isPriority = false, onUndo, canUndo = false }: StoryCardProps) {
  const [isSourcesSheetOpen, setIsSourcesSheetOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isDeepDiveSheetOpen, setIsDeepDiveSheetOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [deepDiveToast, setDeepDiveToast] = useState<string | null>(null);

  const sources = useMemo(() => parseSources(article.sources), [article.sources]);

  const normalizedOutput = normalizeText(article.output || "");
  const words = normalizedOutput ? normalizedOutput.split(" ") : [];
  const displayOutput = words.length > WORD_LIMIT
    ? `${words.slice(0, WORD_LIMIT).join(" ")}...`
    : normalizedOutput;

  const storyPath = buildStoryPath(article.id, article.headline);
  const summary20 = getFirstWords(normalizedOutput, 20);

  const getShareUrl = () => {
    if (typeof window === "undefined") return `/?start=${article.id}`;
    return `${window.location.origin}/?start=${article.id}`;
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

  const shareUrl = typeof window !== "undefined" ? getShareUrl() : `https://krux.news/?start=${article.id}`;
  const xShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${article.headline}\n\n${summary20}\n\n${shareUrl}`)}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.headline}\n${summary20}\n${shareUrl}`)}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  // Get primary source name for display
  const primarySourceName = sources.length > 0
    ? (sources[0].name || new URL(sources[0].url || "https://krux.news").hostname.replace("www.", ""))
    : "krux";

  return (
    <>
      <article className="min-h-screen w-full bg-[#080808]">
        {/* Image section - full width, edge-to-edge */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.headline}
              fill
              sizes="100vw"
              className="object-cover"
              priority={isPriority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-orange-500/20 to-blue-500/20" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" />

          {/* Top bar - date and share */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {/* Date pill */}
            <div className="rounded-full bg-black/40 px-3 py-2 backdrop-blur-md">
              <span className="text-[12px] font-medium text-white/70">{formatDate(article.news_date)}</span>
            </div>
            {/* Share button */}
            <button
              onClick={openNativeOrFallbackShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all hover:bg-black/60 active:scale-90"
              aria-label="Share"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>

          {/* Bottom bar - sources and undo */}
          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
            {/* Source pill */}
            <button
              onClick={() => setIsSourcesSheetOpen(true)}
              className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                <span className="text-[10px] font-bold text-white">K</span>
              </div>
              <span className="text-[12px] font-medium text-white/90">
                {sources.length > 1 ? `${sources.length} sources` : primarySourceName}
              </span>
            </button>

            {/* Undo button */}
            {canUndo && onUndo && (
              <button
                onClick={onUndo}
                className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                aria-label="Go back to previous article"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v6h6"/>
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                </svg>
                <span className="text-[12px] font-medium text-white/90">Undo</span>
              </button>
            )}
          </div>
        </div>

        {/* Content section - generous left/right padding for readability */}
        <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px', paddingBottom: '40px' }}>
          <h2 className="text-[1.4rem] font-semibold leading-[1.35] tracking-[-0.02em] text-white sm:text-[1.6rem]">
            <Link href={storyPath} className="transition hover:text-white/80">
              {article.headline}
            </Link>
          </h2>

          <p className="mt-5 text-[1rem] leading-[1.9] text-white/65 sm:text-[1.05rem]">{displayOutput}</p>

          {/* Go Deeper button */}
          <button
            onClick={() => setIsDeepDiveSheetOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 transition-all hover:bg-white/10 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
              <path d="M11 8v6"/>
              <path d="M8 11h6"/>
            </svg>
            <span className="text-[0.9rem] font-medium text-white/80">Go Deeper</span>
          </button>
        </div>
      </article>

      {/* Toast notification for deep dive */}
      {deepDiveToast && (
        <div
          className="fixed bottom-8 left-1/2 z-[300] -translate-x-1/2 rounded-full bg-white/10 px-4 py-2.5 backdrop-blur-md"
          style={{
            animation: "toast-fade-in 300ms ease-out forwards",
          }}
        >
          <style>{`
            @keyframes toast-fade-in {
              from { opacity: 0; transform: translateX(-50%) translateY(10px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
          <span className="text-[0.85rem] font-medium text-white">{deepDiveToast}</span>
        </div>
      )}

      {isSourcesSheetOpen && (
        <BottomSheet onClose={() => setIsSourcesSheetOpen(false)}>
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-[1rem] font-semibold text-white">Sources</span>
            </div>
            <button
              onClick={() => setIsSourcesSheetOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/70">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Sources list */}
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pb-2">
            {sources.map((source, idx) => {
              const domain = source.url ? new URL(source.url).hostname.replace("www.", "") : "";
              const displayName = source.name || domain || `Source ${idx + 1}`;

              return (
                <a
                  key={`${source.url}-${idx}`}
                  href={source.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl p-2 transition-all hover:bg-white/[0.05] active:scale-[0.99]"
                >
                  {/* Number */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-[11px] font-semibold text-white/60">
                    {idx + 1}
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[0.9rem] font-medium leading-snug text-white/90">{displayName}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {source.url && (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                          alt=""
                          width={12}
                          height={12}
                          className="rounded-sm opacity-60"
                        />
                      )}
                      <span className="text-[0.75rem] text-white/40">{domain}</span>
                    </div>
                  </div>
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

      {isDeepDiveSheetOpen && (
        <BottomSheet onClose={() => setIsDeepDiveSheetOpen(false)}>
          <div className="mb-4">
            <h3 className="text-[0.9rem] font-semibold text-white/90">Go Deeper</h3>
            <p className="mt-1 text-[0.75rem] text-white/50">Research this topic with AI</p>
          </div>
          <div className="flex justify-around">
            {/* Perplexity - direct URL works */}
            <button
              onClick={() => {
                const sourcesText = sources.map(s => s.name || s.url || "").filter(Boolean).join(", ");
                const prompt = `I just read this AI news article and want to learn more:\n\nHeadline: ${article.headline}\n\nSummary: ${normalizedOutput}\n\nSources: ${sourcesText}\n\nHelp me understand this topic in more depth. What are the key implications and broader context?`;
                const encodedPrompt = encodeURIComponent(prompt);
                window.open(`https://www.perplexity.ai/search/?q=${encodedPrompt}`, "_blank");
                setIsDeepDiveSheetOpen(false);
              }}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#20808D]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-[0.7rem] text-white/60">Perplexity</span>
            </button>

            {/* ChatGPT - copy + redirect */}
            <button
              onClick={async () => {
                const sourcesText = sources.map(s => s.name || s.url || "").filter(Boolean).join(", ");
                const prompt = `I just read this AI news article and want to learn more:\n\nHeadline: ${article.headline}\n\nSummary: ${normalizedOutput}\n\nSources: ${sourcesText}\n\nHelp me understand this topic in more depth. What are the key implications and broader context?`;
                await navigator.clipboard.writeText(prompt);
                setIsDeepDiveSheetOpen(false);
                setDeepDiveToast("Prompt copied! Opening ChatGPT...");
                setTimeout(() => {
                  window.open("https://chat.openai.com/", "_blank");
                  setDeepDiveToast(null);
                }, 1500);
              }}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10A37F]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4048-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6099-1.4997z"/>
                </svg>
              </div>
              <span className="text-[0.7rem] text-white/60">ChatGPT</span>
            </button>

            {/* Claude - copy + redirect */}
            <button
              onClick={async () => {
                const sourcesText = sources.map(s => s.name || s.url || "").filter(Boolean).join(", ");
                const prompt = `I just read this AI news article and want to learn more:\n\nHeadline: ${article.headline}\n\nSummary: ${normalizedOutput}\n\nSources: ${sourcesText}\n\nHelp me understand this topic in more depth. What are the key implications and broader context?`;
                await navigator.clipboard.writeText(prompt);
                setIsDeepDiveSheetOpen(false);
                setDeepDiveToast("Prompt copied! Opening Claude...");
                setTimeout(() => {
                  window.open("https://claude.ai/new", "_blank");
                  setDeepDiveToast(null);
                }, 1500);
              }}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D97757]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M4.709 15.955l4.72-2.647.08-.054a.79.79 0 00.263-.293l.054-.08 2.646-4.72a.25.25 0 01.436 0l2.646 4.72.054.08a.79.79 0 00.264.293l.08.054 4.719 2.647a.25.25 0 010 .436l-4.72 2.646-.08.054a.79.79 0 00-.263.293l-.054.08-2.646 4.72a.25.25 0 01-.436 0l-2.646-4.72-.054-.08a.79.79 0 00-.264-.293l-.08-.054-4.719-2.646a.25.25 0 010-.436zM16.19 2.391l1.688-.947.028-.02a.28.28 0 00.094-.104l.02-.029.946-1.687a.089.089 0 01.156 0l.946 1.687.02.029a.28.28 0 00.094.105l.028.019 1.688.947a.089.089 0 010 .156l-1.688.946-.028.02a.28.28 0 00-.094.104l-.02.029-.946 1.687a.089.089 0 01-.156 0l-.946-1.687-.02-.029a.28.28 0 00-.094-.105l-.028-.019-1.688-.946a.089.089 0 010-.156z"/>
                </svg>
              </div>
              <span className="text-[0.7rem] text-white/60">Claude</span>
            </button>

            {/* Gemini - copy + redirect */}
            <button
              onClick={async () => {
                const sourcesText = sources.map(s => s.name || s.url || "").filter(Boolean).join(", ");
                const prompt = `I just read this AI news article and want to learn more:\n\nHeadline: ${article.headline}\n\nSummary: ${normalizedOutput}\n\nSources: ${sourcesText}\n\nHelp me understand this topic in more depth. What are the key implications and broader context?`;
                await navigator.clipboard.writeText(prompt);
                setIsDeepDiveSheetOpen(false);
                setDeepDiveToast("Prompt copied! Opening Gemini...");
                setTimeout(() => {
                  window.open("https://gemini.google.com/app", "_blank");
                  setDeepDiveToast(null);
                }, 1500);
              }}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:bg-white/[0.05] active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 3.6c2.34 0 4.5.78 6.24 2.1L12 12V3.6zm0 16.8c-2.34 0-4.5-.78-6.24-2.1L12 12v8.4zm8.4-8.4c0 2.34-.78 4.5-2.1 6.24L12 12h8.4zM12 12L5.76 5.76A8.31 8.31 0 013.6 12H12z"/>
                </svg>
              </div>
              <span className="text-[0.7rem] text-white/60">Gemini</span>
            </button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
