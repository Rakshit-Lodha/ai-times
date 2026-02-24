import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing the route
const mockRange = vi.fn();
const mockEq = vi.fn(() => ({ range: mockRange }));
const mockOrder = vi.fn(() => ({ range: mockRange, eq: mockEq }));
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

import { GET } from "../route";
import { NextRequest } from "next/server";

function makeRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRange.mockResolvedValue({ data: [], error: null });
});

describe("GET /api/articles", () => {
  it("selects topic in the query", async () => {
    await GET(makeRequest("/api/articles?offset=0"));

    expect(mockFrom).toHaveBeenCalledWith("hundred_word_articles");
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("topic")
    );
  });

  it("does not apply topic filter when no topic param", async () => {
    await GET(makeRequest("/api/articles?offset=0"));

    expect(mockEq).not.toHaveBeenCalled();
    expect(mockRange).toHaveBeenCalledWith(0, 19);
  });

  it("applies topic filter for valid slugs", async () => {
    const cases = [
      { slug: "for-work", dbValue: "Workflow Improvement" },
      { slug: "funding", dbValue: "Funding" },
      { slug: "reports", dbValue: "Reports" },
      { slug: "others", dbValue: "Others" },
    ];

    for (const { slug, dbValue } of cases) {
      vi.clearAllMocks();
      mockRange.mockResolvedValue({ data: [], error: null });

      await GET(makeRequest(`/api/articles?offset=0&topic=${slug}`));

      expect(mockEq).toHaveBeenCalledWith("topic", dbValue);
    }
  });

  it("ignores invalid topic slugs", async () => {
    await GET(makeRequest("/api/articles?offset=0&topic=invalid-slug"));

    expect(mockEq).not.toHaveBeenCalled();
  });

  it("respects offset parameter", async () => {
    await GET(makeRequest("/api/articles?offset=20"));

    expect(mockRange).toHaveBeenCalledWith(20, 39);
  });

  it("returns hasMore=true when batch is full", async () => {
    const fullBatch = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    mockRange.mockResolvedValue({ data: fullBatch, error: null });

    const res = await GET(makeRequest("/api/articles?offset=0"));
    const json = await res.json();

    expect(json.hasMore).toBe(true);
  });

  it("returns hasMore=false when batch is partial", async () => {
    mockRange.mockResolvedValue({ data: [{ id: 1 }], error: null });

    const res = await GET(makeRequest("/api/articles?offset=0"));
    const json = await res.json();

    expect(json.hasMore).toBe(false);
  });

  it("returns 500 on supabase error", async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: "DB down" } });

    const res = await GET(makeRequest("/api/articles?offset=0"));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("DB down");
  });
});
