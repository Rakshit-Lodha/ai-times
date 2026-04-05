"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ProgressDots from "@/components/ProgressDots";
import { useCourseProgress } from "@/lib/useProgress";
import {
  type LearnCard,
  type LearnCourse,
  type LearnSubtopic,
  getNextSubtopic,
} from "@/lib/learn-data";
import {
  CircleIconButton,
  CompletionHero,
  LearnViewport,
  NextStepCard,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/learn-ui";

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
    <div className="flex flex-1 flex-col justify-center gap-[18px] px-6 pb-8 pt-4">
      <CompletionHero
        title="Section complete"
        description="You finished this lesson. Continue when you're ready for the next section."
      />

      {next && (
        <NextStepCard
          title={next.title}
          description="Continue into the next lesson in the course flow."
        />
      )}

      <div className="flex flex-col gap-3">
        {next ? (
          <Link href={`${basePath}/${course.slug}/${next.slug}`} className={`${primaryButtonClass} flex w-full`}>
            Continue to next lesson
          </Link>
        ) : (
          <Link href={`${basePath}/${course.slug}/generate`} className={`${primaryButtonClass} flex w-full`}>
            Continue to implementation
          </Link>
        )}

        <Link href={`${basePath}/${course.slug}`} className={`${secondaryButtonClass} flex w-full`}>
          Back to course
        </Link>
      </div>
    </div>
  );
}

export default function CardReader({
  course,
  subtopic,
  basePath = "/learn-v1-test",
}: CardReaderProps) {
  const router = useRouter();
  const [cardIndex, setCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { markCardComplete, markSubtopicComplete } = useCourseProgress(course.slug);

  const cards = subtopic.cards;
  const isComplete = cardIndex >= cards.length;
  const currentCard: LearnCard | undefined = cards[cardIndex];

  useEffect(() => {
    if (isComplete) {
      markSubtopicComplete(subtopic.id);
    }
  }, [isComplete, markSubtopicComplete, subtopic.id]);

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
    <LearnViewport className="flex min-h-[100dvh] flex-col">
      <div className="flex items-center justify-between px-5 pt-8">
        <CircleIconButton onClick={() => router.push(`${basePath}/${course.slug}`)} label="Back to course">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </CircleIconButton>
        <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-sky-300">
          Chapter {subtopic.position} of {course.subtopicCount}
        </span>
      </div>

      <div className="pt-4">
        <ProgressDots total={cards.length} current={Math.min(cardIndex, cards.length - 1)} />
      </div>

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
              <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6">
                <div className="space-y-6">
                  <h2 className="text-[24px] font-bold leading-[1.08] tracking-[-0.03em] text-slate-50">
                    {currentCard.headline}
                  </h2>
                  <p
                    className="text-[17px] font-normal leading-[1.7] text-slate-200/88"
                    style={{ fontFamily: "var(--font-source-serif), serif" }}
                  >
                    {currentCard.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {!isComplete && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0B0B0BF2] px-5 pb-[max(env(safe-area-inset-bottom),38px)] pt-4 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[390px] gap-3">
            {cardIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-[50px] w-14 shrink-0 items-center justify-center rounded-[14px] border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 active:scale-[0.95]"
                aria-label="Previous card"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button type="button" onClick={handleContinue} className={`${primaryButtonClass} flex-1`}>
              {cardIndex === cards.length - 1 ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </LearnViewport>
  );
}
