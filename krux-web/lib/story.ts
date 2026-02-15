export type StorySource = {
  name?: string;
  url?: string;
};

export function normalizeText(value: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildStorySlug(id: number | string, headline: string): string {
  const slug = slugify(headline) || "story";
  return `${id}-${slug}`;
}

export function buildStoryPath(id: number | string, headline: string): string {
  return `/story/${buildStorySlug(id, headline)}`;
}

export function extractStoryId(slugValue: string): number | null {
  const match = slugValue.match(/^(\d+)(?:-.+)?$/);
  if (!match) return null;

  const storyId = Number(match[1]);
  return Number.isFinite(storyId) ? storyId : null;
}

export function getFirstWords(value: string, count: number): string {
  const text = normalizeText(value);
  if (!text) return "";

  const words = text.split(" ");
  if (words.length <= count) return text;
  return `${words.slice(0, count).join(" ")}...`;
}

export function parseSources(raw: unknown): StorySource[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter((item: StorySource) => Boolean(item?.name || item?.url));
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item: StorySource) => Boolean(item?.name || item?.url));
      }
      return [];
    } catch {
      return [];
    }
  }

  return [];
}

export function splitStorySections(value: string): {
  summary100: string;
  whatHappened: string;
  whyItMatters: string;
} {
  const text = normalizeText(value);
  const summary100 = getFirstWords(text, 110);

  const paragraphs = (value || "")
    .split(/\n+/)
    .map((paragraph) => normalizeText(paragraph))
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return {
      summary100,
      whatHappened: normalizeText(paragraphs.slice(0, -1).join(" ")),
      whyItMatters: paragraphs[paragraphs.length - 1],
    };
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return {
      summary100,
      whatHappened: text,
      whyItMatters: text,
    };
  }

  return {
    summary100,
    whatHappened: normalizeText(sentences.slice(0, Math.max(sentences.length - 1, 1)).join(" ")),
    whyItMatters: sentences[sentences.length - 1],
  };
}

export function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return "https://krux.news";
}
