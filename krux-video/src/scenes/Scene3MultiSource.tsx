import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { tokens } from "../lib/tokens";
import { TextReveal } from "../components/TextReveal";
import { PhoneMockup } from "../components/PhoneMockup";
import { StoryCardMock } from "../components/StoryCardMock";
import { sampleSources } from "../lib/data";

type Props = {
  layout: "vertical" | "horizontal";
};

const sourcePositions = [
  { x: -220, y: -120 },
  { x: -110, y: -140 },
  { x: 0, y: -150 },
  { x: 110, y: -140 },
  { x: 220, y: -120 },
];

export const Scene3MultiSource: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();

  // Phase 1: Sources spread out (frames 0-60)
  // Phase 2: Sources converge (frames 60-120)
  // Phase 3: Text (frames 120-150)

  const entryOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [135, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
      }}
    >
      {/* Phone in center */}
      <div style={{ position: "relative" }}>
        <PhoneMockup>
          <div style={{ padding: 8, height: "100%" }}>
            <StoryCardMock
              headline="Google Gemini 3.1 Pro Doubles Reasoning"
              topic="Model announcements"
              date="Today"
            />
          </div>
        </PhoneMockup>

        {/* Source badges converging */}
        {sampleSources.map((source, i) => {
          const pos = sourcePositions[i];
          const convergeProgress = interpolate(
            frame,
            [60, 110],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }
          );

          const x = interpolate(convergeProgress, [0, 1], [pos.x, 0]);
          const y = interpolate(convergeProgress, [0, 1], [pos.y, -50]);
          const scale = interpolate(convergeProgress, [0, 1], [1, 0.3]);
          const opacity = interpolate(
            convergeProgress,
            [0, 0.7, 1],
            [1, 1, 0]
          );

          return (
            <div
              key={source}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
                opacity,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${tokens.border}`,
                  borderRadius: 12,
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {/* Favicon circle */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: tokens.accent,
                    opacity: 0.6,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: tokens.textPrimary,
                    fontFamily: tokens.fontSans,
                    whiteSpace: "nowrap",
                  }}
                >
                  {source}
                </span>
              </div>
              {/* Blurred article snippet */}
              <div
                style={{
                  marginTop: 6,
                  width: 120,
                  height: 20,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.04)",
                  filter: "blur(2px)",
                }}
              />
            </div>
          );
        })}

        {/* "Sources: 5" badge appears after convergence */}
        {frame >= 110 && (
          <div
            style={{
              position: "absolute",
              bottom: 60,
              left: "50%",
              transform: "translateX(-50%)",
              background: tokens.accent,
              color: "#000",
              fontWeight: 700,
              fontSize: 12,
              padding: "4px 14px",
              borderRadius: 12,
              fontFamily: tokens.fontSans,
              opacity: interpolate(frame, [110, 118], [0, 1], {
                extrapolateRight: "clamp",
              }),
              boxShadow: `0 0 20px ${tokens.accentGlow}`,
            }}
          >
            Sources: 5
          </div>
        )}
      </div>

      {/* Text */}
      {frame >= 115 && (
        <div style={{ position: "absolute", bottom: 100, left: 0, right: 0 }}>
          <TextReveal
            text="We read dozens of sources. You get one clear summary."
            startFrame={115}
            fontSize={26}
            fontWeight={500}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
