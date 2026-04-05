"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PillSelector from "@/components/PillSelector";
import {
  CircleIconButton,
  FlowProgressBar,
  LearnTopBar,
  LearnViewport,
  RecommendationCard,
  SectionLabel,
  learnCardClass,
  learnMonoStyle,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/learn-ui";

type Phase =
  | "step1"
  | "step2"
  | "step3"
  | "loading"
  | "review"
  | "preview"
  | "setup";

type GeneratedFiles = {
  voiceProfile: string;
  bannedPhrases: string;
  projectInstructions: string;
  bestPosts: string;
};

type FileKey = keyof GeneratedFiles;

type FileConfig = {
  key: FileKey;
  filename: string;
  rowTitle: string;
  previewTitle: string;
  previewIntro: string;
  previewParagraphs: string[];
  icon: React.ReactNode;
};

const FILE_CONFIGS: FileConfig[] = [
  {
    key: "voiceProfile",
    filename: "voice-profile.md",
    rowTitle: "voice-profile.md",
    previewTitle: "Core voice profile",
    previewIntro: "This file captures how you naturally write on LinkedIn.",
    previewParagraphs: [
      "It summarizes your tone as sharp, analytical, and direct. It also preserves the way you move from data point to explanation to opinionated takeaway.",
      "Use this as the primary instruction file whenever you want Claude to draft posts that sound like you instead of generic AI writing.",
      "Preview sections include: voice summary, structural tendencies, preferred hooks, pacing, and examples to imitate.",
    ],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    key: "bannedPhrases",
    filename: "banned-phrases.md",
    rowTitle: "banned-phrases.md",
    previewTitle: "What should never show up",
    previewIntro: "This file is the guardrail set.",
    previewParagraphs: [
      "It lists the words, transitions, and canned phrases that make AI writing feel generic in your voice, including promotional filler, empty hype, and repetitive startup jargon.",
      "Use it as negative guidance beside the main voice profile so Claude knows what to avoid before it drafts.",
      "Preview sections include: banned words, weak transitions, overused AI phrases, and replacement guidance.",
    ],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m4.9 4.9 14.2 14.2" />
      </svg>
    ),
  },
  {
    key: "projectInstructions",
    filename: "project-instructions.md",
    rowTitle: "project-instructions.md",
    previewTitle: "How Claude should work",
    previewIntro: "This file tells Claude how to turn your voice files into actual output.",
    previewParagraphs: [
      "It defines the writing job, the audience, the voice constraints, and the negative rules that should stay active every session.",
      "Use it as the operating layer for Skills or Projects so the model references your files before drafting.",
      "Preview sections include: role framing, writing rules, banned phrasing, structure constraints, and workflow reminders.",
    ],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.75c.53.39 1 1.05 1 1.75h6c0-.7.47-1.36 1-1.75A7 7 0 0 0 12 2Z" />
      </svg>
    ),
  },
  {
    key: "bestPosts",
    filename: "my-best-posts.md",
    rowTitle: "my-best-posts.md",
    previewTitle: "Reference posts to imitate",
    previewIntro: "This file is the sample bank Claude should keep looking back at.",
    previewParagraphs: [
      "It contains the source posts that best represent how you actually write when a post sounds most like you.",
      "Use it as evidence alongside the voice profile so Claude learns examples, not just abstract instructions.",
      "Preview sections include: raw posts, recurring hooks, sentence rhythm, and patterns worth reusing.",
    ],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h6" />
      </svg>
    ),
  },
];

const READER_PRESETS = [
  "Founders & CEOs",
  "Marketing managers",
  "Product managers",
  "Engineers",
  "Consultants",
  "Freelancers",
];

const OBJECTIVE_PRESETS = [
  "Build authority",
  "Drive leads",
  "Grow network",
  "Share learnings",
  "Recruit talent",
];

