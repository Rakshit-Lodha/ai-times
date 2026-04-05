import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

export const learnSansStyle: CSSProperties = {
  fontFamily: "var(--font-geist), sans-serif",
};

export const learnMonoStyle: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
};

export const learnGradient =
  "bg-[linear-gradient(180deg,#060b14_0%,#0d1724_100%)]";

export const learnCardClass =
  "rounded-[20px] border border-[#223449] bg-[#0f172a] shadow-[0_20px_60px_rgba(4,10,20,0.28)]";

export const learnSoftCardClass =
  "rounded-[18px] border border-[#223449] bg-[#101a2b]";

export const primaryButtonClass =
  "inline-flex h-[54px] items-center justify-center rounded-[14px] border border-[#60A5FA66] bg-[#3B82F6] px-5 text-[0.95rem] font-semibold text-white transition hover:bg-[#4a8ff7] active:scale-[0.98]";

export const secondaryButtonClass =
  "inline-flex h-[50px] items-center justify-center rounded-[14px] border border-white/15 bg-white/5 px-5 text-[0.92rem] font-semibold text-white/82 transition hover:bg-white/10 active:scale-[0.98]";

export function LearnViewport({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-[100dvh] ${learnGradient} text-white`} style={learnSansStyle}>
      <div className={`mx-auto w-full max-w-[390px] ${className}`}>{children}</div>
    </div>
  );
}

export function LearnScreenHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5">
      <h1 className="text-[30px] font-bold leading-[1.08] text-slate-50">{title}</h1>
      <p className="mt-2 text-[14px] leading-[1.45] text-slate-400">{description}</p>
    </div>
  );
}

export function LearnTopBar({
  title,
  left,
  right,
}: {
  title: string;
  left: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-[64px] items-center gap-3 px-5 backdrop-blur-xl">
      {left}
      <div className="min-w-0 flex-1 text-center">
        <span className="block truncate text-[14px] font-semibold text-white/70">
          {title}
        </span>
      </div>
      {right ?? <div className="h-9 w-9 shrink-0" />}
    </div>
  );
}

export function CircleIconButton({
  children,
  href,
  onClick,
  label,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  label: string;
}) {
  const className =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 active:scale-90";

  if (href) {
    return (
      <Link aria-label={label} href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button aria-label={label} type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"
      style={learnMonoStyle}
    >
      {children}
    </p>
  );
}

export function SummaryCard({
  status,
  metricA,
  metricB,
}: {
  status: string;
  metricA: string;
  metricB: string;
}) {
  return (
    <div className={`${learnCardClass} flex items-start justify-between p-4`}>
      <div>
        <SectionLabel>Status</SectionLabel>
        <p className="mt-1 text-[20px] font-bold text-slate-50">{status}</p>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-semibold text-slate-300">{metricA}</p>
        <p className="mt-1 text-[14px] font-semibold text-slate-300">{metricB}</p>
      </div>
    </div>
  );
}

export function LessonRow({
  title,
  meta,
  completed = false,
  href,
}: {
  title: string;
  meta: string;
  completed?: boolean;
  href?: string;
}) {
  const className = `flex items-center justify-between gap-4 rounded-[16px] border px-4 py-[14px] transition active:scale-[0.99] ${
    completed
      ? "border-[#1F6B45] bg-[#0D1B16]"
      : "border-[#223449] bg-[#0F172A] hover:bg-[#12203a]"
  }`;

  const content = (
    <>
      <p className="min-w-0 flex-1 text-[15px] font-semibold leading-[1.35] text-slate-50">
        {title}
      </p>
      <span
        className={`shrink-0 text-[12px] font-bold ${
          completed ? "text-emerald-300" : "text-sky-300"
        }`}
        style={learnMonoStyle}
      >
        {meta}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function ImplementationCard({
  href,
  emphasized = false,
}: {
  href: string;
  emphasized?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[18px] border p-4 transition hover:translate-y-[-1px] ${
        emphasized
          ? "border-[#3b82f666] bg-[#131E31]"
          : "border-[#27406A] bg-[#101A2B]"
      }`}
    >
      <h3 className="text-[18px] font-bold leading-[1.2] text-slate-50">
        Build your own LinkedIn system
      </h3>
      <p className="mt-2 text-[14px] leading-[1.45] text-slate-400">
        Open implementation anytime to generate the LinkedIn voice files and
        working setup directly.
      </p>
      <p className="mt-3 text-[14px] font-bold text-sky-300">Start Building Now</p>
    </Link>
  );
}

export function CompletionHero({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-[28px] border border-[#223449] px-5 py-6"
      style={{
        background:
          "linear-gradient(180deg, #131E31 0%, #0E1727 100%), radial-gradient(circle at 50% 10%, rgba(96,165,250,0.13) 0%, rgba(96,165,250,0) 70%)",
      }}
    >
      <div className="mx-auto flex w-fit items-center rounded-full bg-[#16233A] px-3 py-2">
        <span className="text-[12px] font-bold text-sky-200">Lesson completed</span>
      </div>
      <div className="mx-auto mt-4 flex h-[84px] w-[84px] items-center justify-center rounded-full border border-sky-400 bg-[linear-gradient(180deg,#1E3A5F_0%,#0B1320_100%)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="mt-5 text-center text-[32px] font-bold leading-[1.08] text-slate-50">
        {title}
      </h2>
      <p className="mt-3 text-center text-[15px] leading-[1.5] text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function NextStepCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={`${learnCardClass} p-4`}>
      <SectionLabel>Next</SectionLabel>
      <h3 className="mt-2 text-[20px] font-bold text-slate-50">{title}</h3>
      <p className="mt-2 text-[14px] leading-[1.45] text-slate-400">{description}</p>
    </div>
  );
}

export function FlowProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="h-1 w-full bg-white/5">
      <div
        className="h-full bg-[#3B82F6] transition-[width] duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

export function FileRow({
  name,
  description,
  onClick,
}: {
  name: string;
  description: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#16233A]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-white">{name}</p>
        <p className="mt-0.5 text-[12px] text-slate-400">{description}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${learnCardClass} flex w-full items-center gap-3 rounded-[14px] p-3 text-left transition hover:bg-[#14213b]`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`${learnCardClass} flex items-center gap-3 rounded-[14px] p-3`}>
      {content}
    </div>
  );
}

export function RecommendationCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#223449] bg-[#131E31] p-4">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300"
        style={learnMonoStyle}
      >
        Recommended
      </p>
      <h3 className="mt-2 text-[20px] font-bold text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-[1.45] text-white/60">{description}</p>
    </div>
  );
}
