"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import StoryCard, { type Article } from "@/components/StoryCard";

type DeckItem =
  | { kind: "intro"; id: string }
  | { kind: "article"; id: number; article: Article };

type SwipeReaction = "like" | "skip" | null;

const SWIPE_THRESHOLD = 90;

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

  const demoTransform =
    phase === 3
      ? "translateX(85px) rotate(12deg) scale(1.02)"
      : phase === 4
        ? "translateX(-85px) rotate(-12deg) scale(1.02)"
        : "translateX(0px) rotate(0deg) scale(1)";

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

  const showLikeEmoji = phase === 3;
  const showSkipEmoji = phase === 4;

  return (
    <article
      className="relative flex min-h-[72vh] flex-col overflow-hidden rounded-3xl border border-white/10 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.58)] md:min-h-[720px] md:p-8"
      style={{
        background: "linear-gradient(135deg, #0f1729 0%, #0a0f1a 50%, #050508 100%)",
      }}
    >
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
          className={`text-xl font-medium text-white/70 transition-all duration-500 ${phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
        >
          Introducing
        </p>

        <h2
          className={`relative mt-4 text-6xl font-black tracking-tight transition-all duration-500 md:text-7xl ${phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
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
          className={`mt-3 text-[1.05rem] text-white/60 transition-all duration-500 md:text-[1.12rem] ${phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
        >
          Everything about AI in 100 words
        </p>

        <div
          className={`relative w-full transition-all duration-500 ${phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          style={{ marginTop: "56px", maxWidth: "340px" }}
        >
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

          <div
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]"
            style={{
              transform: demoTransform,
              transition: "all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: glowColor,
            }}
          >
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

        <p
          className={`mt-6 min-h-[28px] text-[1rem] font-semibold transition-all duration-300 ${phase >= 3 ? "opacity-100" : "opacity-0"
            } ${phase === 3 ? "text-emerald-400" : ""} ${phase === 4 ? "text-red-400" : ""} ${phase >= 5 ? "text-white/80" : ""}`}
        >
          {guideText}
        </p>
      </div>

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
                <path d="M5 12h14M12 5l7 7-7 7" />
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
  const [loadedArticles, setLoadedArticles] = useState<Article[]>(articles);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const deck = useMemo<DeckItem[]>(() => {
    const storyCards = loadedArticles.map((article) => ({ kind: "article" as const, id: article.id, article }));
    return [{ kind: "intro", id: "intro" }, ...storyCards];
  }, [loadedArticles]);

  const [index, setIndex] = useState(startIndex ?? 0);
  const [isStartingIntro, setIsStartingIntro] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(!!startIndex);
  const [draggedAway, setDraggedAway] = useState(false);

  // Framer Motion shared gesture values
  const x = useMotionValue(0);
  const rotation = useTransform(x, [-200, 200], [-10, 10]);

  // Opacity for the overlays based strictly on standard card swipe thresholds
  const likeOpacity = useTransform(x, [10, SWIPE_THRESHOLD], [0, 1]);
  const skipOpacity = useTransform(x, [-10, -SWIPE_THRESHOLD], [0, 1]);

  // Transform values for the *next* card waiting in the background
  const nextCardScale = useTransform(x, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [1, 0.94, 1]);
  const nextCardY = useTransform(x, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [0, 20, 0]);
  const nextCardFilter = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    ["brightness(1)", "brightness(0.75)", "brightness(1)"]
  );

  // Haptic feedback locking to prevent buzzing multiple times per drag session
  const hasVibratedRef = useRef(false);

  useEffect(() => {
    return x.onChange((latest) => {
      const isPastThreshold = Math.abs(latest) >= SWIPE_THRESHOLD;
      if (isPastThreshold && !hasVibratedRef.current) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([10]); // Quick haptic tap
        }
        hasVibratedRef.current = true;
      } else if (!isPastThreshold && hasVibratedRef.current) {
        hasVibratedRef.current = false;
      }
    });
  }, [x]);

  useEffect(() => {
    const remainingCards = deck.length - index - 1;
    if (remainingCards <= 5 && hasMore && !loadingRef.current) {
      loadingRef.current = true;

      fetch(`/api/articles?offset=${loadedArticles.length}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.articles?.length > 0) {
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
        .catch(() => { })
        .finally(() => {
          loadingRef.current = false;
        });
    }
  }, [index, deck.length, hasMore, loadedArticles.length]);

  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => setShowSwipeHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  const active = deck[index];
  const next = deck[index + 1];

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 800) {
      setDraggedAway(true);
      const isRight = offset > 0 || velocity > 800;

      if (active && active.kind === "article") {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId: active.article.id,
            reaction: isRight ? "like" : "skip",
          }),
        }).catch(() => { });
      }

      await animate(x, isRight ? 400 : -400, {
        stiffness: 200,
        damping: 20,
      });

      setIndex((prev) => prev + 1);
      x.set(0);
      setDraggedAway(false);
      setIsStartingIntro(false);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    }
  };

  const manualSwipe = useCallback(async (direction: 1 | -1) => {
    if (draggedAway || !active) return;
    setDraggedAway(true);

    if (active && active.kind === "article") {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: active.article.id,
          reaction: direction > 0 ? "like" : "skip",
        }),
      }).catch(() => { });
    }

    await animate(x, direction * 400, {
      stiffness: 200,
      damping: 20,
    });

    setIndex((prev) => prev + 1);
    x.set(0);
    setDraggedAway(false);
    setIsStartingIntro(false);
  }, [draggedAway, active, x]);

  const startFromIntro = useCallback(() => {
    if (active?.kind !== "intro" || isStartingIntro) return;
    setIsStartingIntro(true);
    manualSwipe(1);
  }, [active, isStartingIntro, manualSwipe]);

  const goBack = useCallback(() => {
    if (index <= 1 || draggedAway) return;
    setIndex((prev) => prev - 1);
  }, [index, draggedAway]);

  const canGoBack = index > 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") manualSwipe(-1);
      if (event.key === "ArrowRight") manualSwipe(1);
      if (event.key === "ArrowUp") goBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [manualSwipe, goBack]);

  if (!deck.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <p className="font-mono text-sm text-white/60">No stories yet.</p>
      </main>
    );
  }

  // Next card render beneath the current card
  const renderCoreCard = (item: DeckItem, isNext?: boolean) => {
    if (item.kind === "intro") {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 md:min-h-[85vh]">
          <IntroCard onStart={startFromIntro} isStarting={isStartingIntro} firstArticle={loadedArticles[0]} />
        </div>
      );
    }
    return <StoryCard article={item.article} isPriority={index <= 1} onUndo={!isNext ? goBack : undefined} canUndo={canGoBack} />;
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white md:flex md:items-center md:justify-center">
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

      <div className="w-full md:max-w-[480px] md:my-4 md:rounded-3xl md:border md:border-white/10 md:shadow-2xl md:overflow-hidden relative min-h-screen md:min-h-[85vh]">

        {/* Render Cards (Next and Active) */}
        {[next, active].map((item) => {
          if (!item) return null;
          const isTop = item.id === active?.id;

          return (
            <motion.div
              key={item.id}
              className={`absolute inset-0 min-h-screen w-full md:min-h-[85vh] origin-bottom touch-pan-y ${isTop ? "z-10" : "z-0 select-none shadow-2xl"
                }`}
              drag={isTop && !draggedAway ? "x" : false}
              dragConstraints={isTop ? { left: 0, right: 0 } : undefined}
              dragElastic={isTop ? 1 : undefined}
              style={
                isTop
                  ? { x, rotate: rotation }
                  : { scale: nextCardScale, y: nextCardY, filter: nextCardFilter }
              }
              onDragEnd={isTop && !draggedAway ? handleDragEnd : undefined}
              onPointerDown={isTop ? () => setShowSwipeHint(false) : undefined}
              whileTap={isTop ? { cursor: "grabbing" } : undefined}
            >
              {renderCoreCard(item, !isTop)}

              {isTop && (
                <>
                  {/* LIKE badge styling mapping directly to X drag */}
                  <motion.div
                    className="pointer-events-none absolute left-6 top-6 z-30 rounded-xl border-4 border-emerald-500 text-[2rem] font-bold tracking-widest text-emerald-500 shadow-2xl"
                    style={{
                      opacity: likeOpacity,
                      rotate: "-15deg",
                      transformOrigin: "top left",
                      boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    <div className="bg-emerald-500/10 px-6 py-2 backdrop-blur-md">LIKE</div>
                  </motion.div>

                  {/* SKIP badge styling mapping directly to X drag */}
                  <motion.div
                    className="pointer-events-none absolute right-6 top-6 z-30 rounded-xl border-4 border-red-500 text-[2rem] font-bold tracking-widest text-red-500 shadow-2xl"
                    style={{
                      opacity: skipOpacity,
                      rotate: "15deg",
                      transformOrigin: "top right",
                      boxShadow: "0 0 40px rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    <div className="bg-red-500/10 px-6 py-2 backdrop-blur-md">SKIP</div>
                  </motion.div>
                </>
              )}
            </motion.div>
          );
        })}

        {showSwipeHint && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex flex-col items-center justify-center gap-3"
            style={{ animation: "fade-in-up 400ms ease-out" }}
            onClick={() => setShowSwipeHint(false)}
          >
            <div className="flex items-center gap-8">
              <div
                className="flex items-center gap-1 text-white/70"
                style={{ animation: "swipe-hint-left 1.2s ease-in-out infinite" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Skip</span>
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-sm font-medium text-white/80">Swipe to navigate</span>
              </div>
              <div
                className="flex items-center gap-1 text-white/70"
                style={{ animation: "swipe-hint-right 1.2s ease-in-out infinite" }}
              >
                <span className="text-sm font-medium">Like</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

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
