"use client";

import Link from "next/link";
import { useCourseProgress } from "@/lib/useProgress";
import { type CoursePreview } from "@/lib/learn-data";
import {
  learnCardClass,
  learnMonoStyle,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/learn-ui";

export default function CoursePreviewCard({ course, basePath = "/learn-v1-test" }: { course: CoursePreview; basePath?: string }) {
  const { completedSubtopicCount } = useCourseProgress(course.slug);
  const started = !course.comingSoon && completedSubtopicCount > 0;
  const progress = course.subtopicCount > 0
    ? Math.max(8, Math.round((completedSubtopicCount / course.subtopicCount) * 100))
    : 0;

  if (course.comingSoon) {
    return (
      <div className={`${learnCardClass} rounded-[20px] p-4`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[20px] font-bold leading-[1.2] text-slate-200">
            {course.title}
          </h3>
        </div>
        <p className="mt-3 text-[14px] leading-[1.45] text-slate-500">
          Planned next. This course will cover story structure, launch arcs, and
          founder-led messaging.
        </p>
        <div className="mt-4">
          <span className={`${secondaryButtonClass} h-[38px] px-4 text-[0.78rem] text-white/55`}>
            Coming Soon
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${learnCardClass} p-4`}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="max-w-[248px] text-[20px] font-bold leading-[1.15] text-slate-50">
          {course.title}
        </h3>
      </div>
      <p className="mt-3 text-[14px] leading-[1.45] text-slate-400">
        {started
          ? `${completedSubtopicCount} lessons done. Continue building a repeatable writing system that sounds like you.`
          : course.description}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-[#60A5FA] transition-[width] duration-500"
          style={{ width: `${started ? progress : 8}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="rounded-full border border-[#27406A] bg-[#16233A] px-3 py-2">
          <span className="text-[12px] font-bold text-sky-200" style={learnMonoStyle}>
            {started
              ? `${Math.round((completedSubtopicCount / course.subtopicCount) * 100)}% complete`
              : `${course.subtopicCount} lessons  ${course.estMinutes} min`}
          </span>
        </div>
        <Link href={`${basePath}/${course.slug}`} className={`${primaryButtonClass} h-[40px] px-4 text-[0.82rem]`}>
          {started ? "Continue" : "Start Course"}
        </Link>
      </div>
    </div>
  );
}
