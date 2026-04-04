"use client";

import Link from "next/link";
import { useCourseProgress } from "@/lib/useProgress";
import { type LearnCourse } from "@/lib/learn-data";

export default function CourseDetail({ course, basePath = "/learn-v1-test" }: { course: LearnCourse; basePath?: string }) {
  const { isSubtopicComplete, completedSubtopicCount } = useCourseProgress(course.slug);

  const firstIncomplete = course.subtopics.find((s) => !isSubtopicComplete(s.id));
  const ctaSubtopic = firstIncomplete || course.subtopics[0];
  const hasStarted = completedSubtopicCount > 0;
  const isComplete = completedSubtopicCount === course.subtopicCount;

  return (
    <div className="min-h-[100dvh] bg-[#080808] text-white">
      {/* Cover */}
      <div
        className="relative h-[220px] w-full"
        style={{ background: course.coverGradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

        {/* Back button */}
        <Link
          href={basePath}
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-all hover:bg-black/50 active:scale-90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Emoji */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <span className="text-5xl">{course.emoji}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[560px] px-5 pb-32">
        {/* Title */}
        <h1 className="mt-4 text-center text-[1.5rem] font-bold leading-tight">
          {course.title}
        </h1>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[0.75rem] font-medium text-white/60">
            {course.subtopicCount} topics
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[0.75rem] font-medium text-white/60">
            {course.cardCount} cards
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[0.75rem] font-medium text-white/60">
            ~{course.estMinutes} min
          </span>
        </div>

        {/* Progress */}
        {hasStarted && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: `${(completedSubtopicCount / course.subtopicCount) * 100}%` }}
              />
            </div>
            <span className="text-[0.75rem] text-white/50">
              {completedSubtopicCount}/{course.subtopicCount}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="mt-6 text-[0.95rem] leading-relaxed text-white/65">
          {course.description}
        </p>

        {/* Topics */}
        <div className="mt-8">
          <h2 className="text-[0.85rem] font-semibold uppercase tracking-wider text-white/40">
            Topics
          </h2>

          <div className="mt-4 space-y-2">
            {course.subtopics.map((subtopic) => {
              const done = isSubtopicComplete(subtopic.id);
              return (
                <Link
                  key={subtopic.id}
                  href={`${basePath}/${course.slug}/${subtopic.slug}`}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all active:scale-[0.98] ${
                    done
                      ? "border-white/5 bg-white/[0.03]"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
                >
                  {/* Position / checkmark */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-bold ${
                    done
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-white/10 text-white/50"
                  }`}>
                    {done ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      subtopic.position
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-[0.9rem] font-medium leading-snug ${done ? "text-white/50" : "text-white/90"}`}>
                      {subtopic.title}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] text-white/35">
                      {subtopic.cardCount} cards · {subtopic.estMinutes} min
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/25">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Generate Voice Files CTA — shown when course is complete */}
        {isComplete && (
          <div className="mt-10">
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
              <div className="text-center">
                <span className="text-3xl">⚡</span>
                <h3 className="mt-3 text-[1.1rem] font-bold text-white">
                  Generate Your Voice Files
                </h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-white/55">
                  Put what you learned into action. We&apos;ll analyze your LinkedIn
                  posts and generate all 4 files you need — voice profile, banned
                  phrases, project instructions, and best posts collection.
                </p>
                <Link
                  href={`${basePath}/${course.slug}/generate`}
                  className="mt-5 inline-flex h-[50px] items-center justify-center rounded-2xl bg-orange-500 px-8 text-[0.95rem] font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
                >
                  Generate My Voice Files
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#080808]/95 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 backdrop-blur-xl">
        <div className="mx-auto max-w-[560px]">
          {!isComplete && ctaSubtopic && (
            <>
              <p className="mb-2 text-center text-[0.75rem] text-white/40">
                {hasStarted ? `Up next: ${ctaSubtopic.title}` : `Start with: ${ctaSubtopic.title}`}
              </p>
              <Link
                href={`${basePath}/${course.slug}/${ctaSubtopic.slug}`}
                className="flex h-[50px] w-full items-center justify-center rounded-2xl bg-orange-500 text-[0.95rem] font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
              >
                {hasStarted ? "Continue Learning" : "Start Learning"}
              </Link>
            </>
          )}
          {isComplete && (
            <Link
              href={`${basePath}/${course.slug}/generate`}
              className="flex h-[50px] w-full items-center justify-center rounded-2xl bg-orange-500 text-[0.95rem] font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              Generate My Voice Files
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
