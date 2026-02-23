/**
 * Swipe-vs-scroll direction detection utility.
 *
 * Given a touch displacement (dx, dy) and a pixel threshold,
 * returns whether the gesture should be treated as horizontal (swipe)
 * or vertical (scroll), or is still undecided.
 */

export type GestureDirection = "horizontal" | "vertical" | "undecided";

const DEFAULT_THRESHOLD = 8;

export function detectGestureDirection(
  dx: number,
  dy: number,
  threshold: number = DEFAULT_THRESHOLD
): GestureDirection {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx + absDy < threshold) return "undecided";

  return absDx > absDy ? "horizontal" : "vertical";
}
