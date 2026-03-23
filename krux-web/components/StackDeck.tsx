"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import StoryCard, { type Article } from "@/components/StoryCard";
import Link from "next/link";

export type StackCard = {
  id: number;
  position: number;
  headline: string;
  output: string;
  image_url: string | null;
};

type StackDeckProps = {
  stack: { title: string; slug: string; emoji: string };
  cards: StackCard[];
};

const SWIPE_THRESHOLD = 90;

function CompletionScreen({ stack, onRestart }: { stack: StackDeckProps["stack"]; onRestart: () => void }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center px-8 text-center"
      style={{
        background: "linear-gradient(135deg, #0f1729 0%, #0a0f1a 50%, #050508 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl"
        style={{ animation: "breathe 4s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"
        style={{ animation: "breathe 4s ease-in-out infinite 1s" }}
      />

      <span className="text-5xl">{stack.emoji}</span>
      <h2 className="mt-6 text-2xl font-bold text-white">Stack Complete!</h2>
      <p className="mt-3 text-[1rem] text-white/60">
        You&apos;ve finished <span className="text-white/90">{stack.title}</span>
      </p>

      <div className="mt-10 flex flex-col gap-3 w-full max-w-[280px]">
        <button
          onClick={onRestart}
          className="flex h-[48px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-[0.95rem] font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
        >
          Restart Stack
        </button>
        <Link
          href="/"
          className="flex h-[48px] items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-[0.95rem] font-semibold text-orange-400 transition-all hover:bg-orange-500/20 active:scale-95"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function StackDeck({ stack, cards }: StackDeckProps) {
  const [index, setIndex] = useState(0);
  const [draggedAway, setDraggedAway] = useState(false);

  const x = useMotionValue(0);
  const rotation = useTransform(x, [-200, 200], [-10, 10]);
  const likeOpacity = useTransform(x, [10, SWIPE_THRESHOLD], [0, 1]);
  const skipOpacity = useTransform(x, [-10, -SWIPE_THRESHOLD], [0, 1]);
  const nextCardScale = useTransform(x, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [1, 0.94, 1]);
  const nextCardY = useTransform(x, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], [0, 20, 0]);
  const nextCardFilter = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    ["brightness(1)", "brightness(0.75)", "brightness(1)"]
  );

  const hasVibratedRef = useRef(false);

  useEffect(() => {
    return x.onChange((latest) => {
      const isPastThreshold = Math.abs(latest) >= SWIPE_THRESHOLD;
      if (isPastThreshold && !hasVibratedRef.current) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([10]);
        }
        hasVibratedRef.current = true;
      } else if (!isPastThreshold && hasVibratedRef.current) {
        hasVibratedRef.current = false;
      }
    });
  }, [x]);

  const isComplete = index >= cards.length;
  const active = cards[index];
  const next = cards[index + 1];

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const isDesktop = window.innerWidth >= 768;
    const dragThreshold = isDesktop ? 60 : SWIPE_THRESHOLD;

    if (Math.abs(offset) > dragThreshold || Math.abs(velocity) > 800) {
      setDraggedAway(true);
      const isRight = offset > 0 || velocity > 800;

      await animate(x, isRight ? 400 : -400, {
        stiffness: 200,
        damping: 20,
      });

      setIndex((prev) => prev + 1);
      x.set(0);
      setDraggedAway(false);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    }
  };

  const manualSwipe = useCallback(async (direction: 1 | -1) => {
    if (draggedAway || isComplete) return;
    setDraggedAway(true);

    await animate(x, direction * 400, {
      stiffness: 200,
      damping: 20,
    });

    setIndex((prev) => prev + 1);
    x.set(0);
    setDraggedAway(false);
  }, [draggedAway, isComplete, x]);

  const goBack = useCallback(() => {
    if (index <= 0 || draggedAway) return;
    setIndex((prev) => prev - 1);
  }, [index, draggedAway]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") manualSwipe(-1);
      if (event.key === "ArrowRight") manualSwipe(1);
      if (event.key === "ArrowUp") goBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [manualSwipe, goBack]);

  const toArticle = (card: StackCard): Article => ({
    id: card.id,
    headline: card.headline,
    output: card.output,
    image_url: card.image_url,
  });

  return (
    <main className="fixed inset-0 w-full h-[100dvh] overflow-hidden overscroll-none bg-[#080808] text-white md:static md:min-h-screen md:flex md:items-center md:justify-center md:pt-[52px]">
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>

      {/* Header bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex h-[52px] items-center px-4"
        style={{
          background: "linear-gradient(to bottom, rgba(8,8,8,0.97), rgba(8,8,8,0.88))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20 active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex-1 text-center">
          <span className="text-[0.85rem] font-semibold text-white/80">
            {stack.emoji} {stack.title}
          </span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[0.8rem] font-medium text-white/50">
            {isComplete ? cards.length : index + 1}/{cards.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed top-[52px] left-0 right-0 z-50 h-[2px] bg-white/5">
        <div
          className="h-full bg-orange-500 transition-all duration-300 ease-out"
          style={{ width: `${((isComplete ? cards.length : index + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Desktop Left Button */}
      {!isComplete && (
        <button
          onClick={() => manualSwipe(-1)}
          className="hidden md:flex absolute left-[calc(50%-320px)] top-1/2 -translate-y-1/2 h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 backdrop-blur-md transition-all hover:bg-red-500/20 hover:text-red-500 hover:scale-110 active:scale-95 z-40 shadow-2xl"
          aria-label="Next Card"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Main Deck */}
      <div className="w-full mt-[54px] h-[calc(100dvh-54px)] md:max-w-[400px] lg:max-w-[480px] md:my-4 md:rounded-3xl md:border md:border-white/10 md:shadow-2xl md:overflow-hidden relative md:h-[85vh]">
        {isComplete ? (
          <CompletionScreen stack={stack} onRestart={() => setIndex(0)} />
        ) : (
          <>
            {[next, active].map((card) => {
              if (!card) return null;
              const isTop = card.id === active?.id;

              return (
                <motion.div
                  key={card.id}
                  className={`absolute inset-0 h-full w-full origin-bottom ${isTop ? "z-10" : "z-0 select-none shadow-2xl"}`}
                  drag={isTop && !draggedAway ? "x" : false}
                  dragElastic={0.7}
                  style={
                    isTop
                      ? { x, rotate: rotation, touchAction: "pan-y" }
                      : { scale: nextCardScale, y: nextCardY, filter: nextCardFilter }
                  }
                  onDragEnd={isTop && !draggedAway ? handleDragEnd : undefined}
                  whileTap={isTop ? { cursor: "grabbing" } : undefined}
                >
                  <StoryCard
                    article={toArticle(card)}
                    isPriority={index <= 1}
                    variant="learn"
                    positionLabel={`${card.position}/${cards.length}`}
                    onUndo={!isTop ? undefined : goBack}
                    canUndo={index > 0}
                  />

                  {isTop && (
                    <>
                      <motion.div
                        className="pointer-events-none absolute left-6 top-6 z-30 rounded-xl border-4 border-emerald-500 text-[2rem] font-bold tracking-widest text-emerald-500 shadow-2xl"
                        style={{
                          opacity: likeOpacity,
                          rotate: "-15deg",
                          transformOrigin: "top left",
                          boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)",
                        }}
                      >
                        <div className="bg-emerald-500/10 px-6 py-2 backdrop-blur-md">NEXT</div>
                      </motion.div>
                      <motion.div
                        className="pointer-events-none absolute right-6 top-6 z-30 rounded-xl border-4 border-red-500 text-[2rem] font-bold tracking-widest text-red-500 shadow-2xl"
                        style={{
                          opacity: skipOpacity,
                          rotate: "15deg",
                          transformOrigin: "top right",
                          boxShadow: "0 0 40px rgba(239, 68, 68, 0.4)",
                        }}
                      >
                        <div className="bg-red-500/10 px-6 py-2 backdrop-blur-md">NEXT</div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Desktop Right Button */}
      {!isComplete && (
        <button
          onClick={() => manualSwipe(1)}
          className="hidden md:flex absolute right-[calc(50%-320px)] top-1/2 -translate-y-1/2 h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:text-emerald-500 hover:scale-110 active:scale-95 z-40 shadow-2xl"
          aria-label="Next Card"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </main>
  );
}