const POST_TYPE_PRESETS = [
  "How-to / Tutorial",
  "Personal story",
  "Contrarian take",
  "Industry analysis",
  "Case study",
  "News breakdown",
];

const AVOID_PRESETS = [
  "Leverage",
  "Synergy",
  "Delve",
  "Innovative",
  "Game-changing",
  "Thrilled to announce",
  "Excited to share",
];

const LOADING_STEPS = [
  "Scraping your LinkedIn profile",
  "Fetching your posts",
  "Analyzing your writing voice",
  "Generating voice profile",
  "Building banned phrases list",
  "Writing project instructions",
];

const LOADING_TIMINGS = [0, 3000, 8000, 15000, 22000, 28000];

type GenerateWizardProps = {
  courseSlug: string;
  basePath?: string;
};

type PersistedWizardState = {
  phase: Exclude<Phase, "loading">;
  linkedinUrl: string;
  postUrls: string[];
  targetReaders: string[];
  postingObjectives: string[];
  postTypes: string[];
  wordsToAvoid: string[];
  tonePrinciple: string;
  files: GeneratedFiles | null;
  selectedFileKey: FileKey;
};

const STORAGE_VERSION = 1;

function StepShell({
  title,
  stepLabel,
  stepNumber,
  onBack,
  children,
}: {
  title: string;
  stepLabel: string;
  stepNumber: number;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <LearnTopBar
        title="Generate Voice Profile"
        left={
          <CircleIconButton onClick={onBack} label="Back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </CircleIconButton>
        }
      />
      <FlowProgressBar current={stepNumber} total={3} />

      <div className="px-6 pb-32 pt-9">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50" style={learnMonoStyle}>
          {stepLabel}
        </p>
        <h2 className="mt-3 text-[28px] font-bold leading-[1.15] text-white">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </>
  );
}

function BottomCTA({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0B0B0BF2] px-5 pb-[max(env(safe-area-inset-bottom),38px)] pt-4 backdrop-blur-xl">
      <div className="mx-auto max-w-[390px]">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`flex h-[54px] w-full items-center justify-center rounded-[14px] text-[0.95rem] font-semibold transition active:scale-[0.98] ${
            disabled
              ? "cursor-not-allowed border border-white/10 bg-white/10 text-white/35"
              : primaryButtonClass
          }`}
        >
          {children}
        </button>
      </div>
    </div>
  );
}

