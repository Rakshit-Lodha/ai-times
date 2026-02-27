import { SpringConfig } from "remotion";

export const SPRING_GENTLE: SpringConfig = {
  damping: 14,
  stiffness: 120,
  mass: 1,
};

export const SPRING_BOUNCY: SpringConfig = {
  damping: 10,
  stiffness: 200,
  mass: 0.8,
};

export const SPRING_SNAPPY: SpringConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.5,
};

export const WORD_REVEAL_SPEED = 4; // frames per word
export const SENTENCE_PAUSE = 6; // extra frames at periods
export const SCENE_CROSSFADE = 8; // frames for scene transitions

export const FPS = 30;
export const TOTAL_FRAMES = 1440;

// Scene frame ranges
export const SCENES = {
  hook: { start: 0, end: 180 },
  intro: { start: 180, end: 360 },
  multiSource: { start: 360, end: 510 },
  swipe: { start: 510, end: 690 },
  filters: { start: 690, end: 870 },
  shareDeeper: { start: 870, end: 1050 },
  whatsapp: { start: 1050, end: 1230 },
  cta: { start: 1230, end: 1440 },
} as const;
