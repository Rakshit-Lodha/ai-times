"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProgressDots from "@/components/ProgressDots";
import { useCourseProgress } from "@/lib/useProgress";
import { type LearnCourse, type LearnSubtopic, type LearnCard, getNextSubtopic } from "@/lib/learn-data";

type CardReaderProps = {
  course: LearnCourse;
  subtopic: LearnSubtopic;
  basePath?: string;
};

function CompletionView({
  course,
  subtopic,
  basePath,
}: {
  course: LearnCourse;
  subtopic: LearnSubtopic;
  basePath: string;
}) {
  const next = getNextSubtopic(course, subtopic.position);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mt-6 text-[1.3rem] font-bold text-white">Topic Complete!</h2>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-white/55">
        {subtopic.learningOutcome}
      </p>

      <div className="mt-10 flex w-full max-w-[280px] flex-col gap-3">
        {next && (
          <Link
            href={`${basePath}/${course.slug}/${next.slug}`}
            className="flex h-[50px] items-center justify-center rounded-2xl bg-orange-500 text-[0.95rem] font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Next: {next.title}
          </Link>
        )}
        <Link
          href={`${basePath}/${course.slug}`}
          className="flex h-[50px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-[0.95rem] font-semibold text-white/80 transition-all hover:bg-white/10 active:scale-[0.98]"
        >
          Back to Course
        </Link>
      </div>
    </div>
  );
}

export default function CardReader({ course, subtopic, basePath = "/learn-v1-test" }: CardReaderProps) {
  const router = useRouter();
  const [cardIndex, setCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { markCardComplete, markSubtopicComplete } = useCourseProgress(course.slug);

  const cards = subtopic.cards;
  const isComplete = cardIndex >= cards.length;
  const currentCard: LearnCard | undefined = cards[cardIndex];

  // Mark subtopic complete when user reaches the end
  useEffect(() => {
    if (isComplete) {
      markSubtopicComplete(subtopic.id);
    }
  }, [isComplete, subtopic.id, markSubtopicComplete]);

  const handleContinue = () => {
    if (!currentCard) return;
    markCardComplete(currentCard.id);
    setDirection(1);
    setCardIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (cardIndex <= 0) return;
    setDirection(-1);
    setCardIndex((prev) => prev - 1);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#080808] text-white">
      {/* Top bar */}
      <div
        className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-3 px-4"
        style={{
          background: "linear-gradient(to bottom, rgba(8,8,8,0.97), rgba(8,8,8,0.88))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => router.push(`${basePath}/${course.slug}`)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20 active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="flex-1 truncate text-center text-[0.85rem] font-semibold text-white/80">
          {subtopic.title}
        </span>

        <Link
          href={basePath}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20 active:scale-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {/* Progress dots */}
      <div className="shrink-0 py-3">
        <ProgressDots total={cards.length} current={cardIndex} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <CompletionView course={course} subtopic={subtopic} basePath={basePath} />
            </motion.div>
          ) : currentCard ? (
            <motion.div
              key={currentCard.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-1 flex-col"
            >
              {/* Scrollable card content */}
              <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4 md:px-8">
                <div className="mx-auto max-w-[540px]">
                  <h2 className="text-[1.4rem] font-bold leading-tight tracking-[-0.02em] text-white">
                    {currentCard.headline}
                  </h2>
                  <p
                    className="mt-6 text-[1.05rem] leading-[1.85] text-white/75"
                    style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                  >
                    {currentCard.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      {!isComplete && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#080808]/95 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[560px] gap-3">
            {cardIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 transition-all hover:bg-white/10 active:scale-[0.95]"
                aria-label="Previous card"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button
              onClick={handleContinue}
              className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 text-[0.95rem] font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              {cardIndex === cards.length - 1 ? "Finish" : "Continue"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