function ReviewFileRow({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${learnCardClass} flex w-full items-center gap-3 rounded-[16px] px-4 py-[14px] text-left transition hover:bg-[#14213b]`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-[12px] text-slate-400">Preview, edit, or download</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

function SetupPanel({
  projectInstructions,
  onDownloadAll,
  onOpenFilePreview,
}: {
  projectInstructions: string;
  onDownloadAll: () => Promise<void> | void;
  onOpenFilePreview: (fileKey: FileKey) => void;
}) {
  const [activeTab, setActiveTab] = useState<"skill" | "project">("skill");

  const skillSteps = [
    "Create a new Claude skill",
    "Paste voice-profile.md into the skill instructions",
    "Attach banned-phrases.md and my-best-posts.md as references",
    "Test on one old draft and refine the voice if needed",
  ];

  const projectSteps = [
    "Create a Claude Project for LinkedIn writing",
    "Upload voice-profile.md and my-best-posts.md to Project Knowledge",
    "Paste project-instructions.md into Custom Instructions",
    "Keep banned-phrases.md nearby as the review guardrail",
  ];

  const steps = activeTab === "skill" ? skillSteps : projectSteps;

  const copyInstructions = async () => {
    await navigator.clipboard.writeText(projectInstructions);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#223449] bg-[#16233A] px-4 py-3">
        <p className="text-[13px] leading-[1.35] text-slate-300">
          Start with a Skill so this voice is portable across chats. Use Project only if you want repo-wide defaults.
        </p>
      </div>

      <RecommendationCard
        title="Set this up as a Skill"
        description="Skills are easier to reuse and safer to test. Project instructions are the fallback when you need workspace-level behavior."
      />

      <div>
        <h3 className="text-[28px] font-bold leading-[1.1] text-white">Apply your voice files</h3>
        <p className="mt-2 text-[15px] leading-[1.45] text-white/60">
          Use Skill first. Switch to Project only when you want broader workspace behavior.
        </p>
      </div>

      <div className="rounded-[16px] bg-white/5 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("skill")}
            className={`h-10 rounded-[12px] text-[0.9rem] font-semibold ${activeTab === "skill" ? "bg-[#3B82F6] text-white" : "text-white/55"}`}
          >
            Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("project")}
            className={`h-10 rounded-[12px] text-[0.9rem] font-semibold ${activeTab === "project" ? "bg-[#3B82F6] text-white" : "text-white/55"}`}
          >
            Project
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={step} className={`${learnCardClass} flex items-center gap-3 rounded-[14px] px-4 py-3`}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-[0.78rem] font-bold text-white/70">
              {index + 1}
            </div>
            <p className="text-[14px] leading-[1.35] text-slate-300">{step}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-[28px] font-bold leading-[1.1] text-white">Generated files stay attached</h4>
        <p className="text-[15px] leading-[1.45] text-white/60">
          Preview, edit, or download the same bundle here while you work through setup.
        </p>
      </div>

      <div className="space-y-2">
        {FILE_CONFIGS.map((file) => (
          <ReviewFileRow
            key={file.key}
            title={file.rowTitle}
            icon={file.icon}
            onClick={() => onOpenFilePreview(file.key)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          void onDownloadAll();
        }}
        className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-white text-[0.95rem] font-semibold text-slate-900 transition active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download all files
      </button>

      <button
        type="button"
        onClick={copyInstructions}
        className={secondaryButtonClass}
      >
        Copy project instructions
      </button>

      <p className="px-3 text-center text-[12px] leading-[1.35] text-white/40">
        Project setup works too, but it is broader and less portable than Skill setup.
      </p>
    </div>
  );
}

export default function GenerateWizard({
  courseSlug,
  basePath = "/learn-v1-test",
}: GenerateWizardProps) {
  const router = useRouter();
  const storageKey = useMemo(
    () => `generate-wizard:${courseSlug}:v${STORAGE_VERSION}`,
    [courseSlug],
  );
  const [phase, setPhase] = useState<Phase>("step1");
  const [direction, setDirection] = useState(1);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [postUrls, setPostUrls] = useState<string[]>([]);
  const [currentPostUrl, setCurrentPostUrl] = useState("");
  const [targetReaders, setTargetReaders] = useState<string[]>([]);
  const [postingObjectives, setPostingObjectives] = useState<string[]>([]);
  const [postTypes, setPostTypes] = useState<string[]>([]);
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [tonePrinciple, setTonePrinciple] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [files, setFiles] = useState<GeneratedFiles | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileKey, setSelectedFileKey] = useState<FileKey>("voiceProfile");
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [previewDraft, setPreviewDraft] = useState("");

  const isValidLinkedinUrl = /linkedin\.com\/in\//.test(linkedinUrl);
  const isValidPostUrl = /linkedin\.com\/(posts|feed|pulse)\//.test(currentPostUrl);
  const canAddPost =
    isValidPostUrl && postUrls.length < 10 && !postUrls.includes(currentPostUrl);

  const selectedFileConfig = useMemo(
    () => FILE_CONFIGS.find((file) => file.key === selectedFileKey) ?? FILE_CONFIGS[0],
    [selectedFileKey],
  );

  const selectedFileContent = files?.[selectedFileKey] ?? "";

  const goTo = useCallback((next: Phase, dir = 1) => {
    setDirection(dir);
    setPhase(next);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;

      const cached = JSON.parse(raw) as PersistedWizardState;
      const restoredPhase =
        cached.phase === "preview" && !cached.files
          ? "step3"
          : cached.phase === "review" || cached.phase === "preview" || cached.phase === "setup"
            ? cached.files
              ? cached.phase
              : "step3"
            : cached.phase;

      setLinkedinUrl(cached.linkedinUrl ?? "");
      setPostUrls(Array.isArray(cached.postUrls) ? cached.postUrls : []);
      setTargetReaders(Array.isArray(cached.targetReaders) ? cached.targetReaders : []);
      setPostingObjectives(Array.isArray(cached.postingObjectives) ? cached.postingObjectives : []);
      setPostTypes(Array.isArray(cached.postTypes) ? cached.postTypes : []);
      setWordsToAvoid(Array.isArray(cached.wordsToAvoid) ? cached.wordsToAvoid : []);
      setTonePrinciple(cached.tonePrinciple ?? "");
      setFiles(cached.files ?? null);
      setSelectedFileKey(cached.selectedFileKey ?? "voiceProfile");
      setPhase(restoredPhase);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (phase !== "loading") return;
    const timers = LOADING_TIMINGS.map((delay, index) =>
      setTimeout(() => setLoadingStep(index), delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    setPreviewDraft(selectedFileContent);
  }, [selectedFileContent, selectedFileKey]);

  useEffect(() => {
    const phaseToPersist: Exclude<Phase, "loading"> =
      phase === "loading" ? (files ? "review" : "step3") : phase;

    const payload: PersistedWizardState = {
      phase: phaseToPersist,
      linkedinUrl,
      postUrls,
      targetReaders,
      postingObjectives,
      postTypes,
      wordsToAvoid,
      tonePrinciple,
      files,
      selectedFileKey,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [
    files,
    linkedinUrl,
    phase,
    postTypes,
    postUrls,
    postingObjectives,
    selectedFileKey,
    storageKey,
    targetReaders,
    tonePrinciple,
    wordsToAvoid,
  ]);

  const addPost = () => {
    if (!canAddPost) return;
    setPostUrls((prev) => [...prev, currentPostUrl.trim()]);
    setCurrentPostUrl("");
  };

  const removePost = (url: string) => {
    setPostUrls((prev) => prev.filter((value) => value !== url));
  };

  const handleGenerate = async () => {
    goTo("loading");
    setLoadingStep(0);
    setError(null);

    try {
      const response = await fetch("/api/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl,
          postUrls,
          metadata: {
            targetReaders,
            postingObjectives,
            postTypes,
            wordsToAvoid: wordsToAvoid.join(", "),
            tonePrinciple: tonePrinciple || "Authentic and conversational",
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await response.json();
      setFiles(data.files);
      setLoadingStep(LOADING_STEPS.length);
      setTimeout(() => goTo("review"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleDownloadAll = async () => {
    if (!files) return;

    try {
      const fileMap: Record<string, string> = {
        "voice-profile.md": files.voiceProfile,
        "banned-phrases.md": files.bannedPhrases,
        "project-instructions.md": files.projectInstructions,
        "my-best-posts.md": files.bestPosts,
      };

      const response = await fetch("/api/download-voice-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileMap }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = "voice-files.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Could not download the generated files.");
    }
  };

  const savePreviewDraft = () => {
    if (!files) return;
    setFiles({
      ...files,
      [selectedFileKey]: previewDraft,
    });
    setIsEditingPreview(false);
  };

  const openFilePreview = (fileKey: FileKey) => {
    setSelectedFileKey(fileKey);
    setIsEditingPreview(false);
    goTo("preview");
  };

  const variants = {
    enter: (value: number) => ({ opacity: 0, x: value * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (value: number) => ({ opacity: 0, x: value * -40 }),
  };

  return (
    <LearnViewport className="min-h-[100dvh]">
      <AnimatePresence mode="wait" custom={direction}>
        {phase === "step1" && (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <StepShell
              title="Paste your LinkedIn profile URL"
              stepLabel="Step 1 of 3"
              stepNumber={1}
              onBack={() => router.push(`${basePath}/${courseSlug}`)}
            >
              <p className="max-w-[320px] text-[15px] leading-[1.45] text-white/60">
                We&apos;ll scrape your profile to understand your background and role.
              </p>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(event) => setLinkedinUrl(event.target.value)}
                placeholder="https://linkedin.com/in/your-name"
                className="mt-7 h-[54px] w-full rounded-[14px] border border-[#223449] bg-[#0F172A] px-[18px] text-[0.95rem] text-white placeholder:text-white/30 focus:border-[#3b82f666] focus:outline-none"
              />
            </StepShell>
            <BottomCTA onClick={() => goTo("step2")} disabled={!isValidLinkedinUrl}>
              Continue
            </BottomCTA>
          </motion.div>
        )}

        {phase === "step2" && (
          <motion.div
            key="step2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <StepShell
              title="Add your best LinkedIn posts"
              stepLabel="Step 2 of 3"
              stepNumber={2}
              onBack={() => goTo("step1", -1)}
            >
              <p className="max-w-[320px] text-[15px] leading-[1.45] text-white/60">
                Paste 3-10 posts that sound most like you. Skip anything you wrote with AI help.
              </p>

              <div className="mt-7 flex gap-3">
                <input
                  type="url"
                  value={currentPostUrl}
                  onChange={(event) => setCurrentPostUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addPost();
                    }
                  }}
                  placeholder="https://linkedin.com/posts/..."
                  className="h-[54px] flex-1 rounded-[14px] border border-[#223449] bg-[#0F172A] px-[18px] text-[0.9rem] text-white placeholder:text-white/30 focus:border-[#3b82f666] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addPost}
                  disabled={!canAddPost}
                  className={`rounded-[14px] px-5 text-[0.85rem] font-semibold ${
                    canAddPost
                      ? "border border-[#60A5FA66] bg-[#3B82F6] text-white"
                      : "cursor-not-allowed border border-white/10 bg-white/10 text-white/35"
                  }`}
                >
                  Add
                </button>
              </div>

              <p className="mt-3 text-[12px] text-white/45" style={learnMonoStyle}>
                {postUrls.length}/10 posts added
                {postUrls.length < 3 ? ` • ${3 - postUrls.length} more needed` : ""}
              </p>

              <div className="mt-4 space-y-2">
                {postUrls.map((url, index) => (
                  <div
                    key={url}
                    className={`${learnCardClass} flex items-center gap-3 rounded-[14px] px-3 py-3`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16233A] text-[0.72rem] font-bold text-sky-200">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-[0.82rem] text-slate-300">
                      {url.replace(/https?:\/\/(www\.)?linkedin\.com\//, "")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePost(url)}
                      className="rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white/70"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </StepShell>
            <BottomCTA onClick={() => goTo("step3")} disabled={postUrls.length < 3}>
              Continue
            </BottomCTA>
          </motion.div>
        )}

        {phase === "step3" && (
          <motion.div
            key="step3"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <StepShell
              title="Quick preferences"
              stepLabel="Step 3 of 3"
              stepNumber={3}
              onBack={() => goTo("step2", -1)}
            >
              <p className="max-w-[320px] text-[15px] leading-[1.45] text-white/60">
                Choose quick defaults for the documents we generate.
              </p>
              <div className="mt-7 space-y-8">
                <PillSelector
                  label="Who reads your posts?"
                  options={READER_PRESETS}
                  selected={targetReaders}
                  onChange={setTargetReaders}
                  placeholder='e.g. "Sales leaders"'
                />
                <PillSelector
                  label="Why do you post?"
                  options={OBJECTIVE_PRESETS}
                  selected={postingObjectives}
                  onChange={setPostingObjectives}
                  placeholder='e.g. "Drive app downloads"'
                />
                <PillSelector
                  label="What do you usually post about?"
                  options={POST_TYPE_PRESETS}
                  selected={postTypes}
                  onChange={setPostTypes}
                  placeholder='e.g. "Tool reviews"'
                />
                <PillSelector
                  label="Words you hate in AI writing"
                  options={AVOID_PRESETS}
                  selected={wordsToAvoid}
                  onChange={setWordsToAvoid}
                  placeholder='e.g. "Unprecedented"'
                />
                <div className={`${learnCardClass} rounded-[14px] p-[14px]`}>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400" style={learnMonoStyle}>
                    Describe your voice in one line
                  </p>
                  <input
                    type="text"
                    value={tonePrinciple}
                    onChange={(event) => setTonePrinciple(event.target.value)}
                    placeholder='e.g. "No jargon, like explaining to a smart friend"'
                    className="h-10 w-full rounded-[12px] border border-[#223449] bg-[#101A2B] px-3 text-[0.85rem] text-white placeholder:text-white/30 focus:border-[#3b82f666] focus:outline-none"
                  />
                </div>
              </div>
            </StepShell>
            <BottomCTA
              onClick={handleGenerate}
              disabled={
                targetReaders.length === 0 ||
                postingObjectives.length === 0 ||
                postTypes.length === 0
              }
            >
              Generate my voice files
            </BottomCTA>
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LearnTopBar
              title="Generate Voice Profile"
              left={
                <CircleIconButton onClick={() => goTo("step3", -1)} label="Back">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </CircleIconButton>
              }
            />
            <FlowProgressBar current={3} total={3} />

            <div className="px-6 pb-10 pt-9">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50" style={learnMonoStyle}>
                Processing
              </p>
              <h2 className="mt-3 text-[28px] font-bold leading-[1.15] text-white">
                Analyze your writing style
              </h2>
              <p className="mt-3 text-[15px] leading-[1.45] text-white/60">
                We read your profile, post structure, recurring themes, and phrasing patterns to map how you naturally write.
              </p>

              <div className={`${learnCardClass} mt-7 space-y-4 p-[18px]`}>
                <div className="space-y-3">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#3B82F6] transition-[width] duration-500"
                      style={{
                        width: `${Math.min(
                          ((loadingStep + (error ? 0 : 1)) / LOADING_STEPS.length) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[12.5px] text-slate-400">
                    Reading tone, sentence rhythm, hooks and phrase patterns
                  </p>
                </div>

                <div className="space-y-3">
                  {LOADING_STEPS.map((step, index) => {
                    const done = loadingStep > index;
                    const current = loadingStep === index;

                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center">
                          {done ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : current ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-white/20" />
                          )}
                        </div>
                        <span className={`text-[14px] ${current ? "text-white" : "text-white/55"}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-[14px] border border-red-400/20 bg-red-500/10 p-4">
                  <p className="text-[0.9rem] text-red-300">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      goTo("step3", -1);
                    }}
                    className="mt-4 inline-flex h-11 items-center rounded-[12px] border border-white/15 bg-white/5 px-4 text-[0.88rem] font-semibold text-white/80"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === "review" && files && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LearnTopBar
              title="Generate Voice Profile"
              left={
                <CircleIconButton onClick={() => router.push(`${basePath}/${courseSlug}`)} label="Back to course">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </CircleIconButton>
              }
            />
            <FlowProgressBar current={6} total={7} />

            <div className="space-y-5 px-4 pb-10 pt-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50" style={learnMonoStyle}>
                  Step 6 of 7
                </p>
                <h2 className="mt-3 text-[28px] font-bold leading-[1.15] text-white">Verify your files</h2>
                <p className="mt-3 max-w-[320px] text-[15px] leading-[1.45] text-white/60">
                  Review each document before continuing to setup.
                </p>
              </div>

              <div className="rounded-[14px] border border-[#223449] bg-[#16233A] px-4 py-3">
                <p className="text-[13px] leading-[1.35] text-slate-300">
                  Tap any file to preview it. Keep the bundle handy here, then continue into setup when you&apos;re ready.
                </p>
              </div>

              <div className="space-y-2">
                <SectionLabel>Review Generated Files</SectionLabel>
                {FILE_CONFIGS.map((file) => (
                  <ReviewFileRow
                    key={file.key}
                    title={file.rowTitle}
                    icon={file.icon}
                    onClick={() => openFilePreview(file.key)}
                  />
                ))}
              </div>

              <button type="button" onClick={() => goTo("setup")} className={`${primaryButtonClass} flex w-full`}>
                Continue to setup
              </button>

              <div className="border-t border-white/10 pt-5">
                <RecommendationCard
                  title="Set up in Claude"
                  description="Choose Skills for the recommended setup path, or use Project if you want broader defaults."
                />
              </div>
            </div>
          </motion.div>
        )}

        {phase === "preview" && files && (
          <motion.div
            key={`preview-${selectedFileKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LearnTopBar
              title={selectedFileConfig.filename}
              left={
                <CircleIconButton onClick={() => goTo("review", -1)} label="Back to review">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </CircleIconButton>
              }
              right={
                <CircleIconButton onClick={() => goTo("review", -1)} label="Close preview">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </CircleIconButton>
              }
            />

            <div className="flex gap-2 px-0">
              {FILE_CONFIGS.map((file, index) => {
                const selectedIndex = FILE_CONFIGS.findIndex(
                  (candidate) => candidate.key === selectedFileKey,
                );
                const isActive = index === selectedIndex;

                return (
                  <div
                    key={file.key}
                    className={`h-[3px] flex-1 rounded-full ${isActive ? "bg-[#3B82F6]" : "bg-white/10"}`}
                  />
                );
              })}
            </div>

            <div className="px-6 pb-32 pt-7">
              {!isEditingPreview ? (
                <pre
                  className="mt-1 whitespace-pre-wrap break-words text-[0.92rem] leading-[1.65] text-slate-200"
                  style={learnMonoStyle}
                >
                  {selectedFileContent}
                </pre>
              ) : (
                <textarea
                  value={previewDraft}
                  onChange={(event) => setPreviewDraft(event.target.value)}
                  className="mt-6 min-h-[420px] w-full rounded-[16px] border border-[#223449] bg-[#08111e] p-4 text-[0.84rem] leading-[1.6] text-slate-200 focus:border-[#3b82f666] focus:outline-none"
                  style={learnMonoStyle}
                />
              )}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0B0B0BF2] px-5 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-xl">
              <div className="mx-auto flex max-w-[390px] gap-3">
                <button
                  type="button"
                  onClick={() => goTo("review", -1)}
                  className="flex h-[50px] w-14 shrink-0 items-center justify-center rounded-[14px] border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingPreview) {
                      savePreviewDraft();
                    } else {
                      setIsEditingPreview(true);
                    }
                  }}
                  className={`${secondaryButtonClass} flex-1`}
                >
                  {isEditingPreview ? "Save file" : "Edit file"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPreview(false);
                    goTo("review", -1);
                  }}
                  className={`${primaryButtonClass} flex-1`}
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "setup" && files && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LearnTopBar
              title="Set up and refine files"
              left={
                <CircleIconButton onClick={() => goTo("review", -1)} label="Back to review">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </CircleIconButton>
              }
            />

            <div className="px-4 pb-10 pt-5">
              <p className="mb-5 text-[13px] leading-[1.35] text-white/50">
                Preview, edit, then apply in Skills or Project
              </p>
              <SetupPanel
                projectInstructions={files.projectInstructions}
                onDownloadAll={handleDownloadAll}
                onOpenFilePreview={openFilePreview}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LearnViewport>
  );
}
