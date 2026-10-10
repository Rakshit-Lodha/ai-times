import { describe, it, expect, vi, beforeEach } from "vitest";

const mockListArticles = vi.fn();

vi.mock("@/lib/db", () => ({
  listArticles: (...args: unknown[]) => mockListArticles(...args),
}));

import { GET } from "../route";
import { NextRequest } from "next/server";

function makeRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockListArticles.mockReturnValue([]);
});

describe("GET /api/articles", () => {
  it("does not apply topic filter when no topic param", async () => {
    await GET(makeRequest("/api/articles?offset=0"));

    expect(mockListArticles).toHaveBeenCalledWith(
      expect.objectContaining({ topic: undefined, offset: 0, limit: 20 })
    );
  });

  it("applies topic filter for valid slugs", async () => {
    const cases = [
      { slug: "for-work", dbValue: "Workflow improvement" },
      { slug: "funding", dbValue: "Funding" },
      { slug: "reports", dbValue: "Report" },
      { slug: "others", dbValue: "Others" },
    ];

    for (const { slug, dbValue } of cases) {
      mockListArticles.mockClear();
      await GET(makeRequest(`/api/articles?offset=0&topic=${slug}`));

      expect(mockListArticles).toHaveBeenCalledWith(
        expect.objectContaining({ topic: dbValue })
      );
    }
  });

  it("ignores invalid topic slugs", async () => {
    await GET(makeRequest("/api/articles?offset=0&topic=invalid-slug"));

    expect(mockListArticles).toHaveBeenCalledWith(
      expect.objectContaining({ topic: undefined })
    );
  });

  it("applies the today filter", async () => {
    await GET(makeRequest("/api/articles?offset=0&today=1"));

    expect(mockListArticles).toHaveBeenCalledWith(
      expect.objectContaining({ since: expect.any(String) })
    );
  });

  it("respects offset parameter", async () => {
    await GET(makeRequest("/api/articles?offset=20"));

    expect(mockListArticles).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 20, limit: 20 })
    );
  });

  it("returns hasMore=true when batch is full", async () => {
    mockListArticles.mockReturnValue(Array.from({ length: 20 }, (_, i) => ({ id: i })));

    const res = await GET(makeRequest("/api/articles?offset=0"));
    const json = await res.json();

    expect(json.hasMore).toBe(true);
  });

  it("returns hasMore=false when batch is partial", async () => {
    mockListArticles.mockReturnValue([{ id: 1 }]);

    const res = await GET(makeRequest("/api/articles?offset=0"));
    const json = await res.json();

    expect(json.hasMore).toBe(false);
  });
});
