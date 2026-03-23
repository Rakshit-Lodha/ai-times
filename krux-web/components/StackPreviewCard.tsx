"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type StackPreview = {
  id: number;
  slug: string;
  title: string;
  emoji: string | null;
  description: string | null;
  cover_gradient: string | null;
  cover_image_url: string | null;
  card_count: number;
};

export default function StackPreviewCard({ stack }: { stack: StackPreview }) {
  const gradient = stack.cover_gradient || "linear-gradient(135deg, #1a1a2e, #16213e)";

  return (
    <Link href={`/learn/${stack.slug}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-4"
        style={{
          background: stack.cover_image_url
            ? `url(${stack.cover_image_url}) center/cover`
            : gradient,
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Emoji */}
        <div className="relative z-10">
          {stack.emoji && (
            <span className="text-3xl">{stack.emoji}</span>
          )}
          <h3 className="mt-2 text-[0.95rem] font-bold leading-snug text-white">
            {stack.title}
          </h3>
          {stack.description && (
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-white/60 line-clamp-2">
              {stack.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex h-5 items-center rounded-full bg-white/10 px-2">
              <span className="text-[0.65rem] font-semibold text-white/60">
                {stack.card_count} {stack.card_count === 1 ? "card" : "cards"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
