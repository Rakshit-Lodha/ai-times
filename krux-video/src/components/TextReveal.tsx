import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Props = {
  text: string;
  startFrame?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  maxWidth?: number;
  speed?: number;
};

export const TextReveal: React.FC<Props> = ({
  text,
  startFrame = 0,
  fontSize = 28,
  fontWeight = 500,
  color = "#ffffff",
  fontFamily = "Inter, sans-serif",
  textAlign = "center",
  maxWidth = 800,
  speed = 4, // Default to 4 frames per word reveal
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily,
        textAlign,
        maxWidth,
        lineHeight: 1.4,
        margin: "0 auto",
        padding: "0 40px",
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * speed;
        const opacity = interpolate(
          frame,
          [wordStart, wordStart + 6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const y = interpolate(frame, [wordStart, wordStart + 6], [12, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}px)`,
              marginRight: "0.3em",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
