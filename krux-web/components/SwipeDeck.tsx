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

function IntroCard({ onStart, isStarting }: { onStart: () => void; isStarting: boolean }) {
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
      ? "translateX(78px) rotate(10deg)"
      : phase === 4
        ? "translateX(-78px) rotate(-10deg)"
        : "translateX(0px) rotate(0deg)";

  const guideText =
    phase === 3
      ? "Swipe right if you like it"
      : phase === 4
        ? "Swipe left if you don't"
        : phase >= 5
          ? "Ready? Start swiping."
          : "";

  return (
    <article className="relative flex min-h-[72vh] flex-col overflow-hidden rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_50%_20%,#13254f_0%,#0a1021_36%,#050506_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.58)] md:min-h-[720px] md:p-8">
      <div className="pointer-events-none absolute -left-10 top-1/3 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 top-12 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p
          className={`text-2xl font-semibold text-white transition-all duration-500 ${
            phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          Introducing
        </p>

        <h2
          className={`mt-6 text-6xl font-black tracking-tight text-white transition-all duration-500 md:text-7xl ${
            phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          KRUX<span className="text-orange-500">.</span>
        </h2>

        <p
          className={`mt-3 text-[1.05rem] text-white/85 transition-all duration-500 md:text-[1.12rem] ${
            phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Everything about AI in 100 words
        </p>

        <div
          className={`w-full transition-all duration-500 ${
            phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
          style={{ marginTop: "72px", maxWidth: "380px" }}
        >
          <div
            className="overflow-hidden rounded-2xl border border-white/15 bg-[#070b13]/95 shadow-[0_14px_30px_rgba(0,0,0,0.52)]"
            style={{
              transform: demoTransform,
              transition: "transform 620ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="relative h-28 w-full overflow-hidden bg-[radial-gradient(circle_at_70%_35%,#f97316_0%,#f97316_20%,#1d4ed8_55%,#0b1020_100%)]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute left-3 top-3 rounded-md border border-white/20 bg-black/35 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-orange-300">
                Demo story
              </div>
            </div>

            <div className="p-3 text-left">
              <h3 className="text-[1rem] font-bold leading-5 text-white">OpenAI Launches Live Voice Agents for Teams</h3>
              <p className="mt-1.5 text-[0.83rem] leading-5 text-white/72">
                ChatGPT now runs autonomous task flows for meetings, docs, and follow-ups across enterprise tools.
              </p>
              <p className="mt-1.5 text-[0.82rem] italic leading-5 text-orange-300">
                This could make AI copilots feel like real digital teammates.
              </p>
            </div>
          </div>
        </div>

        <p
          className={`mt-5 min-h-[28px] text-[0.98rem] font-semibold transition-all duration-300 ${
            phase >= 3 ? "opacity-100" : "opacity-0"
          } ${phase === 3 ? "text-emerald-300" : ""} ${phase === 4 ? "text-red-300" : ""}`}
        >
          {guideText}
        </p>
      </div>

      <div style={{ marginTop: "24px", marginBottom: "28px", display: "flex", justifyContent: "center" }}>
      {phase >= 5 ? (
          <button
          onClick={onStart}
          disabled={isStarting}
          className="group relative mx-auto block w-[70%] h-[56px] overflow-hidden border px-8 text-center text-[1.05rem] font-bold text-[#1a0f00] transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-80 flex items-center justify-center"
          style={{
            borderRadius: "32px",
            borderColor: "#444444",
            background:
              "linear-gradient(180deg, #ffd966 0%, #f5b731 40%, #e89a1a 70%, #d4860f 100%)",
            backgroundSize: "220% 100%",
            animation: "kruxCtaGradient 2.8s linear infinite",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), 0 4px 12px rgba(245,158,11,0.25)",
          }}
        >
          <span className="absolute inset-x-0 top-0 h-[40%] rounded-full bg-gradient-to-b from-white/25 to-transparent" />
          <span className="absolute inset-y-0 -left-16 w-14 bg-white/25 blur-md transition group-hover:left-full group-hover:duration-700" />
          <span className="relative flex items-center justify-center gap-2">
            <span>{isStarting ? "Loading..." : "Start Swiping"}</span>
          </span>
        </button>
        ) : (
          <div className="h-[62px]" />
        )}
      </div>
    </article>
  );
}

export default function SwipeDeck({ articles }: { articles: Article[] }) {
  const deck = useMemo<DeckItem[]>(() => {
    const storyCards = articles.map((article) => ({ kind: "article" as const, id: article.id, article }));
    return [{ kind: "intro", id: "intro" }, ...storyCards];
  }, [articles]);

  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [reaction, setReaction] = useState<SwipeReaction>(null);
  const [isStartingIntro, setIsStartingIntro] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const active = deck[index];
  const upcoming = deck[index + 1];
  const isIntroActive = active?.kind === "intro";

  const commitSwipe = useCallback(
    (direction: -1 | 1) => {
      if (!active || isExiting) return;

      setReaction(direction > 0 ? "like" : "skip");
      setIsExiting(true);
      setDragX(direction * 520);

      window.setTimeout(() => {
        setIndex((prev) => prev + 1);
        setDragX(0);
        setReaction(null);
        setIsExiting(false);
        setIsStartingIntro(false);
      }, ANIMATION_MS);
    },
    [active, isExiting],
  );

  const startFromIntro = () => {
    if (!isIntroActive || isStartingIntro) return;
    setIsStartingIntro(true);
    window.setTimeout(() => commitSwipe(1), 140);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") commitSwipe(-1);
      if (event.key === "ArrowRight") commitSwipe(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commitSwipe]);

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1d2f5f_0%,_#0a0a0a_40%,_#020202_100%)] text-white">
      <style>{`
        @keyframes kruxCtaGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060606]/82 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[560px] items-center justify-between px-4 py-3">
          <h1 className="text-[3rem] font-black leading-none tracking-tight">
            KRUX<span className="text-orange-500">.</span>
          </h1>
        </div>
      </header>

      <section className="mx-auto flex w-full justify-center px-3 pb-12 pt-5">
        <div className="relative w-full max-w-[560px]">
          {upcoming && (
            <div className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.985] rounded-3xl border border-white/10 bg-[#0f0f0f]/70" />
          )}

          {active && (
            <div
              className="relative z-10"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX / 23}deg)`,
                transition: isDragging ? "none" : `transform ${ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                touchAction: "pan-y",
              }}
            >
              {active.kind === "intro" ? (
                <IntroCard onStart={startFromIntro} isStarting={isStartingIntro} />
              ) : (
                <StoryCard article={active.article} isPriority={index <= 1} />
              )}

              <div
                className="pointer-events-none absolute left-4 top-4 rounded-md border border-emerald-400/80 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300"
                style={{ opacity: dragX > 20 ? Math.min(dragX / 90, 1) : 0 }}
              >
                LIKE
              </div>

              <div
                className="pointer-events-none absolute right-4 top-4 rounded-md border border-red-400/80 bg-red-400/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-red-300"
                style={{ opacity: dragX < -20 ? Math.min(Math.abs(dragX) / 90, 1) : 0 }}
              >
                SKIP
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
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

        </div>
      </section>

      {/* Preload next 3 images */}
      <div className="hidden">
        {deck.slice(index + 1, index + 4).map((item) => {
          if (item.kind === "article" && item.article.image_url) {
            return (
              <Image
                key={`preload-${item.id}`}
                src={item.article.image_url}
                alt=""
                width={560}
                height={350}
                priority
              />
            );
          }
          return null;
        })}
      </div>
    </main>
  );
}
