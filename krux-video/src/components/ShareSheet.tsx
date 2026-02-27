import React from "react";
import { tokens } from "../lib/tokens";

const shareOptions = [
  { name: "WhatsApp", color: "#25D366", icon: "W" },
  { name: "X", color: "#ffffff", icon: "X" },
  { name: "LinkedIn", color: "#0A66C2", icon: "in" },
  { name: "Copy", color: "#888888", icon: "🔗" },
];

export const ShareSheet: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(20,20,30,0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px 20px 0 0",
        padding: "20px 16px",
        border: `1px solid ${tokens.border}`,
        borderBottom: "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 4,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 2,
          margin: "0 auto 16px",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {shareOptions.map((opt) => (
          <div
            key={opt.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: opt.color,
                fontFamily: tokens.fontSans,
              }}
            >
              {opt.icon}
            </div>
            <span
              style={{
                fontSize: 10,
                color: tokens.textSecondary,
                fontFamily: tokens.fontSans,
              }}
            >
              {opt.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
