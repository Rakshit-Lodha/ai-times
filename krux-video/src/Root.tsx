import React from "react";
import { Composition } from "remotion";
import { KruxVideo } from "./KruxVideo";
import { FPS, TOTAL_FRAMES } from "./lib/animations";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KruxVertical"
        component={KruxVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ layout: "vertical" as const }}
      />
      <Composition
        id="KruxHorizontal"
        component={KruxVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ layout: "horizontal" as const }}
      />
    </>
  );
};
