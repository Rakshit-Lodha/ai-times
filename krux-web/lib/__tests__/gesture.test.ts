/**
 * Standalone test for gesture direction detection.
 * Run with: npx tsx lib/__tests__/gesture.test.ts
 */

import { detectGestureDirection } from "../gesture";

let passed = 0;
let failed = 0;

function assert(name: string, actual: string, expected: string) {
  if (actual === expected) {
    console.log(`  PASS: ${name}`);
    passed++;
  } else {
    console.error(`  FAIL: ${name} — expected "${expected}", got "${actual}"`);
    failed++;
  }
}

console.log("detectGestureDirection tests\n");

// --- Below threshold: undecided ---
assert(
  "small movement (3,3) is undecided",
  detectGestureDirection(3, 3),
  "undecided"
);
assert(
  "zero movement is undecided",
  detectGestureDirection(0, 0),
  "undecided"
);
assert(
  "just under threshold (4,3) is undecided",
  detectGestureDirection(4, 3),
  "undecided"
);

// --- Clearly horizontal ---
assert(
  "strong horizontal (20, 2) → horizontal",
  detectGestureDirection(20, 2),
  "horizontal"
);
assert(
  "negative horizontal (-15, 3) → horizontal",
  detectGestureDirection(-15, 3),
  "horizontal"
);
assert(
  "moderate horizontal (10, 5) → horizontal",
  detectGestureDirection(10, 5),
  "horizontal"
);

// --- Clearly vertical ---
assert(
  "strong vertical (2, 20) → vertical",
  detectGestureDirection(2, 20),
  "vertical"
);
assert(
  "negative vertical (3, -15) → vertical",
  detectGestureDirection(3, -15),
  "vertical"
);
assert(
  "moderate vertical (5, 10) → vertical",
  detectGestureDirection(5, 10),
  "vertical"
);

// --- Exact diagonal (equal dx/dy) → vertical (tie-break: absDx > absDy is false) ---
assert(
  "exact diagonal (10, 10) → vertical (tie goes to scroll)",
  detectGestureDirection(10, 10),
  "vertical"
);
assert(
  "exact diagonal (5, 5) → vertical (tie goes to scroll)",
  detectGestureDirection(5, 5),
  "vertical"
);

// --- Custom threshold ---
assert(
  "custom threshold 20: (15, 3) still undecided",
  detectGestureDirection(15, 3, 20),
  "undecided"
);
assert(
  "custom threshold 20: (18, 5) → horizontal",
  detectGestureDirection(18, 5, 20),
  "horizontal"
);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
