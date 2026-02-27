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
import { WhatsAppChat } from "../components/WhatsAppChat";

type Props = {
  layout: "vertical" | "horizontal";
};

export const Scene7WhatsApp: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // WhatsApp icon scales in (frames 0-30)
  const iconSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // Icon moves up, chat appears (frames 30-60)
  const iconY = interpolate(frame, [30, 50], [0, -200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Chat slides in from right (frames 35-65)
  const chatSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const chatX = interpolate(chatSpring, [0, 1], [400, 0]);
  const chatOpacity = interpolate(chatSpring, [0, 0.3], [0, 1]);

  // Notification badge pulse
  const pulse = frame >= 25 ? Math.sin((frame - 25) * 0.12) * 0.15 + 0.85 : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
      }}
    >
      {/* WhatsApp icon */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${iconY}px) scale(${iconSpring})`,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            background: "#25D366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 800,
            color: "#fff",
            fontFamily: tokens.fontSans,
            boxShadow: `0 0 40px rgba(37,211,102,${pulse * 0.4})`,
          }}
        >
          W
        </div>

        {/* Notification badge */}
        {frame >= 20 && (
          <div
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              width: 28,
              height: 28,
              borderRadius: 14,
              background: tokens.skipRed,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              fontFamily: tokens.fontSans,
              opacity: interpolate(frame, [20, 25], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            3
          </div>
        )}
      </div>

      {/* WhatsApp chat mock */}
      {frame >= 35 && (
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: `translate(-50%, -50%) translateX(${chatX}px)`,
            opacity: chatOpacity,
          }}
        >
          <WhatsAppChat
            headlines={[
              "Google Gemini 3.1 Pro Doubles Reasoning",
              "MatX Raises $500M to Challenge Nvidia",
              "Fed Cuts Developer Tasks from Days to Hours",
            ]}
          />
        </div>
      )}

      {/* Text */}
      {frame >= 80 && (
        <div style={{ position: "absolute", bottom: 100, left: 0, right: 0 }}>
          <TextReveal
            text="Join the Krux WhatsApp community. Top 3 stories, delivered daily. No spam. Ever."
            startFrame={80}
            fontSize={24}
            fontWeight={500}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
