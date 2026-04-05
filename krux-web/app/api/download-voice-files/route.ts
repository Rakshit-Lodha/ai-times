import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

type DownloadRequestBody = {
  files?: Record<string, string>;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DownloadRequestBody;
    const files = body.files;

    if (!files || typeof files !== "object" || Object.keys(files).length === 0) {
      return NextResponse.json(
        { error: "Files payload is required." },
        { status: 400 },
      );
    }

    const zip = new JSZip();

    for (const [name, content] of Object.entries(files)) {
      if (!name || typeof content !== "string") {
        return NextResponse.json(
          { error: "Invalid files payload." },
          { status: 400 },
        );
      }

      zip.file(name, content);
    }

    const archive = await zip.generateAsync({ type: "uint8array" });

    return new NextResponse(archive, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="voice-files.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to build download." },
      { status: 500 },
    );
  }
}
