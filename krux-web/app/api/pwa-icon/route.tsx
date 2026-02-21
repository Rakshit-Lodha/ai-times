import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get("size");
  const size = sizeParam === "512" ? 512 : 192;

  const fontSize = size === 512 ? 320 : 120;
  const dotSize = size === 512 ? 340 : 130;
  const marginLeft = size === 512 ? -20 : -8;
  const borderRadius = size === 512 ? 100 : 38;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f1729 0%, #050508 100%)",
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: `${fontSize}px`,
            fontWeight: 900,
          }}
        >
          <span style={{ color: "#ffffff" }}>K</span>
          <span style={{ color: "#f97316", fontSize: `${dotSize}px`, marginLeft: `${marginLeft}px` }}>.</span>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
