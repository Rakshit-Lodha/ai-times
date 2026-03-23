"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type CoursePreview } from "@/lib/learn-data";

export default function CoursePreviewCard({ course, basePath = "/learn-v1-test" }: { course: CoursePreview; basePath?: string }) {
  const inner = (
    <motion.div
      whileTap={course.comingSoon ? undefined : { scale: 0.97 }}
      className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-4"
      style={{ background: course.coverGradient }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Desaturate overlay for coming soon */}
      {course.comingSoon && (
        <div className="absolute inset-0 z-10 bg-black/50" />
      )}

      {/* Coming soon badge */}
      {course.comingSoon && (
        <div className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur-md">
          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-white/70">Coming Soon</span>
        </div>
      )}

      <div className={`relative ${course.comingSoon ? "z-20" : "z-10"}`}>
        <span className="text-3xl">{course.emoji}</span>
        <h3 className={`mt-2 text-[0.95rem] font-bold leading-snug ${course.comingSoon ? "text-white/60" : "text-white"}`}>
          {course.title}
        </h3>
        <p className={`mt-1.5 text-[0.75rem] leading-relaxed line-clamp-2 ${course.comingSoon ? "text-white/35" : "text-white/55"}`}>
          {course.description}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className={`rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold ${course.comingSoon ? "text-white/35" : "text-white/60"}`}>
            {course.subtopicCount} topics
          </span>
          <span className={`rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold ${course.comingSoon ? "text-white/35" : "text-white/60"}`}>
            {course.cardCount} cards
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (course.comingSoon) {
    return <div className="cursor-default">{inner}</div>;
  }

  return (
    <Link href={`${basePath}/${course.slug}`}>
      {inner}
    </Link>
  );
}
