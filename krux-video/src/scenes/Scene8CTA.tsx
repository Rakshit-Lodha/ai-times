import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { tokens } from "../lib/tokens";

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scales in (frames 0-40)
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Pulsing glow
  const pulse = Math.sin(frame * 0.08) * 0.15 + 0.85;

  // Tagline types in (frames 50-90)
  const tagline = "Everything about AI. 100 words.";
  const taglineChars = tagline.split("");
  const charsVisible = Math.floor(
    interpolate(frame, [50, 100], [0, taglineChars.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // URL fades in (frames 110-130)
  const urlOpacity = interpolate(frame, [110, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlY = interpolate(frame, [110, 125], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // WhatsApp CTA fades in (frames 140-160)
  const whatsappOpacity = interpolate(frame, [140, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Pulsing orange glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tokens.accentGlow}, transparent 70%)`,
          opacity: pulse,
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoSpring})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: tokens.textPrimary,
            fontFamily: tokens.fontSans,
            letterSpacing: 8,
          }}
        >
          KRUX
        </div>
      </div>

      {/* Tagline — typewriter */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 28,
          fontWeight: 600,
          color: tokens.textPrimary,
          fontFamily: tokens.fontSans,
          whiteSpace: "nowrap",
        }}
      >
        {taglineChars.slice(0, charsVisible).join("")}
        {frame >= 50 && frame < 100 && (
          <span
            style={{
              opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
              color: tokens.accent,
            }}
          >
            |
          </span>
        )}
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          top: "66%",
          left: "50%",
          transform: `translateX(-50%) translateY(${urlY}px)`,
          opacity: urlOpacity,
          fontSize: 36,
          fontWeight: 700,
          color: tokens.accent,
          fontFamily: tokens.fontSans,
          letterSpacing: 2,
        }}
      >
        krux.news
      </div>

      {/* WhatsApp CTA */}
      <div
        style={{
          position: "absolute",
          top: "76%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: whatsappOpacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 24px",
          borderRadius: 30,
          background: "rgba(37,211,102,0.15)",
          border: "1px solid rgba(37,211,102,0.3)",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            background: "#25D366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "#fff",
            fontFamily: tokens.fontSans,
          }}
        >
          W
        </div>
        <span
          style={{
            fontSize: 16,
            color: "#25D366",
            fontWeight: 600,
            fontFamily: tokens.fontSans,
          }}
        >
          Join Daily Digest
        </span>
      </div>
    </AbsoluteFill>
  );
};
