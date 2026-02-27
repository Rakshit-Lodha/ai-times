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
import { FilterPill } from "../components/FilterPill";

type Props = {
  layout: "vertical" | "horizontal";
};

const filters = [
  {
    label: "For Work",
    description: "Find AI tools you can use this week",
    headline: "Cursor Ships Background AI Agents for Coding",
    topic: "For Work",
  },
  {
    label: "Funding",
    description: "Know who's raising and why it matters",
    headline: "MatX Raises $500M to Challenge Nvidia",
    topic: "Funding",
  },
  {
    label: "Reports",
    description: "Stay sharp on industry trends and research",
    headline: "70% Use AI, Yet 80% See Zero Impact",
    topic: "Report",
  },
];

export const Scene5Filters: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Determine which filter is active
  const activeIndex =
    frame < 30 ? -1 : frame < 60 ? 0 : frame < 90 ? 1 : frame < 120 ? 2 : 2;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
      }}
    >
      <PhoneMockup>
        <div style={{ height: "100%", position: "relative" }}>
          {/* Filter bar at top */}
          <div
            style={{
              display: "flex",
              padding: "10px 10px 8px",
              gap: 6,
              borderBottom: `1px solid ${tokens.border}`,
              overflowX: "hidden",
            }}
          >
            <FilterPill label="My Feed" isActive={activeIndex === -1} />
            {filters.map((f, i) => {
              const pillStart = 25 + i * 30;
              const pillSpring = spring({
                frame: frame - pillStart,
                fps,
                config: { damping: 14, stiffness: 200 },
              });
              const pillOpacity = frame >= pillStart ? pillSpring : 0;

              return (
                <div key={f.label} style={{ opacity: pillOpacity }}>
                  <FilterPill
                    label={f.label}
                    isActive={activeIndex === i}
                  />
                </div>
              );
            })}
          </div>

          {/* Card that changes with filter */}
          <div style={{ padding: 8 }}>
            {filters.map((f, i) => {
              const isVisible = activeIndex === i;
              if (!isVisible) return null;

              return (
                <div
                  key={f.label}
                  style={{
                    height: 380,
                    opacity: interpolate(
                      frame,
                      [30 + i * 30, 35 + i * 30],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    ),
                  }}
                >
                  <StoryCardMock
                    headline={f.headline}
                    topic={f.topic}
                    date="Today"
                  />
                </div>
              );
            })}
            {activeIndex === -1 && (
              <div style={{ height: 380 }}>
                <StoryCardMock
                  headline="Google Gemini 3.1 Pro Doubles Reasoning"
                  topic="Model announcements"
                  date="Today"
                />
              </div>
            )}
          </div>
        </div>
      </PhoneMockup>

      {/* Filter descriptions that appear alongside */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        {filters.map((f, i) => {
          const descStart = 35 + i * 30;
          const descEnd = descStart + 25;
          const descOpacity = interpolate(
            frame,
            [descStart, descStart + 8, descEnd, descEnd + 5],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={f.label}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                opacity: descOpacity,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: tokens.accent,
                  fontFamily: tokens.fontSans,
                  marginBottom: 6,
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: tokens.textSecondary,
                  fontFamily: tokens.fontSans,
                }}
              >
                {f.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall text */}
      {frame >= 130 && (
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0 }}>
          <TextReveal
            text="Read what's relevant to you."
            startFrame={130}
            fontSize={26}
            fontWeight={600}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
