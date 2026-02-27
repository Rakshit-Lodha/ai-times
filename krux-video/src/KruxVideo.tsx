import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { tokens } from "./lib/tokens";
import { SCENES } from "./lib/animations";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Intro } from "./scenes/Scene2Intro";
import { Scene3MultiSource } from "./scenes/Scene3MultiSource";
import { Scene4Swipe } from "./scenes/Scene4Swipe";
import { Scene5Filters } from "./scenes/Scene5Filters";
import { Scene6ShareDeeper } from "./scenes/Scene6ShareDeeper";
import { Scene7WhatsApp } from "./scenes/Scene7WhatsApp";
import { Scene8CTA } from "./scenes/Scene8CTA";
import { BackgroundOrbs } from "./components/BackgroundOrbs";

type Props = {
  layout: "vertical" | "horizontal";
};

export const KruxVideo: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tokens.bg,
        fontFamily: tokens.fontSans,
        overflow: "hidden",
      }}
    >
      {/* Persistent subtle background orbs */}
      <BackgroundOrbs />

      {/* Voiceover audio — one per scene */}
      <Sequence from={SCENES.hook.start} durationInFrames={180}>
        <Audio src={staticFile("audio/vo/scene1.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={SCENES.intro.start} durationInFrames={180}>
        <Audio src={staticFile("audio/vo/scene2.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={SCENES.multiSource.start} durationInFrames={150}>
        <Audio src={staticFile("audio/vo/scene3.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={SCENES.swipe.start} durationInFrames={180}>
        <Audio src={staticFile("audio/vo/scene4.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={SCENES.filters.start} durationInFrames={180}>
        <Audio src={staticFile("audio/vo/scene5.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={SCENES.shareDeeper.start} durationInFrames={180}>
        <Audio src={staticFile("audio/vo/scene6.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={SCENES.whatsapp.start} durationInFrames={180}>
        <Audio src={staticFile("audio/vo/scene7.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={SCENES.cta.start} durationInFrames={210}>
        <Audio src={staticFile("audio/vo/scene8.mp3")} volume={1.0} />
      </Sequence>

      {/* Scenes */}
      <Sequence from={SCENES.hook.start} durationInFrames={180}>
        <Scene1Hook />
      </Sequence>

      <Sequence from={SCENES.intro.start} durationInFrames={180}>
        <Scene2Intro layout={layout} />
      </Sequence>

      <Sequence from={SCENES.multiSource.start} durationInFrames={150}>
        <Scene3MultiSource layout={layout} />
      </Sequence>

      <Sequence from={SCENES.swipe.start} durationInFrames={180}>
        <Scene4Swipe layout={layout} />
      </Sequence>

      <Sequence from={SCENES.filters.start} durationInFrames={180}>
        <Scene5Filters layout={layout} />
      </Sequence>

      <Sequence from={SCENES.shareDeeper.start} durationInFrames={180}>
        <Scene6ShareDeeper layout={layout} />
      </Sequence>

      <Sequence from={SCENES.whatsapp.start} durationInFrames={180}>
        <Scene7WhatsApp layout={layout} />
      </Sequence>

      <Sequence from={SCENES.cta.start} durationInFrames={210}>
        <Scene8CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
