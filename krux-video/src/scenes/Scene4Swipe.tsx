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
import { PhoneMockup } from "../components/PhoneMockup";
import { StoryCardMock } from "../components/StoryCardMock";
import { sampleHeadlines } from "../lib/data";

type Props = {
  layout: "vertical" | "horizontal";
};

export const Scene4Swipe: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry
  const entryOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Swipe RIGHT (frames 20-60)
  const swipeRightX = interpolate(frame, [20, 55], [0, 320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const swipeRightRotation = interpolate(frame, [20, 55], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const swipeRightOpacity = interpolate(frame, [45, 58], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const greenGlow = interpolate(frame, [30, 50], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // New card springs in (frames 60-70)
  const card2Spring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const card2Scale = interpolate(card2Spring, [0, 1], [0.9, 1]);

  // Swipe LEFT (frames 80-120)
  const swipeLeftX = interpolate(frame, [80, 115], [0, -320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const swipeLeftRotation = interpolate(frame, [80, 115], [0, -18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const swipeLeftOpacity = interpolate(frame, [105, 118], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const redGlow = interpolate(frame, [90, 110], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade
  const exitOpacity = interpolate(frame, [165, 180], [1, 0], {
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
      <PhoneMockup>
        <div
          style={{
            padding: 8,
            height: "100%",
            position: "relative",
          }}
        >
          {/* Card 1 — swipes right */}
          {frame < 60 && (
            <div
              style={{
                position: "absolute",
                inset: 8,
                transform: `translateX(${swipeRightX}px) rotate(${swipeRightRotation}deg)`,
                opacity: swipeRightOpacity,
              }}
            >
              <StoryCardMock
                headline={sampleHeadlines[0].headline}
                topic={sampleHeadlines[0].topic}
                date={sampleHeadlines[0].date}
              />
              {/* Green glow */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "40%",
                  background: `linear-gradient(to right, rgba(16,185,129,${greenGlow}), transparent)`,
                  borderRadius: 16,
                  pointerEvents: "none",
                }}
              />
              {/* LIKE label */}
              {frame >= 35 && (
                <div
                  style={{
                    position: "absolute",
                    top: "40%",
                    left: 20,
                    fontSize: 28,
                    fontWeight: 800,
                    color: tokens.likeGreen,
                    fontFamily: tokens.fontSans,
                    opacity: interpolate(frame, [35, 42], [0, 1], {
                      extrapolateRight: "clamp",
                    }),
                    transform: "rotate(-15deg)",
                    border: `3px solid ${tokens.likeGreen}`,
                    padding: "4px 16px",
                    borderRadius: 8,
                  }}
                >
                  LIKE
                </div>
              )}
            </div>
          )}

          {/* Card 2 — springs in, then swipes left */}
          {frame >= 60 && frame < 120 && (
            <div
              style={{
                position: "absolute",
                inset: 8,
                transform:
                  frame < 80
                    ? `scale(${card2Scale})`
                    : `translateX(${swipeLeftX}px) rotate(${swipeLeftRotation}deg)`,
                opacity: frame < 80 ? 1 : swipeLeftOpacity,
              }}
            >
              <StoryCardMock
                headline={sampleHeadlines[1].headline}
                topic={sampleHeadlines[1].topic}
                date={sampleHeadlines[1].date}
                imageColor="linear-gradient(135deg, #1a0a2e, #2d1b69, #0f3460)"
              />
              {/* Red glow */}
              {frame >= 80 && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "40%",
                    background: `linear-gradient(to left, rgba(239,68,68,${redGlow}), transparent)`,
                    borderRadius: 16,
                    pointerEvents: "none",
                  }}
                />
              )}
              {/* SKIP label */}
              {frame >= 95 && (
                <div
                  style={{
                    position: "absolute",
                    top: "40%",
                    right: 20,
                    fontSize: 28,
                    fontWeight: 800,
                    color: tokens.skipRed,
                    fontFamily: tokens.fontSans,
                    opacity: interpolate(frame, [95, 102], [0, 1], {
                      extrapolateRight: "clamp",
                    }),
                    transform: "rotate(15deg)",
                    border: `3px solid ${tokens.skipRed}`,
                    padding: "4px 16px",
                    borderRadius: 8,
                  }}
                >
                  SKIP
                </div>
              )}
            </div>
          )}

          {/* Card 3 — rests in place */}
          {frame >= 120 && (
            <div
              style={{
                position: "absolute",
                inset: 8,
                transform: `scale(${spring({ frame: frame - 120, fps, config: { damping: 14, stiffness: 200 } })})`,
              }}
            >
              <StoryCardMock
                headline={sampleHeadlines[2].headline}
                topic={sampleHeadlines[2].topic}
                date={sampleHeadlines[2].date}
                imageColor="linear-gradient(135deg, #0a2e1a, #1b6929, #0f6034)"
              />
            </div>
          )}
        </div>
      </PhoneMockup>

      {/* Text */}
      {frame >= 130 && (
        <div style={{ position: "absolute", bottom: 100, left: 0, right: 0 }}>
          <TextReveal
            text="Swipe right if you like the story. Left if you don't. That's it."
            startFrame={130}
            fontSize={24}
            fontWeight={500}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
