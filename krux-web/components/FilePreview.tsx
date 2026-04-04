"use client";

import { useState } from "react";

type FilePreviewProps = {
  filename: string;
  icon: string;
  content: string;
  onContentChange: (newContent: string) => void;
};

export default function FilePreview({
  filename,
  icon,
  content,
  onContentChange,
}: FilePreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [copied, setCopied] = useState(false);

  const previewLines = content.split("\n").slice(0, 5).join("\n");
  const isLong = content.split("\n").length > 5;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onContentChange(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(content);
    setEditing(false);
  };

  const startEditing = () => {
    setDraft(content);
    setExpanded(true);
    setEditing(true);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="text-lg">{icon}</span>
        <span className="flex-1 text-[0.85rem] font-semibold text-white/80">
          {filename}
        </span>

        <div className="flex gap-1.5">
          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60 active:scale-90"
            title="Copy"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>

          {/* Edit */}
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60 active:scale-90"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60 active:scale-90"
            title="Download"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="border-t border-white/5 px-4 py-3">
        {editing ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[300px] rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-[0.8rem] leading-relaxed text-white/70 placeholder:text-white/30 focus:border-orange-500/40 focus:outline-none resize-y"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="h-9 rounded-xl border border-white/15 bg-white/5 px-4 text-[0.8rem] font-medium text-white/60 transition-all hover:bg-white/10 active:scale-[0.95]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-9 rounded-xl bg-orange-500 px-4 text-[0.8rem] font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.95]"
              >
                Save changes
              </button>
            </div>
          </>
        ) : (
          <>
            <pre className="whitespace-pre-wrap text-[0.8rem] leading-relaxed text-white/50">
              {expanded ? content : previewLines}
              {!expanded && isLong && "..."}
            </pre>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-[0.75rem] font-medium text-orange-400/80 transition-all hover:text-orange-400"
              >
                {expanded ? "Show less" : "Show all"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
