"use client";

import CoursePreviewCard from "@/components/CoursePreviewCard";
import { type CoursePreview } from "@/lib/learn-data";

export default function CourseGrid({ courses, basePath = "/learn-v1-test" }: { courses: CoursePreview[]; basePath?: string }) {
  if (courses.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="text-4xl">📚</span>
        <p className="text-[1rem] font-semibold text-white/70">Courses coming soon</p>
        <p className="text-[0.85rem] text-white/40">Bite-sized AI skills for your work</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#080808] px-4 pb-10 pt-6">
      <div className="mx-auto max-w-[560px]">
        <div className="mb-6">
          <h1 className="text-[1.5rem] font-bold text-white">Learn</h1>
          <p className="mt-1 text-[0.85rem] text-white/50">AI skills for marketers & PMs</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {courses.map((course) => (
            <CoursePreviewCard key={course.id} course={course} basePath={basePath} />
          ))}
        </div>
      </div>
    </div>
  );
}
