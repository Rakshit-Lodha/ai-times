import { SpringConfig } from "remotion";

export const SPRING_GENTLE: SpringConfig = {
  damping: 14,
  stiffness: 120,
  mass: 1,
};

export const SPRING_BOUNCY: SpringConfig = {
  damping: 12,
  stiffness: 220,
  mass: 0.8,
};

export const SPRING_SNAPPY: SpringConfig = {
  damping: 16,
  stiffness: 300,
  mass: 0.6,
};

export const FPS = 30;
export const TOTAL_FRAMES = 450; // 15 seconds

export const SCENES = {
  main: { start: 0, end: 450 },
} as const;
