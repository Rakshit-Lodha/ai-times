"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwipeDeck from "@/components/SwipeDeck";
import StackGrid from "@/components/StackGrid";
import { type Article } from "@/components/StoryCard";
import { type StackPreview } from "@/components/StackPreviewCard";

type Section = "news" | "learn";

type HomeShellProps = {
  articles: Article[];
  stacks: StackPreview[];
  startIndex?: number;
  initialTodayFilter?: boolean;
};

export default function HomeShell({ articles, stacks, startIndex, initialTodayFilter = false }: HomeShellProps) {
  const [section, setSection] = useState<Section>("news");
  const [pastIntro, setPastIntro] = useState(false);

  // Restore section from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("krux-section");
    if (saved === "learn" || saved === "news") {
      setSection(saved);
    }
  }, []);

  const handleSectionChange = useCallback((newSection: Section) => {
    setSection(newSection);
    sessionStorage.setItem("krux-section", newSection);
  }, []);

  const showSwitcher = pastIntro || section === "learn";

  return (
    <>
      {/* Section switcher */}
      <AnimatePresence>
        {showSwitcher && (
          <motion.div
            initial={{ opacity: 0, y: -44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -44 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed top-0 left-0 right-0 z-[60] flex h-[52px] items-center justify-center gap-2 px-4"
            style={{
              background: "linear-gradient(to bottom, rgba(8,8,8,0.97), rgba(8,8,8,0.88))",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <button
              onClick={() => handleSectionChange("news")}
              className={`rounded-full px-5 py-1.5 text-[0.85rem] font-semibold transition-colors duration-200 ${
                section === "news"
                  ? "bg-white/15 text-white"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              News
            </button>
            <button
              onClick={() => handleSectionChange("learn")}
              className={`rounded-full px-5 py-1.5 text-[0.85rem] font-semibold transition-colors duration-200 ${
                section === "learn"
                  ? "bg-white/15 text-white"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              Learn
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {section === "news" ? (
        <SwipeDeck
          articles={articles}
          startIndex={startIndex}
          initialTodayFilter={initialTodayFilter}
          onPassIntro={() => setPastIntro(true)}
          topBarOffset={showSwitcher ? 52 : 0}
        />
      ) : (
        <div className={showSwitcher ? "pt-[52px]" : ""}>
          <StackGrid stacks={stacks} />
        </div>
      )}
    </>
  );
}
