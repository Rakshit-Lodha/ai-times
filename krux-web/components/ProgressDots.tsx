"use client";

import { learnMonoStyle } from "@/components/learn-ui";

export default function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-3 px-5">
      <div className="flex flex-1 gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < current
                  ? "#3B82F6"
                  : i === current
                    ? "rgba(59, 130, 246, 0.5)"
                    : "rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}
      </div>
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300" style={learnMonoStyle}>
        {Math.min(current + 1, total)} of {total}
      </span>
    </div>
  );
}
