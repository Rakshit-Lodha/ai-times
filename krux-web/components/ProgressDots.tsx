"use client";

export default function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 px-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor:
              i < current
                ? "#f97316"
                : i === current
                  ? "rgba(249, 115, 22, 0.5)"
                  : "rgba(255, 255, 255, 0.1)",
          }}
        />
      ))}
    </div>
  );
}
