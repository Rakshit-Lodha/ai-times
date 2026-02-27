import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const BackgroundOrbs: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Orange orb */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,115,22,0.06), transparent 70%)",
          top: `${30 + Math.sin(frame * 0.01) * 5}%`,
          left: `${20 + Math.cos(frame * 0.008) * 3}%`,
          filter: "blur(80px)",
        }}
      />
      {/* Blue orb */}
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%)",
          bottom: `${20 + Math.cos(frame * 0.012) * 4}%`,
          right: `${15 + Math.sin(frame * 0.009) * 3}%`,
          filter: "blur(80px)",
        }}
      />
    </AbsoluteFill>
  );
};
