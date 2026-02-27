import React from "react";
import { AbsoluteFill } from "remotion";

type Props = {
  direction: "left" | "right";
  color: string;
  opacity: number;
};

export const GlowOverlay: React.FC<Props> = ({
  direction,
  color,
  opacity,
}) => {
  const isLeft = direction === "left";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          [isLeft ? "left" : "right"]: 0,
          top: 0,
          bottom: 0,
          width: "40%",
          background: `linear-gradient(to ${isLeft ? "right" : "left"}, ${color.replace(")", `,${opacity})`)}, transparent)`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};
