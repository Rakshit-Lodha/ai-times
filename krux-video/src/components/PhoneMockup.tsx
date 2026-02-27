import React from "react";
import { tokens } from "../lib/tokens";

type Props = {
  children: React.ReactNode;
  scale?: number;
};

export const PhoneMockup: React.FC<Props> = ({ children, scale = 1 }) => {
  return (
    <div
      style={{
        width: 280 * scale,
        height: 560 * scale,
        borderRadius: 40 * scale,
        border: `3px solid rgba(255,255,255,0.2)`,
        background: tokens.bg,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div
        style={{
          width: 120 * scale,
          height: 28 * scale,
          background: "#000",
          borderRadius: `0 0 ${20 * scale}px ${20 * scale}px`,
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      />
      {/* Screen content */}
      <div
        style={{
          position: "absolute",
          top: 28 * scale,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
