import React from "react";
import { staticFile } from "remotion";
import { tokens } from "../lib/tokens";

type Props = {
  headline: string;
  topic?: string;
  date?: string;
  summary?: string;
  imageId?: string;
};

export const StoryCardMock: React.FC<Props> = ({
  headline,
  topic = "AI News",
  date = "Today",
  summary,
  imageId,
}) => {
  const imageUrl = imageId ? staticFile(`images/articles/${imageId}.png`) : undefined;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#080808", // Exact background from your web app
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: tokens.fontSans,
      }}
    >
      {/* Image Area - 3:2 Aspect Ratio approximation */}
      <div
        style={{
          width: "100%",
          height: "45%",
          backgroundColor: "#111",
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Gradient overlay exactly like web app */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.2) 50%, transparent 100%)",
          }}
        />

        {/* Top right Date Pill */}
        <div
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
            padding: "6px 12px",
            borderRadius: 9999,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
            {date}
          </span>
        </div>

        {/* Bottom Left Source Pill */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            padding: "6px 12px",
            borderRadius: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              backgroundColor: tokens.accent,
              borderRadius: "50%",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: "bold", color: "white" }}>K</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
            {topic}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "20px 28px 40px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: "#ffffff",
            lineHeight: 1.35,
            letterSpacing: "-0.02em",
            margin: "0 0 24px 0",
          }}
        >
          {headline}
        </h2>
        
        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.8)",
            fontFamily: tokens.fontSerif, // Use Lora/Serif here!
            lineHeight: 1.8,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {summary}
        </p>
      </div>
    </div>
  );
};
