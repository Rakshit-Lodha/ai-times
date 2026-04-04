"use client";

import { useState } from "react";

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
    <div>
      <p className="mb-3 text-[0.85rem] font-semibold text-white/70">{label}</p>

      <div className="flex flex-wrap gap-2">
        {/* Preset pills */}
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-xl border px-3.5 py-2 text-[0.8rem] font-medium transition-all active:scale-[0.95] ${
                isSelected
                  ? "border-orange-500/40 bg-orange-500/20 text-orange-400"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
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
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/20 px-3.5 py-2 text-[0.8rem] font-medium text-orange-400 transition-all active:scale-[0.95]"
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
            className="rounded-xl border border-dashed border-white/20 bg-transparent px-3.5 py-2 text-[0.8rem] font-medium text-white/40 transition-all hover:border-white/30 hover:text-white/60 active:scale-[0.95]"
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
            className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-[0.85rem] text-white placeholder:text-white/30 focus:border-orange-500/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={addCustom}
            className="h-10 rounded-xl bg-orange-500 px-4 text-[0.8rem] font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.95]"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setCustomInput("");
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:bg-white/10"
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
