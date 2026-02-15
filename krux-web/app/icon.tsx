import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: "22px",
            fontWeight: 900,
            letterSpacing: "-1px",
          }}
        >
          <span style={{ color: "#ffffff" }}>K</span>
          <span style={{ color: "#f97316", fontSize: "24px", marginLeft: "-2px" }}>.</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
