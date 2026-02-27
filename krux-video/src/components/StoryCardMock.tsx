import React from "react";
import { tokens } from "../lib/tokens";

type Props = {
  headline: string;
  topic?: string;
  date?: string;
  showImage?: boolean;
  imageColor?: string;
};

export const StoryCardMock: React.FC<Props> = ({
  headline,
  topic = "AI News",
  date = "Today",
  showImage = true,
  imageColor = "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: tokens.bgCard,
        display: "flex",
        flexDirection: "column",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${tokens.border}`,
      }}
    >
      {/* Image area */}
      {showImage && (
        <div
          style={{
            width: "100%",
            height: "45%",
            background: imageColor,
            position: "relative",
          }}
        >
          {/* Topic badge */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: "4px 10px",
              borderRadius: 12,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              fontSize: 10,
              fontWeight: 600,
              color: tokens.accent,
              fontFamily: tokens.fontSans,
            }}
          >
            {topic}
          </div>
          {/* Date pill */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "4px 10px",
              borderRadius: 12,
              background: "rgba(0,0,0,0.5)",
              fontSize: 10,
              color: tokens.textSecondary,
              fontFamily: tokens.fontSans,
            }}
          >
            {date}
          </div>
        </div>
      )}
      {/* Text area */}
      <div style={{ padding: 14, flex: 1 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: tokens.textPrimary,
            fontFamily: tokens.fontSans,
            lineHeight: 1.3,
            margin: 0,
            marginBottom: 8,
          }}
        >
          {headline}
        </h3>
        <p
          style={{
            fontSize: 11,
            color: tokens.textSecondary,
            fontFamily: tokens.fontSerif,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Get the full story in 100 words. Multi-source synthesis from the top
          outlets covering this story...
        </p>
      </div>
      {/* Bottom bar */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: `1px solid ${tokens.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: tokens.accent,
            fontWeight: 700,
            fontFamily: tokens.fontSans,
          }}
        >
          KRUX
        </span>
        <span
          style={{
            fontSize: 10,
            color: tokens.textSecondary,
            fontFamily: tokens.fontSans,
          }}
        >
          100 words
        </span>
      </div>
    </div>
  );
};
