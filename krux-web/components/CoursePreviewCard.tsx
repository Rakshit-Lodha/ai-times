"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type CoursePreview } from "@/lib/learn-data";

export default function CoursePreviewCard({ course, basePath = "/learn-v1-test" }: { course: CoursePreview; basePath?: string }) {
  return (
    <Link href={`${basePath}/${course.slug}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-4"
        style={{ background: course.coverGradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10">
          <span className="text-3xl">{course.emoji}</span>
          <h3 className="mt-2 text-[0.95rem] font-bold leading-snug text-white">
            {course.title}
          </h3>
          <p className="mt-1.5 text-[0.75rem] leading-relaxed text-white/55 line-clamp-2">
            {course.description}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold text-white/60">
              {course.subtopicCount} topics
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold text-white/60">
              {course.cardCount} cards
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
