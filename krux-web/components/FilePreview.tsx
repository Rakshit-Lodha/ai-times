"use client";

import { useState } from "react";
import {
  learnCardClass,
  learnMonoStyle,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/learn-ui";

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

  const startEditing = () => {
    setDraft(content);
    setExpanded(true);
    setEditing(true);
  };

  return (
    <div className={`${learnCardClass} overflow-hidden`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#16233A] text-base">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-white">{filename}</p>
          <p className="mt-0.5 text-[12px] text-slate-400">Preview, edit, or download</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-[12px] border border-[#223449] bg-[#101A2B] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300 transition hover:bg-[#16233A]"
            style={learnMonoStyle}
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-[12px] border border-[#223449] bg-[#101A2B] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300 transition hover:bg-[#16233A]"
            style={learnMonoStyle}
          >
            Save
          </button>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-4">
        {editing ? (
          <>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-[280px] w-full resize-y rounded-[14px] border border-[#223449] bg-[#08111e] p-4 text-[0.82rem] leading-[1.6] text-slate-200 focus:border-[#3b82f666] focus:outline-none"
              style={learnMonoStyle}
            />
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(content);
                  setEditing(false);
                }}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
              <button type="button" onClick={handleSave} className={primaryButtonClass}>
                Save changes
              </button>
            </div>
          </>
        ) : (
          <>
            <pre
              className="whitespace-pre-wrap text-[0.82rem] leading-[1.65] text-slate-300"
              style={learnMonoStyle}
            >
              {expanded ? content : previewLines}
              {!expanded && isLong && "..."}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={startEditing} className={secondaryButtonClass}>
                Edit file
              </button>
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className={secondaryButtonClass}
                >
                  {expanded ? "Show less" : "Show all"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
