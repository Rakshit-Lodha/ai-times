import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "KRUX - Everything about AI in 100 words";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Load Inter Black font
  const interBlack = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZ1rib2Bg-4.ttf")
  ).then((res) => res.arrayBuffer());

  // Load Inter Medium for tagline
  const interMedium = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZ1rib2Bg-4.ttf")
  ).then((res) => res.arrayBuffer());

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
          background: "linear-gradient(135deg, #0f1729 0%, #0a0f1a 50%, #050508 100%)",
          position: "relative",
        }}
      >
        {/* Orange orb - top left */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)",
          }}
        />
        {/* Blue orb - top right */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
          }}
        />
        {/* Purple orb - bottom center */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "30%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
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
          {/* "Introducing" text */}
          <div
            style={{
              fontSize: "28px",
              fontFamily: "Inter",
              fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
              marginBottom: "16px",
            }}
          >
            Introducing
          </div>

          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Inter",
              fontSize: "160px",
              fontWeight: 900,
              letterSpacing: "-6px",
            }}
          >
            <span style={{ color: "#ffffff" }}>KRUX</span>
            <span style={{ color: "#f97316" }}>.</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              marginTop: "20px",
              fontSize: "32px",
              fontFamily: "Inter",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 500,
            }}
          >
            Everything about AI in 100 words
          </div>

          {/* Subtle divider line */}
          <div
            style={{
              marginTop: "40px",
              width: "120px",
              height: "3px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, #f97316 0%, #fbbf24 100%)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interBlack,
          style: "normal",
          weight: 900,
        },
        {
          name: "Inter",
          data: interMedium,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
