"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PillSelector from "@/components/PillSelector";
import FilePreview from "@/components/FilePreview";
import SetupGuide from "@/components/SetupGuide";

type Phase = "step1" | "step2" | "step3" | "loading" | "results";

type GeneratedFiles = {
  voiceProfile: string;
  bannedPhrases: string;
  projectInstructions: string;
  bestPosts: string;
};

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
  "Scraping your LinkedIn profile...",
  "Fetching your posts...",
  "Analyzing your writing voice...",
  "Generating voice profile...",
  "Building banned phrases list...",
  "Writing project instructions...",
];

const LOADING_TIMINGS = [0, 3000, 8000, 15000, 22000, 28000];

type GenerateWizardProps = {
  courseSlug: string;
  basePath?: string;
};

export default function GenerateWizard({
  courseSlug,
  basePath = "/learn-v1-test",
}: GenerateWizardProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("step1");
  const [direction, setDirection] = useState(1);

  // Step 1
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Step 2
  const [postUrls, setPostUrls] = useState<string[]>([]);
  const [currentPostUrl, setCurrentPostUrl] = useState("");

  // Step 3
  const [targetReaders, setTargetReaders] = useState<string[]>([]);
  const [postingObjectives, setPostingObjectives] = useState<string[]>([]);
  const [postTypes, setPostTypes] = useState<string[]>([]);
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [tonePrinciple, setTonePrinciple] = useState("");

  // Loading
  const [loadingStep, setLoadingStep] = useState(0);

  // Results
  const [files, setFiles] = useState<GeneratedFiles | null>(null);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValidLinkedinUrl = /linkedin\.com\/in\//.test(linkedinUrl);
  const isValidPostUrl = /linkedin\.com\/(posts|feed|pulse)\//.test(currentPostUrl);
  const canAddPost = isValidPostUrl && postUrls.length < 10 && !postUrls.includes(currentPostUrl);

  const goTo = useCallback(
    (next: Phase, dir: number = 1) => {
      setDirection(dir);
      setPhase(next);
    },
    [],
  );

  const addPost = () => {
    if (!canAddPost) return;
    setPostUrls((prev) => [...prev, currentPostUrl.trim()]);
    setCurrentPostUrl("");
  };

  const removePost = (url: string) => {
    setPostUrls((prev) => prev.filter((u) => u !== url));
  };

  // Loading step animation
  useEffect(() => {
    if (phase !== "loading") return;

    const timers = LOADING_TIMINGS.map((delay, i) =>
      setTimeout(() => setLoadingStep(i), delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleGenerate = async () => {
    goTo("loading");
    setLoadingStep(0);
    setError(null);

    try {
      const res = await fetch("/api/generate-profile", {
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setFiles(data.files);
      setUserName(data.userName);
      setLoadingStep(LOADING_STEPS.length);

      // Brief pause to show all steps complete, then transition
      setTimeout(() => goTo("results"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleDownloadAll = () => {
    if (!files) return;
    const fileMap: Record<string, string> = {
      "voice-profile.md": files.voiceProfile,
      "banned-phrases.md": files.bannedPhrases,
      "claude-project-instructions.md": files.projectInstructions,
      "my-best-posts.md": files.bestPosts,
    };
    Object.entries(fileMap).forEach(([name, content], i) => {
      setTimeout(() => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
      }, i * 100);
    });
  };

  const updateFile = (key: keyof GeneratedFiles) => (content: string) => {
    setFiles((prev) => (prev ? { ...prev, [key]: content } : prev));
  };

  // Shared top bar
  const TopBar = ({
    title,
    onBack,
  }: {
    title: string;
    onBack?: () => void;
  }) => (
    <div
      className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-3 px-4"
      style={{
        background:
          "linear-gradient(to bottom, rgba(8,8,8,0.97), rgba(8,8,8,0.88))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20 active:scale-90"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/70"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <span className="flex-1 truncate text-center text-[0.85rem] font-semibold text-white/80">
        {title}
      </span>
      <div className="w-8" />
    </div>
  );

  // Progress bar
  const ProgressBar = ({ step }: { step: number }) => (
    <div className="h-0.5 w-full bg-white/5">
      <div
        className="h-full bg-orange-500 transition-all duration-500"
        style={{ width: `${(step / 3) * 100}%` }}
      />
    </div>
  );

  // Sticky bottom CTA
  const BottomCTA = ({
    onClick,
    disabled,
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#080808]/95 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 backdrop-blur-xl">
      <div className="mx-auto max-w-[560px]">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl text-[0.95rem] font-bold transition-all active:scale-[0.98] ${
            disabled
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {children}
        </button>
      </div>
    </div>
  );

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <div className="min-h-[100dvh] bg-[#080808] text-white">
      <AnimatePresence mode="wait" custom={direction}>
        {/* ─── STEP 1: LinkedIn URL ─── */}
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
            <TopBar
              title="Generate Voice Profile"
              onBack={() =>
                router.push(`${basePath}/${courseSlug}`)
              }
            />
            <ProgressBar step={1} />

            <div className="mx-auto max-w-[560px] px-5 pb-32 pt-8">
              <p className="text-[0.75rem] font-medium uppercase tracking-wider text-white/40">
                Step 1 of 3
              </p>
              <h2 className="mt-3 text-[1.3rem] font-bold leading-tight">
                Paste your LinkedIn profile URL
              </h2>
              <p className="mt-2 text-[0.85rem] text-white/50">
                We&apos;ll scrape your profile to understand your background and
                role.
              </p>

              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your-name"
                className="mt-6 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[0.9rem] text-white placeholder:text-white/30 focus:border-orange-500/40 focus:outline-none"
              />
            </div>

            <BottomCTA
              onClick={() => goTo("step2")}
              disabled={!isValidLinkedinUrl}
            >
              Continue
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </BottomCTA>
          </motion.div>
        )}

        {/* ─── STEP 2: Post URLs ─── */}
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
            <TopBar
              title="Generate Voice Profile"
              onBack={() => goTo("step1", -1)}
            />
            <ProgressBar step={2} />

            <div className="mx-auto max-w-[560px] px-5 pb-32 pt-8">
              <p className="text-[0.75rem] font-medium uppercase tracking-wider text-white/40">
                Step 2 of 3
              </p>
              <h2 className="mt-3 text-[1.3rem] font-bold leading-tight">
                Add your best LinkedIn posts
              </h2>
              <p className="mt-2 text-[0.85rem] text-white/50">
                Paste 3-10 posts that sound most like you. Skip anything you
                wrote with AI help.
              </p>

              {/* Input row */}
              <div className="mt-6 flex gap-2">
                <input
                  type="url"
                  value={currentPostUrl}
                  onChange={(e) => setCurrentPostUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPost();
                    }
                  }}
                  placeholder="https://linkedin.com/posts/..."
                  className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-[0.85rem] text-white placeholder:text-white/30 focus:border-orange-500/40 focus:outline-none"
                />
                <button
                  onClick={addPost}
                  disabled={!canAddPost}
                  className={`h-12 shrink-0 rounded-xl px-5 text-[0.85rem] font-bold transition-all active:scale-[0.95] ${
                    canAddPost
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  Add
                </button>
              </div>

              {/* Count */}
              <p className="mt-3 text-[0.75rem] text-white/35">
                {postUrls.length}/10 posts added
                {postUrls.length < 3 && ` (${3 - postUrls.length} more needed)`}
              </p>

              {/* Post list */}
              {postUrls.length > 0 && (
                <div className="mt-4 space-y-2">
                  {postUrls.map((url, i) => (
                    <div
                      key={url}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.7rem] font-bold text-white/50">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-[0.8rem] text-white/50">
                        {url.replace(/https?:\/\/(www\.)?linkedin\.com\//, "")}
                      </span>
                      <button
                        onClick={() => removePost(url)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/30 transition-all hover:bg-white/10 hover:text-white/60"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <BottomCTA
              onClick={() => goTo("step3")}
              disabled={postUrls.length < 3}
            >
              Continue
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </BottomCTA>
          </motion.div>
        )}

        {/* ─── STEP 3: Preferences ─── */}
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
            <TopBar
              title="Generate Voice Profile"
              onBack={() => goTo("step2", -1)}
            />
            <ProgressBar step={3} />

            <div className="mx-auto max-w-[560px] px-5 pb-32 pt-8">
              <p className="text-[0.75rem] font-medium uppercase tracking-wider text-white/40">
                Step 3 of 3
              </p>
              <h2 className="mt-3 text-[1.3rem] font-bold leading-tight">
                Quick preferences
              </h2>
              <p className="mt-2 text-[0.85rem] text-white/50">
                Help us calibrate the output to your goals.
              </p>

              <div className="mt-8 space-y-8">
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

                <div>
                  <p className="mb-3 text-[0.85rem] font-semibold text-white/70">
                    Describe your voice in one line (optional)
                  </p>
                  <input
                    type="text"
                    value={tonePrinciple}
                    onChange={(e) => setTonePrinciple(e.target.value)}
                    placeholder='e.g. "No jargon, like explaining to a smart friend"'
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[0.85rem] text-white placeholder:text-white/30 focus:border-orange-500/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <BottomCTA
              onClick={handleGenerate}
              disabled={
                targetReaders.length === 0 ||
                postingObjectives.length === 0 ||
                postTypes.length === 0
              }
            >
              Generate My Voice Files
            </BottomCTA>
          </motion.div>
        )}

        {/* ─── LOADING ─── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[100dvh] flex-col items-center justify-center px-8"
          >
            <span className="text-4xl">✍️</span>
            <h2 className="mt-6 text-[1.2rem] font-bold">
              Analyzing your writing style...
            </h2>

            <div className="mt-8 w-full max-w-[320px] space-y-3">
              {LOADING_STEPS.map((step, i) => {
                const isDone = loadingStep > i;
                const isCurrent = loadingStep === i;
                return (
                  <div key={step} className="flex items-center gap-3">
                    {isDone ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isCurrent ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-white/15" />
                    )}
                    <span
                      className={`text-[0.85rem] ${
                        isDone
                          ? "text-white/40"
                          : isCurrent
                            ? "text-white/80"
                            : "text-white/25"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-[0.75rem] text-white/30">
              Usually takes about 30 seconds
            </p>

            {error && (
              <div className="mt-6 w-full max-w-[320px]">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-[0.85rem] text-red-400">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    goTo("step3", -1);
                  }}
                  className="mt-3 flex h-[44px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[0.85rem] font-semibold text-white/70 transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── RESULTS ─── */}
        {phase === "results" && files && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TopBar
              title="Your Voice Profile"
              onBack={() =>
                router.push(`${basePath}/${courseSlug}`)
              }
            />

            <div className="mx-auto max-w-[560px] px-5 pb-16 pt-6">
              <p className="text-[0.85rem] leading-relaxed text-white/50">
                Review and edit before saving. These should sound like someone
                accurately describing your writing.
              </p>

              {/* File previews */}
              <div className="mt-6 space-y-4">
                <FilePreview
                  filename="voice-profile.md"
                  icon="📋"
                  content={files.voiceProfile}
                  onContentChange={updateFile("voiceProfile")}
                />
                <FilePreview
                  filename="banned-phrases.md"
                  icon="🚫"
                  content={files.bannedPhrases}
                  onContentChange={updateFile("bannedPhrases")}
                />
                <FilePreview
                  filename="claude-project-instructions.md"
                  icon="⚙️"
                  content={files.projectInstructions}
                  onContentChange={updateFile("projectInstructions")}
                />
                <FilePreview
                  filename="my-best-posts.md"
                  icon="📝"
                  content={files.bestPosts}
                  onContentChange={updateFile("bestPosts")}
                />
              </div>

              {/* Download all */}
              <button
                onClick={handleDownloadAll}
                className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-[0.95rem] font-bold text-white/80 transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download All 4 Files
              </button>

              {/* Setup guide */}
              <div className="mt-12 border-t border-white/10 pt-8">
                <SetupGuide
                  userName={userName}
                  projectInstructions={files.projectInstructions}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
