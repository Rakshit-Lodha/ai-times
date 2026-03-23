"use client";

import StackPreviewCard, { type StackPreview } from "@/components/StackPreviewCard";

export default function StackGrid({ stacks }: { stacks: StackPreview[] }) {
  if (stacks.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="text-4xl">📚</span>
        <p className="text-[1rem] font-semibold text-white/70">Stacks coming soon</p>
        <p className="text-[0.85rem] text-white/40">
          Bite-sized AI skills for your work
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#080808] px-4 pb-10 pt-4">
      <div className="mx-auto max-w-[560px]">
        <div className="mb-6">
          <h2 className="text-[1.3rem] font-bold text-white">Learn</h2>
          <p className="mt-1 text-[0.85rem] text-white/50">AI skills for marketers & PMs</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stacks.map((stack) => (
            <StackPreviewCard key={stack.id} stack={stack} />
          ))}
        </div>
      </div>
    </div>
  );
}
