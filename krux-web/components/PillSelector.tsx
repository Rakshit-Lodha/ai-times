"use client";

import { useState } from "react";
import { learnMonoStyle } from "@/components/learn-ui";

type PillSelectorProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
};

export default function PillSelector({
  label,
  options,
  selected,
  onChange,
  allowCustom = true,
  placeholder = "Type and press Add",
}: PillSelectorProps) {
  const [customInput, setCustomInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    onChange([...selected, trimmed]);
    setCustomInput("");
  };

  const removeCustom = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const customEntries = selected.filter((s) => !options.includes(s));

  return (
    <div className="rounded-[14px] border border-[#223449] bg-[#0F172A] p-[14px]">
      <p
        className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400"
        style={learnMonoStyle}
      >
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {/* Preset pills */}
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-[12px] border px-3.5 py-2 text-[0.8rem] font-medium transition-all active:scale-[0.95] ${
                isSelected
                  ? "border-[#3b82f666] bg-[#16233A] text-sky-200"
                  : "border-[#223449] bg-[#101A2B] text-slate-300 hover:bg-[#16233A]"
              }`}
            >
              {option}
            </button>
          );
        })}

        {/* Custom entry pills */}
        {customEntries.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => removeCustom(entry)}
            className="flex items-center gap-1.5 rounded-[12px] border border-[#3b82f666] bg-[#16233A] px-3.5 py-2 text-[0.8rem] font-medium text-sky-200 transition-all active:scale-[0.95]"
          >
            {entry}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ))}

        {/* "+ Other" pill */}
        {allowCustom && !showInput && (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="rounded-[12px] border border-dashed border-slate-600 bg-transparent px-3.5 py-2 text-[0.8rem] font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-slate-300 active:scale-[0.95]"
          >
            + Other
          </button>
        )}
      </div>

      {/* Custom input row */}
      {allowCustom && showInput && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={placeholder}
            className="h-10 flex-1 rounded-[12px] border border-[#223449] bg-[#101A2B] px-3 text-[0.85rem] text-white placeholder:text-white/30 focus:border-[#3b82f666] focus:outline-none"
          />
          <button
            type="button"
            onClick={addCustom}
            className="h-10 rounded-[12px] border border-[#60A5FA66] bg-[#3B82F6] px-4 text-[0.8rem] font-bold text-white transition-all hover:bg-[#4a8ff7] active:scale-[0.95]"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setCustomInput("");
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#223449] bg-[#101A2B] text-slate-400 transition-all hover:bg-[#16233A]"
          >
            <svg
              width="14"
              height="14"
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
      )}
    </div>
  );
}
