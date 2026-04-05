import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { NextRequest } from "next/server";
import { POST } from "../route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/download-voice-files", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/download-voice-files", () => {
  it("returns a zip with all requested files", async () => {
    const response = await POST(
      makeRequest({
        files: {
          "voice-profile.md": "# Voice profile",
          "banned-phrases.md": "# Banned phrases",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/zip");
    expect(response.headers.get("Content-Disposition")).toContain("voice-files.zip");

    const buffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    expect(await zip.file("voice-profile.md")?.async("string")).toBe("# Voice profile");
    expect(await zip.file("banned-phrases.md")?.async("string")).toBe("# Banned phrases");
  });

  it("rejects empty payloads", async () => {
    const response = await POST(makeRequest({ files: {} }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Files payload is required.",
    });
  });
});
