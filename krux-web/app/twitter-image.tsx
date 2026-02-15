import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "KRUX - Everything about AI in 100 words";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0f1a 0%, #050508 100%)",
          position: "relative",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: "140px",
              fontWeight: 900,
              letterSpacing: "-4px",
            }}
          >
            <span style={{ color: "#ffffff" }}>KRUX</span>
            <span style={{ color: "#f97316" }}>.</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              marginTop: "24px",
              fontSize: "36px",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}
          >
            Everything about AI in 100 words
          </div>

          {/* Divider */}
          <div
            style={{
              marginTop: "48px",
              width: "200px",
              height: "4px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, #f97316 0%, #facc15 100%)",
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              marginTop: "32px",
              fontSize: "24px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Swipe through AI news
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
