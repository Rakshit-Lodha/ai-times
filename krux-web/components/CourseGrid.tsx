"use client";

import CoursePreviewCard from "@/components/CoursePreviewCard";
import { type CoursePreview } from "@/lib/learn-data";
import {
  LearnScreenHeader,
  LearnViewport,
} from "@/components/learn-ui";

export default function CourseGrid({ courses, basePath = "/learn-v1-test" }: { courses: CoursePreview[]; basePath?: string }) {
  if (courses.length === 0) {
    return (
      <LearnViewport className="flex min-h-[100dvh] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="text-4xl">📚</span>
          <p className="text-[1rem] font-semibold text-white/70">Courses coming soon</p>
          <p className="text-[0.85rem] text-white/40">Bite-sized AI skills for your work</p>
        </div>
      </LearnViewport>
    );
  }

  return (
    <LearnViewport className="pb-8">
      <div className="space-y-[18px] px-5 pb-5 pt-8">
        <LearnScreenHeader
          title="Courses"
          description="Learn the why, get the how done for you"
        />
        <div className="space-y-3">
          {courses.map((course) => (
            <CoursePreviewCard key={course.id} course={course} basePath={basePath} />
          ))}
        </div>
      </div>
    </LearnViewport>
  );
}
