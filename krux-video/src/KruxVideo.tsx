import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { tokens } from "./lib/tokens";
import { SceneMain } from "./scenes/SceneMain";

type Props = {
  layout: "vertical" | "horizontal";
};

export const KruxVideo: React.FC<Props> = ({ layout }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#080808", // Pure black background
        fontFamily: tokens.fontSans,
        overflow: "hidden",
      }}
    >
      {/* Removed BackgroundOrbs entirely to keep it clean and editorial */}

      {/* Voiceover sequence */}
      <Sequence from={0} durationInFrames={90}>
        <Audio src={staticFile("audio/vo/scene1.mp3")} volume={1.0} />
      </Sequence>
      
      <Sequence from={90} durationInFrames={150}>
        <Audio src={staticFile("audio/vo/scene2.mp3")} volume={1.0} />
      </Sequence>
      
      <Sequence from={240} durationInFrames={150}>
        <Audio src={staticFile("audio/vo/scene3.mp3")} volume={1.0} />
      </Sequence>
      
      <Sequence from={390} durationInFrames={60}>
        <Audio src={staticFile("audio/vo/scene4.mp3")} volume={1.0} />
      </Sequence>

      {/* Main minimal scene */}
      <SceneMain />
    </AbsoluteFill>
  );
};
