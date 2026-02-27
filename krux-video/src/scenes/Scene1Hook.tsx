import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { tokens } from "../lib/tokens";
import { TextReveal } from "../components/TextReveal";
import { aiCompanyLogos } from "../lib/data";

const chaosHeadlines = [
  "GPT-5 launches with reasoning",
  "Nvidia hits $4T valuation",
  "DeepSeek R2 released",
  "Google Gemini 3.1 Pro",
  "Anthropic raises $10B",
];

// Random-ish positions for logos
const logoPositions = [
  { x: 15, y: 10 },
  { x: 65, y: 8 },
  { x: 35, y: 30 },
  { x: 80, y: 35 },
  { x: 10, y: 50 },
  { x: 55, y: 55 },
  { x: 25, y: 70 },
  { x: 75, y: 68 },
];

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Chaotic logos (frames 0-120)
  const isChaosPhase = frame < 120;
  // Phase 2: Black (frames 120-150)
  const isBlackPhase = frame >= 120 && frame < 150;
  // Phase 3: Text reveal (frames 150-180)

  // Exit animation for all chaos elements
  const exitScale = interpolate(frame, [110, 122], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [110, 118], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Chaotic logos phase */}
      {isChaosPhase && (
        <AbsoluteFill style={{ opacity: exitOpacity }}>
          {aiCompanyLogos.map((name, i) => {
            const startFrame = i * 4;
            const logoScale = spring({
              frame: frame - startFrame,
              fps,
              config: { damping: 12, stiffness: 150 },
            });
            const pos = logoPositions[i];
            const wobble = Math.sin(frame * 0.05 + i * 2) * 3;

            return (
              <div
                key={name}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `scale(${logoScale * exitScale}) rotate(${wobble}deg)`,
                  opacity: frame >= startFrame ? 1 : 0,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${tokens.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: tokens.textSecondary,
                    fontFamily: tokens.fontSans,
                  }}
                >
                  {name}
                </div>
              </div>
            );
          })}

          {/* Flashing headlines */}
          {chaosHeadlines.map((headline, i) => {
            const hlStart = 15 + i * 18;
            const hlOpacity = interpolate(
              frame,
              [hlStart, hlStart + 4, hlStart + 14, hlStart + 18],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const positions = [
              { x: "10%", y: "25%" },
              { x: "40%", y: "45%" },
              { x: "15%", y: "65%" },
              { x: "50%", y: "20%" },
              { x: "30%", y: "80%" },
            ];

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: positions[i].x,
                  top: positions[i].y,
                  opacity: hlOpacity * exitOpacity,
                  fontSize: 14,
                  fontWeight: 600,
                  color: tokens.accent,
                  fontFamily: tokens.fontSans,
                  whiteSpace: "nowrap",
                }}
              >
                {headline}
              </div>
            );
          })}
        </AbsoluteFill>
      )}

      {/* Text reveal phase */}
      {frame >= 150 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextReveal
            text="AI moves fast. Keeping up shouldn't be a full-time job."
            startFrame={150}
            fontSize={42}
            fontWeight={700}
            textAlign="center"
            maxWidth={700}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
