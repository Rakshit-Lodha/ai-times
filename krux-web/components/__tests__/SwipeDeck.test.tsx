import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SwipeDeck from "../SwipeDeck";
import type { Article } from "../StoryCard";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, placeholder, blurDataURL, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock framer-motion — keep motion divs but skip animations
vi.mock("framer-motion", async () => {
  const React = await import("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          return React.forwardRef((props: Record<string, unknown>, ref) => {
            const {
              drag, dragElastic, onDragEnd, onPointerDown, whileTap,
              initial, animate: _animate, exit, transition,
              ...rest
            } = props;
            const Tag = prop as keyof JSX.IntrinsicElements;
            return React.createElement(Tag, { ...rest, ref } as Record<string, unknown>);
          });
        },
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: (init: number) => ({
      get: () => init,
      set: vi.fn(),
      onChange: () => () => {},
    }),
    useTransform: () => 0,
    animate: vi.fn().mockResolvedValue(undefined),
    PanInfo: {},
  };
});

// Mock StoryCard
vi.mock("@/components/StoryCard", () => ({
  default: ({ article }: { article: Article }) => (
    <div data-testid={`story-card-${article.id}`}>
      <h2>{article.headline}</h2>
    </div>
  ),
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

const sampleArticles: Article[] = [
  makeArticle({ id: 1, headline: "Article One", topic: "Funding" }),
  makeArticle({ id: 2, headline: "Article Two", topic: "Workflow Improvement" }),
  makeArticle({ id: 3, headline: "Article Three", topic: "Others" }),
];

// Default fetch mock that handles the lazy-load useEffect
function defaultFetchMock() {
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ articles: [], hasMore: false }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = defaultFetchMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SwipeDeck", () => {
  describe("Category Filter Pills", () => {
    it("does NOT show pills on the intro card (index=0)", async () => {
      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} />);
      });

      expect(screen.queryByText("My Feed")).not.toBeInTheDocument();
      expect(screen.queryByText("For Work")).not.toBeInTheDocument();
    });

    it("shows pills when starting past intro (startIndex > 0)", async () => {
      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} startIndex={1} />);
      });

      expect(screen.getByText("My Feed")).toBeInTheDocument();
      expect(screen.getByText("For Work")).toBeInTheDocument();
      expect(screen.getByText("Funding")).toBeInTheDocument();
      expect(screen.getByText("Reports")).toBeInTheDocument();
      expect(screen.getByText("Others")).toBeInTheDocument();
    });

    it("highlights 'My Feed' pill by default", async () => {
      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} startIndex={1} />);
      });

      const myFeedBtn = screen.getByText("My Feed");
      expect(myFeedBtn.className).toContain("text-orange-400");
    });

    it("renders exactly 5 topic pills", async () => {
      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} startIndex={1} />);
      });

      const buttons = screen.getAllByRole("button").filter((btn) =>
        ["My Feed", "For Work", "Funding", "Reports", "Others"].includes(
          btn.textContent || ""
        )
      );
      expect(buttons).toHaveLength(5);
    });

    it("fetches articles with topic param when a pill is clicked", async () => {
      const mockFetch = defaultFetchMock();
      global.fetch = mockFetch;

      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} startIndex={1} />);
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Funding"));
        await new Promise((r) => setTimeout(r, 300));
      });

      const calls = mockFetch.mock.calls.map((c: string[][]) => c[0]);
      expect(calls).toContainEqual(
        expect.stringContaining("topic=funding")
      );
    });

    it("does not make a topic-change fetch when clicking the already-selected pill", async () => {
      const mockFetch = defaultFetchMock();
      global.fetch = mockFetch;

      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} startIndex={1} />);
      });

      // Clear calls from lazy-load useEffect
      mockFetch.mockClear();

      await act(async () => {
        fireEvent.click(screen.getByText("My Feed"));
      });

      // No additional fetch should happen — "My Feed" is already selected
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("sends no topic param when switching back to 'My Feed'", async () => {
      const mockFetch = defaultFetchMock();
      global.fetch = mockFetch;

      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} startIndex={1} />);
      });

      // Switch to Funding
      await act(async () => {
        fireEvent.click(screen.getByText("Funding"));
        await new Promise((r) => setTimeout(r, 300));
      });

      mockFetch.mockClear();

      // Switch back to My Feed
      await act(async () => {
        fireEvent.click(screen.getByText("My Feed"));
        await new Promise((r) => setTimeout(r, 300));
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/articles?offset=0");
    });
  });

  describe("Empty state", () => {
    it("shows empty state message when category has no articles", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ articles: [], hasMore: false }),
      });
      global.fetch = mockFetch;

      await act(async () => {
        render(<SwipeDeck articles={sampleArticles} startIndex={1} />);
      });

      // Switch to a category that returns empty
      await act(async () => {
        fireEvent.click(screen.getByText("For Work"));
        await new Promise((r) => setTimeout(r, 300));
      });

      expect(screen.getByText("No stories here yet")).toBeInTheDocument();
      expect(screen.getByText("My Feed")).toBeInTheDocument(); // pills still visible
    });
  });

  describe("Deck container height adjustment", () => {
    it("uses full viewport height on intro card", async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(<SwipeDeck articles={sampleArticles} />);
        container = result.container;
      });

      const deckContainer = container!.querySelector("[class*='md:rounded-3xl']");
      expect(deckContainer?.className).toContain("h-[100dvh]");
      expect(deckContainer?.className).not.toContain("mt-[52px]");
    });

    it("adjusts height for pill bar when past intro", async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(
          <SwipeDeck articles={sampleArticles} startIndex={1} />
        );
        container = result.container;
      });

      const deckContainer = container!.querySelector("[class*='md:rounded-3xl']");
      expect(deckContainer?.className).toContain("h-[calc(100dvh-52px)]");
      expect(deckContainer?.className).toContain("mt-[52px]");
    });
  });
});
