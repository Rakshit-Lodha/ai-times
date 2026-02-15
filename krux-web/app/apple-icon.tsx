import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0f1a 0%, #050508 100%)",
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: "120px",
            fontWeight: 900,
            letterSpacing: "-4px",
          }}
        >
          <span style={{ color: "#ffffff" }}>K</span>
          <span style={{ color: "#f97316", fontSize: "130px", marginLeft: "-8px" }}>.</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
