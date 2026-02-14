"use client";

import { useEffect, useRef, useState } from "react";
import StoryCard, { type Article } from "@/components/StoryCard";

const SWIPE_THRESHOLD = 110;
const ANIMATION_MS = 220;

export default function SwipeDeck({ articles }: { articles: Article[] }) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const active = articles[index];
  const upcoming = articles[index + 1];

  const commitSwipe = (direction: -1 | 1) => {
    if (!active || isExiting) return;

    setIsExiting(true);
    setDragX(direction * 520);

    window.setTimeout(() => {
      setIndex((prev) => prev + 1);
      setDragX(0);
      setIsExiting(false);
    }, ANIMATION_MS);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") commitSwipe(-1);
      if (event.key === "ArrowRight") commitSwipe(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isExiting) return;
    pointerStart.current = event.clientX;
    setIsDragging(true);
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

    setDragX(0);
    pointerStart.current = null;
  };

  if (!articles.length) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <p className="text-sm text-white/60 font-mono">No stories yet.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2f57_0%,_#0a0a0a_40%,_#030303_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060606]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[980px] items-center justify-between px-5 py-4">
          <h1 className="text-4xl font-black tracking-tight leading-none">KRUX<span className="text-orange-500">.</span></h1>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">AI & Tech in 100 words</p>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[980px] gap-8 px-4 pb-14 pt-7 md:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
        <div className="relative mx-auto w-full max-w-[560px]">
          {upcoming && (
            <div className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.98] rounded-3xl border border-white/10 bg-[#0f0f0f]/80" />
          )}

          {active && (
            <div
              className="relative z-10"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX / 24}deg)`,
                transition: isDragging ? "none" : `transform ${ANIMATION_MS}ms ease-out`,
                touchAction: "pan-y",
              }}
            >
              <StoryCard article={active} />

              <div
                className="pointer-events-none absolute left-5 top-5 rounded-md border border-emerald-400/70 bg-emerald-400/10 px-3 py-1 text-xs font-black tracking-[0.2em] text-emerald-300"
                style={{ opacity: dragX > 20 ? Math.min(dragX / 120, 1) : 0 }}
              >
                LIKE
              </div>

              <div
                className="pointer-events-none absolute right-5 top-5 rounded-md border border-red-400/70 bg-red-400/10 px-3 py-1 text-xs font-black tracking-[0.2em] text-red-300"
                style={{ opacity: dragX < -20 ? Math.min(Math.abs(dragX) / 120, 1) : 0 }}
              >
                SKIP
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              onClick={() => commitSwipe(-1)}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-mono uppercase tracking-[0.22em] text-white/75 transition hover:border-red-400/60 hover:text-red-300"
            >
              Skip
            </button>
            <button
              onClick={() => commitSwipe(1)}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-mono uppercase tracking-[0.22em] text-white/75 transition hover:border-emerald-400/60 hover:text-emerald-300"
            >
              Like
            </button>
          </div>
        </div>

        <aside className="hidden rounded-3xl border border-white/10 bg-black/30 p-6 md:block">
          <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-orange-400">How to use</p>
          <h2 className="mt-2 text-xl font-semibold">Swipe-first news feed</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Drag cards right to like and left to skip. You can also use keyboard arrows on desktop.
          </p>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.2em] text-white/40">
            Story {Math.min(index + 1, articles.length)} / {articles.length}
          </div>
        </aside>
      </section>
    </main>
  );
}
