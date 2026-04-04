"use client";

import { useState } from "react";

type SetupGuideProps = {
  userName: string;
  projectInstructions: string;
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-[0.75rem] font-medium text-white/50 transition-all hover:bg-white/10 hover:text-white/70 active:scale-[0.95]"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label || "Copy"}
        </>
      )}
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.8rem] font-bold text-white/50">
        {number}
      </div>
      <div className="min-w-0 flex-1 pt-1">{children}</div>
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
    <div>
      <h3 className="text-[1.1rem] font-bold text-white">
        Now set up Claude to use them
      </h3>
      <p className="mt-1 text-[0.85rem] text-white/50">
        Pick how you want Claude to write for you.
      </p>

      {/* Tab selector */}
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("skill")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-[0.8rem] font-semibold transition-all ${
            activeTab === "skill"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Claude Skill
          <span className="ml-1.5 rounded-md bg-orange-500/20 px-1.5 py-0.5 text-[0.65rem] font-bold text-orange-400">
            REC
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("project")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-[0.8rem] font-semibold transition-all ${
            activeTab === "project"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Claude Project
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-6 space-y-5">
        {activeTab === "skill" ? (
          <>
            <Step number={1}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Open{" "}
                <span className="font-medium text-white/90">claude.ai</span>{" "}
                and click the menu icon at the bottom-left of any chat.
              </p>
            </Step>

            <Step number={2}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Select{" "}
                <span className="font-medium text-white/90">Skills</span> from
                the menu, then click{" "}
                <span className="font-medium text-white/90">Create Skill</span>.
              </p>
            </Step>

            <Step number={3}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Name it{" "}
                <span className="font-medium text-white/90">
                  &quot;{userName} LinkedIn Voice&quot;
                </span>
                . Paste your project instructions as the skill instruction:
              </p>
              <div className="mt-2">
                <CopyButton
                  text={projectInstructions}
                  label="Copy instructions"
                />
              </div>
            </Step>

            <Step number={4}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Upload these 3 reference files to the skill:
              </p>
              <ul className="mt-1.5 space-y-1 text-[0.8rem] text-white/50">
                <li>voice-profile.md</li>
                <li>banned-phrases.md</li>
                <li>my-best-posts.md</li>
              </ul>
            </Step>

            <Step number={5}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                The Skill auto-activates when you ask Claude to write LinkedIn
                posts. Test it now:
              </p>
              <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[0.8rem] italic text-white/50">
                  &quot;{testPrompt}&quot;
                </p>
                <div className="mt-2">
                  <CopyButton text={testPrompt} label="Copy prompt" />
                </div>
              </div>
            </Step>
          </>
        ) : (
          <>
            <Step number={1}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Open{" "}
                <span className="font-medium text-white/90">claude.ai</span>{" "}
                and click{" "}
                <span className="font-medium text-white/90">Projects</span> in
                the left sidebar.
              </p>
            </Step>

            <Step number={2}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Click{" "}
                <span className="font-medium text-white/90">New Project</span>{" "}
                and name it{" "}
                <span className="font-medium text-white/90">
                  &quot;{userName} LinkedIn Posts&quot;
                </span>
                .
              </p>
            </Step>

            <Step number={3}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Click{" "}
                <span className="font-medium text-white/90">
                  Project Knowledge
                </span>{" "}
                and upload these 2 files:
              </p>
              <ul className="mt-1.5 space-y-1 text-[0.8rem] text-white/50">
                <li>my-best-posts.md</li>
                <li>voice-profile.md</li>
              </ul>
            </Step>

            <Step number={4}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Go to{" "}
                <span className="font-medium text-white/90">
                  Project Settings
                </span>{" "}
                and paste this into{" "}
                <span className="font-medium text-white/90">
                  Custom Instructions
                </span>
                :
              </p>
              <div className="mt-2">
                <CopyButton
                  text={projectInstructions}
                  label="Copy instructions"
                />
              </div>
            </Step>

            <Step number={5}>
              <p className="text-[0.85rem] leading-relaxed text-white/70">
                Start a new conversation inside the project and test:
              </p>
              <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[0.8rem] italic text-white/50">
                  &quot;{testPrompt}&quot;
                </p>
                <div className="mt-2">
                  <CopyButton text={testPrompt} label="Copy prompt" />
                </div>
              </div>
            </Step>
          </>
        )}
      </div>
    </div>
  );
}
