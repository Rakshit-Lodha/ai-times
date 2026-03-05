import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryCard from "../StoryCard";
import type { Article } from "../StoryCard";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, placeholder, blurDataURL, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// Mock lib/gesture
vi.mock("@/lib/gesture", () => ({
  detectGestureDirection: () => "undecided",
}));

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 1,
    headline: "Test Article",
    output: "Test output content for the article.",
    news_date: "2026-02-24",
    image_url: null,
    sources: [],
    topic: null,
    ...overrides,
  };
}

// Helper to freeze "now" for date-relative tests
function withFrozenDate(dateStr: string, fn: () => void) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(dateStr));
  try {
    fn();
  } finally {
    vi.useRealTimers();
  }
}

describe("StoryCard date display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays created_at date when available", () => {
    withFrozenDate("2026-03-05T12:00:00", () => {
      const article = makeArticle({
        news_date: "2026-02-24",
        created_at: "2026-03-05T10:00:00+00:00",
      });
      render(<StoryCard article={article} />);
      // created_at is today (March 5), should show "Today"
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });

  it("falls back to news_date when created_at is null", () => {
    withFrozenDate("2026-02-24T12:00:00", () => {
      const article = makeArticle({
        news_date: "2026-02-24",
        created_at: null,
      });
      render(<StoryCard article={article} />);
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });

  it("falls back to news_date when created_at is undefined", () => {
    withFrozenDate("2026-02-24T12:00:00", () => {
      const article = makeArticle({
        news_date: "2026-02-24",
        created_at: undefined,
      });
      render(<StoryCard article={article} />);
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });

  it("shows 'Yesterday' for created_at from yesterday", () => {
    withFrozenDate("2026-03-05T12:00:00", () => {
      // Use a time that stays on March 4 in any timezone up to UTC+12
      const article = makeArticle({
        news_date: "2026-02-20",
        created_at: "2026-03-04T10:00:00+00:00",
      });
      render(<StoryCard article={article} />);
      expect(screen.getByText("Yesterday")).toBeInTheDocument();
    });
  });

  it("shows formatted date for older created_at timestamps", () => {
    withFrozenDate("2026-03-05T12:00:00", () => {
      const article = makeArticle({
        news_date: "2026-01-01",
        created_at: "2026-02-15T08:00:00+00:00",
      });
      render(<StoryCard article={article} />);
      expect(screen.getByText("Feb 15")).toBeInTheDocument();
    });
  });

  it("shows formatted date for older news_date (no created_at)", () => {
    withFrozenDate("2026-03-05T12:00:00", () => {
      const article = makeArticle({
        news_date: "2026-01-10",
        created_at: null,
      });
      render(<StoryCard article={article} />);
      expect(screen.getByText("Jan 10")).toBeInTheDocument();
    });
  });

  it("prefers created_at over news_date even when news_date is newer", () => {
    // Edge case: news_date could theoretically be "today" but created_at is older
    withFrozenDate("2026-03-05T12:00:00", () => {
      const article = makeArticle({
        news_date: "2026-03-05", // today
        created_at: "2026-03-01T10:00:00+00:00", // 4 days ago
      });
      render(<StoryCard article={article} />);
      expect(screen.getByText("Mar 1")).toBeInTheDocument();
    });
  });

  it("handles ISO timestamps with timezone offsets correctly", () => {
    withFrozenDate("2026-03-05T12:00:00", () => {
      const article = makeArticle({
        created_at: "2026-03-05T05:30:00+05:30", // IST, which is midnight UTC = still Mar 5
      });
      render(<StoryCard article={article} />);
      // Should parse without crashing and show a valid date
      const datePill = screen.getByText(/Today|Mar 5|Mar 4/);
      expect(datePill).toBeInTheDocument();
    });
  });

  it("handles invalid date strings gracefully", () => {
    const article = makeArticle({
      news_date: "not-a-date",
      created_at: null,
    });
    render(<StoryCard article={article} />);
    // Should fall back to raw string
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });
});
