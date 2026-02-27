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
import { ShareSheet } from "../components/ShareSheet";
import { aiPlatforms } from "../lib/data";

type Props = {
  layout: "vertical" | "horizontal";
};

export const Scene6ShareDeeper: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Share sheet slides up (frames 10-40)
  const shareSheetSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const shareSheetY = interpolate(shareSheetSpring, [0, 1], [200, 0]);
  const shareSheetVisible = frame >= 10 && frame < 70;

  // Share sheet slides down (frames 60-70)
  const shareSheetExit = interpolate(frame, [60, 70], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // AI platform logos appear (frames 80-120)
  const platformColors = ["#10a37f", "#d4a574", "#20808d", "#4285f4"];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
      }}
    >
      <PhoneMockup>
        <div style={{ padding: 8, height: "100%", position: "relative" }}>
          <StoryCardMock
            headline="Google Gemini 3.1 Pro Doubles Reasoning"
            topic="Model announcements"
            date="Today"
          />

          {/* Share sheet */}
          {shareSheetVisible && (
            <div
              style={{
                transform: `translateY(${frame < 60 ? shareSheetY : shareSheetExit}px)`,
              }}
            >
              <ShareSheet />
            </div>
          )}
        </div>
      </PhoneMockup>

      {/* AI platform logos appearing after share sheet */}
      {frame >= 80 && (
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {aiPlatforms.map((platform, i) => {
            const platformSpring = spring({
              frame: frame - 85 - i * 5,
              fps,
              config: { damping: 12, stiffness: 180 },
            });

            return (
              <div
                key={platform}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${tokens.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: platformColors[i],
                  fontFamily: tokens.fontSans,
                  transform: `scale(${platformSpring})`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                }}
              >
                {platform}
              </div>
            );
          })}
        </div>
      )}

      {/* Text */}
      {frame >= 110 && (
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0 }}>
          <TextReveal
            text="Share in one tap. Want to dig deeper? Research any story with your favorite AI."
            startFrame={110}
            fontSize={22}
            fontWeight={500}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
