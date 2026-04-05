"use client";

import Link from "next/link";
import { useCourseProgress } from "@/lib/useProgress";
import { type LearnCourse } from "@/lib/learn-data";
import {
  CircleIconButton,
  ImplementationCard,
  LessonRow,
  SummaryCard,
  LearnTopBar,
  LearnViewport,
  SectionLabel,
  primaryButtonClass,
} from "@/components/learn-ui";

export default function CourseDetail({
  course,
  basePath = "/learn-v1-test",
}: {
  course: LearnCourse;
  basePath?: string;
}) {
  const { isSubtopicComplete, completedSubtopicCount } = useCourseProgress(course.slug);

  const firstIncomplete = course.subtopics.find((subtopic) => !isSubtopicComplete(subtopic.id));
  const ctaSubtopic = firstIncomplete || course.subtopics[0];
  const hasStarted = completedSubtopicCount > 0;
  const isComplete = completedSubtopicCount === course.subtopicCount;

  return (
    <LearnViewport className="pb-8">
      <LearnTopBar
        title={course.title}
        left={
          <CircleIconButton href={basePath} label="Back to courses">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </CircleIconButton>
        }
      />

      <div className="space-y-[18px] px-5 pb-28 pt-2">
        <div className="space-y-[10px]">
          <h1 className="text-[30px] font-bold leading-[1.08] text-slate-50">
            {course.title}
          </h1>
          <p className="text-[14px] leading-[1.45] text-slate-400">
            {course.description}
          </p>
        </div>

        <SummaryCard
          status={isComplete ? "Completed" : hasStarted ? "In progress" : "Ready to start"}
          metricA={`${course.subtopicCount} lessons`}
          metricB={`${course.estMinutes} min total`}
        />

        <div className="space-y-3">
          <SectionLabel>{hasStarted ? "Learn" : "Learn The System"}</SectionLabel>
          <div className="space-y-[10px]">
            {course.subtopics.map((subtopic) => {
              const completed = isSubtopicComplete(subtopic.id);

              return (
                <LessonRow
                  key={subtopic.id}
                  title={`${subtopic.position}. ${subtopic.title}`}
                  meta={completed ? "Done" : `${subtopic.estMinutes} min`}
                  completed={completed}
                  href={`${basePath}/${course.slug}/${subtopic.slug}`}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>Implementation Plan</SectionLabel>
          <ImplementationCard
            href={`${basePath}/${course.slug}/generate`}
            emphasized={isComplete}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0B0B0BF2] px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-4 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[390px]">
          {!isComplete && ctaSubtopic && (
            <Link
              href={`${basePath}/${course.slug}/${ctaSubtopic.slug}`}
              className={`${primaryButtonClass} flex w-full`}
            >
              {hasStarted ? "Continue Course" : "Start Course"}
            </Link>
          )}

          {isComplete && (
            <Link
              href={`${basePath}/${course.slug}/generate`}
              className={`${primaryButtonClass} flex w-full`}
            >
              Generate Voice Files
            </Link>
          )}
        </div>
      </div>
    </LearnViewport>
  );
}
