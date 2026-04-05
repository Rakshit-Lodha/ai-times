"use client";

import { useState } from "react";
import {
  RecommendationCard,
  learnCardClass,
  learnMonoStyle,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/learn-ui";

type SetupGuideProps = {
  userName: string;
  projectInstructions: string;
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={secondaryButtonClass}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function Step({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16233A] text-[0.8rem] font-bold text-sky-200">
        {number}
      </div>
      <div className="min-w-0 flex-1 pt-1 text-[0.9rem] leading-[1.6] text-slate-300">
        {children}
      </div>
    </div>
  );
}

export default function SetupGuide({
  userName,
  projectInstructions,
}: SetupGuideProps) {
  const [activeTab, setActiveTab] = useState<"skill" | "project">("skill");
  const testPrompt =
    "Write a LinkedIn post about a lesson I learned this week at work.";

  return (
    <div className="space-y-4">
      <RecommendationCard
        title="Set this up as a Skill"
        description="Skills are easier to reuse and safer to test. Project instructions are the fallback when you need workspace-level behavior."
      />

      <div className={`${learnCardClass} p-4`}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("skill")}
            className={activeTab === "skill" ? primaryButtonClass : secondaryButtonClass}
          >
            Skill
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("project")}
            className={activeTab === "project" ? primaryButtonClass : secondaryButtonClass}
          >
            Project
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {activeTab === "skill" ? (
            <>
              <Step number={1}>
                Open <span className="font-semibold text-white">claude.ai</span> and go to the menu at the bottom-left of any chat.
              </Step>
              <Step number={2}>
                Choose <span className="font-semibold text-white">Skills</span>, then create a new skill named{" "}
                <span className="font-semibold text-white">&quot;{userName} LinkedIn Voice&quot;</span>.
              </Step>
              <Step number={3}>
                Paste your generated instructions into the skill.
                <div className="mt-3">
                  <CopyButton text={projectInstructions} label="Copy instructions" />
                </div>
              </Step>
              <Step number={4}>
                Upload these files: <span className="font-semibold text-white">voice-profile.md</span>,{" "}
                <span className="font-semibold text-white">banned-phrases.md</span>, and{" "}
                <span className="font-semibold text-white">my-best-posts.md</span>.
              </Step>
              <Step number={5}>
                Test the skill with this prompt.
                <div className="mt-3 rounded-[14px] border border-[#223449] bg-[#101A2B] p-4">
                  <p className="text-[0.82rem] leading-[1.6] text-slate-300" style={learnMonoStyle}>
                    {testPrompt}
                  </p>
                  <div className="mt-3">
                    <CopyButton text={testPrompt} label="Copy prompt" />
                  </div>
                </div>
              </Step>
            </>
          ) : (
            <>
              <Step number={1}>
                Open <span className="font-semibold text-white">Projects</span> in Claude and create{" "}
                <span className="font-semibold text-white">&quot;{userName} LinkedIn Posts&quot;</span>.
              </Step>
              <Step number={2}>
                Upload <span className="font-semibold text-white">my-best-posts.md</span> and{" "}
                <span className="font-semibold text-white">voice-profile.md</span> to Project Knowledge.
              </Step>
              <Step number={3}>
                Paste the generated instructions into <span className="font-semibold text-white">Custom Instructions</span>.
                <div className="mt-3">
                  <CopyButton text={projectInstructions} label="Copy instructions" />
                </div>
              </Step>
              <Step number={4}>
                Keep <span className="font-semibold text-white">banned-phrases.md</span> nearby as your review guardrail.
              </Step>
              <Step number={5}>
                Test the project with the same prompt.
                <div className="mt-3 rounded-[14px] border border-[#223449] bg-[#101A2B] p-4">
                  <p className="text-[0.82rem] leading-[1.6] text-slate-300" style={learnMonoStyle}>
                    {testPrompt}
                  </p>
                  <div className="mt-3">
                    <CopyButton text={testPrompt} label="Copy prompt" />
                  </div>
                </div>
              </Step>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
