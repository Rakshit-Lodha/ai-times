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

export const Scene2Intro: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo fade in (frames 0-30)
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Logo moves up, phone slides in (frames 30-60)
  const logoY = interpolate(frame, [30, 55], [0, -280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phoneSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [600, 0]);

  // Scene exit fade
  const exitOpacity = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Krux Logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${logoY}px) scale(${logoScale})`,
          opacity: logoOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: tokens.textPrimary,
            fontFamily: tokens.fontSans,
            letterSpacing: 6,
          }}
        >
          KRUX
        </div>
        {/* Orange glow behind */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${tokens.accentGlow}, transparent 70%)`,
            zIndex: -1,
          }}
        />
      </div>

      {/* Phone mockup */}
      {frame >= 30 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translateY(${phoneY}px)`,
          }}
        >
          <PhoneMockup>
            <div style={{ padding: 8, height: "100%" }}>
              {sampleHeadlines.slice(0, 3).map((article, i) => {
                const cardDelay = 50 + i * 12;
                const cardOpacity = interpolate(
                  frame,
                  [cardDelay, cardDelay + 10],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const cardY = interpolate(
                  frame,
                  [cardDelay, cardDelay + 10],
                  [20, 0],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                return (
                  <div
                    key={i}
                    style={{
                      opacity: cardOpacity,
                      transform: `translateY(${cardY}px)`,
                      marginBottom: 6,
                      height: 150,
                    }}
                  >
                    <StoryCardMock
                      headline={article.headline}
                      topic={article.topic}
                      date={article.date}
                    />
                  </div>
                );
              })}
            </div>
          </PhoneMockup>
        </div>
      )}

      {/* Text */}
      {frame >= 90 && (
        <div style={{ position: "absolute", bottom: 120, left: 0, right: 0 }}>
          <TextReveal
            text="Krux picks the 15 stories that matter every day. Each one — 100 words. Read in 60 seconds."
            startFrame={90}
            fontSize={24}
            fontWeight={500}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
