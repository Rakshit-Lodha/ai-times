"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import StoryCard, { type Article } from "@/components/StoryCard";

type DeckItem =
  | { kind: "intro"; id: string }
  | { kind: "article"; id: number; article: Article };

type SwipeReaction = "like" | "skip" | null;

const SWIPE_THRESHOLD = 110;
const ANIMATION_MS = 190;

function IntroCard({
  onStart,
  isStarting,
  firstArticle
}: {
  onStart: () => void;
  isStarting: boolean;
  firstArticle?: Article;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 180),
      window.setTimeout(() => setPhase(2), 1500),
      window.setTimeout(() => setPhase(3), 2600),
      window.setTimeout(() => setPhase(4), 4300),
      window.setTimeout(() => setPhase(5), 6000),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // More bouncy swipe animation
  const demoTransform =
    phase === 3
      ? "translateX(85px) rotate(12deg) scale(1.02)"
      : phase === 4
        ? "translateX(-85px) rotate(-12deg) scale(1.02)"
        : "translateX(0px) rotate(0deg) scale(1)";

  // Glow color based on swipe direction
  const glowColor =
    phase === 3
      ? "0 0 60px rgba(34, 197, 94, 0.4), 0 0 100px rgba(34, 197, 94, 0.2)"
      : phase === 4
        ? "0 0 60px rgba(239, 68, 68, 0.4), 0 0 100px rgba(239, 68, 68, 0.2)"
        : "0 14px 30px rgba(0,0,0,0.52)";

  const guideText =
    phase === 3
      ? "Swipe right if you like it"
      : phase === 4
        ? "Swipe left if you don't"
        : phase >= 5
          ? "Ready? Start swiping."
          : "";

  // Show emoji during demo swipe
  const showLikeEmoji = phase === 3;
  const showSkipEmoji = phase === 4;

  return (
    <article
      className="relative flex min-h-[72vh] flex-col overflow-hidden rounded-3xl border border-white/10 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.58)] md:min-h-[720px] md:p-8"
      style={{
        background: "linear-gradient(135deg, #0f1729 0%, #0a0f1a 50%, #050508 100%)",
      }}
    >
      {/* Animated breathing gradient orbs */}
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl"
        style={{
          animation: "breathe 4s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl"
        style={{
          animation: "breathe 4s ease-in-out infinite 1s",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"
        style={{
          animation: "breathe 4s ease-in-out infinite 2s",
        }}
      />

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p
          className={`text-xl font-medium text-white/70 transition-all duration-500 ${
            phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          Introducing
        </p>

        {/* KRUX Logo with shimmer effect */}
        <h2
          className={`relative mt-4 text-6xl font-black tracking-tight transition-all duration-500 md:text-7xl ${
            phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{
            background: "linear-gradient(90deg, #ffffff 0%, #ffffff 40%, #fbbf24 50%, #ffffff 60%, #ffffff 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: phase >= 1 ? "shimmer 3s ease-in-out infinite" : "none",
          }}
        >
          KRUX<span style={{ WebkitTextFillColor: "#f97316" }}>.</span>
        </h2>

        <p
          className={`mt-3 text-[1.05rem] text-white/60 transition-all duration-500 md:text-[1.12rem] ${
            phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Everything about AI in 100 words
        </p>

        {/* Demo Card Container */}
        <div
          className={`relative w-full transition-all duration-500 ${
            phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
          style={{ marginTop: "56px", maxWidth: "340px" }}
        >
          {/* Emoji reactions during demo */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            style={{
              opacity: showLikeEmoji ? 1 : 0,
              transform: showLikeEmoji ? "scale(1)" : "scale(0.5)",
              transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <span className="text-6xl">❤️</span>
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            style={{
              opacity: showSkipEmoji ? 1 : 0,
              transform: showSkipEmoji ? "scale(1)" : "scale(0.5)",
              transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <span className="text-6xl">💔</span>
          </div>

          {/* Demo Card */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]"
            style={{
              transform: demoTransform,
              transition: "all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: glowColor,
            }}
          >
            {/* Image area */}
            <div className="relative h-32 w-full overflow-hidden">
              {firstArticle?.image_url ? (
                <>
                  <Image
                    src={firstArticle.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    style={{ filter: "blur(2px) brightness(0.8)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
                </>
              ) : (
                <>
                  <div className="h-full w-full bg-gradient-to-br from-orange-500/30 to-blue-500/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
                </>
              )}

              {/* LIKE/SKIP badges */}
              <div
                className="absolute left-3 top-3 rounded-lg bg-emerald-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{
                  opacity: phase === 3 ? 1 : 0,
                  transition: "opacity 300ms ease",
                }}
              >
                LIKE
              </div>
              <div
                className="absolute right-3 top-3 rounded-lg bg-red-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{
                  opacity: phase === 4 ? 1 : 0,
                  transition: "opacity 300ms ease",
                }}
              >
                SKIP
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "12px 14px 16px" }}>
              <h3 className="text-[0.95rem] font-semibold leading-snug text-white">
                {firstArticle?.headline || "OpenAI Launches Live Voice Agents for Teams"}
              </h3>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-white/50">
                {firstArticle
                  ? firstArticle.output?.split(" ").slice(0, 15).join(" ") + "..."
                  : "ChatGPT now runs autonomous task flows for meetings, docs, and follow-ups..."}
              </p>
            </div>
          </div>
        </div>

        {/* Guide text */}
        <p
          className={`mt-6 min-h-[28px] text-[1rem] font-semibold transition-all duration-300 ${
            phase >= 3 ? "opacity-100" : "opacity-0"
          } ${phase === 3 ? "text-emerald-400" : ""} ${phase === 4 ? "text-red-400" : ""} ${phase >= 5 ? "text-white/80" : ""}`}
        >
          {guideText}
        </p>
      </div>

      {/* CTA Button */}
      <div style={{ marginTop: "20px", marginBottom: "24px", display: "flex", justifyContent: "center" }}>
        {phase >= 5 ? (
          <button
            onClick={onStart}
            disabled={isStarting}
            className="group relative mx-auto flex h-[52px] w-[75%] items-center justify-center overflow-hidden rounded-full border border-orange-400/30 text-[1rem] font-bold text-white transition-all hover:scale-[1.02] hover:border-orange-400/50 disabled:cursor-not-allowed disabled:opacity-80"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.1) 100%)",
              boxShadow: "0 0 30px rgba(249,115,22,0.2)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{
                animation: "shine 2s ease-in-out infinite",
              }}
            />
            <span className="relative flex items-center gap-2">
              {isStarting ? "Loading..." : "Start Swiping"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
        ) : (
          <div className="h-[52px]" />
        )}
      </div>
    </article>
  );
}

export default function SwipeDeck({ articles, startIndex }: { articles: Article[]; startIndex?: number }) {
  // Infinite scroll state
  const [loadedArticles, setLoadedArticles] = useState<Article[]>(articles);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const deck = useMemo<DeckItem[]>(() => {
    const storyCards = loadedArticles.map((article) => ({ kind: "article" as const, id: article.id, article }));
    return [{ kind: "intro", id: "intro" }, ...storyCards];
  }, [loadedArticles]);

  // If coming from a shared link, start at that card (skip intro)
  const [index, setIndex] = useState(startIndex ?? 0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [reaction, setReaction] = useState<SwipeReaction>(null);
  const [isStartingIntro, setIsStartingIntro] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(!!startIndex);
  const pointerStart = useRef<number | null>(null);

  // Fetch more articles when approaching the end
  useEffect(() => {
    const remainingCards = deck.length - index - 1;

    if (remainingCards <= 5 && hasMore && !loadingRef.current) {
      loadingRef.current = true;
      setIsLoadingMore(true);

      fetch(`/api/articles?offset=${loadedArticles.length}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.articles?.length > 0) {
            // Deduplicate by article ID
            setLoadedArticles((prev) => {
              const existingIds = new Set(prev.map((a) => a.id));
              const newArticles = data.articles.filter(
                (a: Article) => !existingIds.has(a.id)
              );
              return [...prev, ...newArticles];
            });
          }
          setHasMore(data.hasMore ?? false);
        })
        .catch(() => {})
        .finally(() => {
          setIsLoadingMore(false);
          loadingRef.current = false;
        });
    }
  }, [index, deck.length, hasMore, loadedArticles.length]);

  // Hide swipe hint after first interaction or after 4 seconds
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => setShowSwipeHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  const active = deck[index];
  const isIntroActive = active?.kind === "intro";

  const commitSwipe = useCallback(
    (direction: -1 | 1) => {
      if (!active || isExiting) return;

      // Track swipe (fire-and-forget, non-blocking)
      if (active.kind === "article") {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId: active.article.id,
            reaction: direction > 0 ? "like" : "skip",
          }),
        }).catch(() => {}); // Silently ignore errors
      }

      setReaction(direction > 0 ? "like" : "skip");
      setIsExiting(true);
      setDragX(direction * 520);

      window.setTimeout(() => {
        // Disable transition before resetting
        setIsResetting(true);
        setIndex((prev) => prev + 1);
        setDragX(0);
        setReaction(null);
        setIsExiting(false);
        setIsStartingIntro(false);

        // Re-enable transition after a brief moment
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsResetting(false);
          });
        });
      }, ANIMATION_MS);
    },
    [active, isExiting],
  );

  const startFromIntro = () => {
    if (!isIntroActive || isStartingIntro) return;
    setIsStartingIntro(true);
    window.setTimeout(() => commitSwipe(1), 140);
  };

  const goBack = useCallback(() => {
    if (index <= 1 || isExiting) return; // Can't go back to intro or before
    setIndex((prev) => prev - 1);
  }, [index, isExiting]);

  const canGoBack = index > 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") commitSwipe(-1);
      if (event.key === "ArrowRight") commitSwipe(1);
      if (event.key === "ArrowUp") goBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commitSwipe, goBack]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isExiting) return;
    pointerStart.current = event.clientX;
    setIsDragging(true);
    setShowSwipeHint(false); // Hide hint on first interaction
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerStart.current === null) return;
    setDragX(event.clientX - pointerStart.current);
  };

  const onPointerUp = () => {
    setIsDragging(false);

    if (Math.abs(dragX) >= SWIPE_THRESHOLD) {
      commitSwipe(dragX > 0 ? 1 : -1);
      return;
    }

    setReaction(null);
    setDragX(0);
    pointerStart.current = null;
  };

  if (!deck.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <p className="font-mono text-sm text-white/60">No stories yet.</p>
      </main>
    );
  }

  const liveReaction: SwipeReaction = dragX > 20 ? "like" : dragX < -20 ? "skip" : reaction;
  const reactionOpacity = Math.min(Math.abs(dragX) / 140, 1);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <style>{`
        @keyframes kruxCtaGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.2); }
          50% { box-shadow: 0 0 40px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.2); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
        @keyframes swipe-hint-left {
          0%, 100% { transform: translateX(0); opacity: 0.6; }
          50% { transform: translateX(-12px); opacity: 1; }
        }
        @keyframes swipe-hint-right {
          0%, 100% { transform: translateX(0); opacity: 0.6; }
          50% { transform: translateX(12px); opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Full-screen swipe area */}
      <section className="relative min-h-screen w-full">
        {active && (
          <div
            className="relative z-10 min-h-screen w-full"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)`,
              transition: (isDragging || isResetting) ? "none" : `transform ${ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              touchAction: "pan-y",
            }}
          >
            {active.kind === "intro" ? (
              <div className="flex min-h-screen items-center justify-center px-4">
                <IntroCard onStart={startFromIntro} isStarting={isStartingIntro} firstArticle={loadedArticles[0]} />
              </div>
            ) : (
              <StoryCard article={active.article} isPriority={index <= 1} onUndo={goBack} canUndo={canGoBack} />
            )}

            {/* LIKE badge */}
            <div
              className="pointer-events-none absolute left-4 top-4 z-30 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide text-white shadow-lg"
              style={{ opacity: dragX > 20 ? Math.min(dragX / 90, 1) : 0 }}
            >
              LIKE
            </div>

            {/* SKIP badge */}
            <div
              className="pointer-events-none absolute right-4 top-4 z-30 rounded-lg bg-red-500/90 px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide text-white shadow-lg"
              style={{ opacity: dragX < -20 ? Math.min(Math.abs(dragX) / 90, 1) : 0 }}
            >
              SKIP
            </div>
          </div>
        )}

        {/* Reaction emoji overlay */}
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
          {liveReaction === "like" && (
            <div
              className="select-none text-8xl transition-all duration-100"
              style={{ opacity: Math.max(reactionOpacity, reaction ? 0.9 : 0), transform: `scale(${1 + reactionOpacity * 0.15})` }}
            >
              ❤️
            </div>
          )}
          {liveReaction === "skip" && (
            <div
              className="select-none text-8xl transition-all duration-100"
              style={{ opacity: Math.max(reactionOpacity, reaction ? 0.9 : 0), transform: `scale(${1 + reactionOpacity * 0.15})` }}
            >
              💔
            </div>
          )}
        </div>

        {/* Swipe hint overlay for shared links */}
        {showSwipeHint && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex flex-col items-center justify-center gap-3"
            style={{ animation: "fade-in-up 400ms ease-out" }}
            onClick={() => setShowSwipeHint(false)}
          >
            <div className="flex items-center gap-8">
              {/* Left arrow */}
              <div
                className="flex items-center gap-1 text-white/70"
                style={{ animation: "swipe-hint-left 1.2s ease-in-out infinite" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span className="text-sm font-medium">Skip</span>
              </div>

              {/* Swipe indicator pill */}
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-sm font-medium text-white/80">Swipe to navigate</span>
              </div>

              {/* Right arrow */}
              <div
                className="flex items-center gap-1 text-white/70"
                style={{ animation: "swipe-hint-right 1.2s ease-in-out infinite" }}
              >
                <span className="text-sm font-medium">Like</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Preload next 3 images - must match StoryCard's image config */}
      <div className="pointer-events-none fixed left-0 top-0 -z-50 h-0 w-full overflow-hidden opacity-0">
        {deck.slice(index + 1, index + 4).map((item, idx) => {
          if (item.kind === "article" && item.article.image_url) {
            return (
              <div key={`preload-${index}-${idx}-${item.id}`} className="relative aspect-[3/2] w-full">
                <Image
                  src={item.article.image_url}
                  alt=""
                  fill
                  sizes="100vw"
                  priority
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </main>
  );
}
