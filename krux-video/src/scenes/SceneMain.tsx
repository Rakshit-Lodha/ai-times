import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing
} from "remotion";
import { tokens } from "../lib/tokens";
import { StoryCardMock } from "../components/StoryCardMock";
import { sampleHeadlines } from "../lib/data";

export const SceneMain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clean, editorial background
  const bg = "#080808";

  // --- TIMINGS (15 seconds = 450 frames) ---
  // Hook Text: 0 - 90
  // Card 1 Reveal: 90 - 200
  // Card 2 Swipe up: 200 - 300
  // Card 3 Swipe up: 300 - 390
  // CTA: 390 - 450

  // --- HOOK TEXT (0-90) ---
  const hookText1Opacity = interpolate(frame, [10, 20, 70, 80], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hookText1Y = interpolate(frame, [10, 20], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  
  const hookText2Opacity = interpolate(frame, [40, 50, 70, 80], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hookText2Y = interpolate(frame, [40, 50], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // --- APP MOCKUP FRAME (90-390) ---
  const appOpacity = interpolate(frame, [80, 90, 390, 400], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const appScale = spring({ frame: frame - 80, fps, config: { damping: 16, stiffness: 120 } });
  const actualScale = interpolate(appScale, [0, 1], [0.95, 1]);

  // --- CARD SWIPES (Vertical Scrolling like a feed) ---
  // We simulate vertical scrolling by moving the Y position of the cards
  
  const card1Y = interpolate(
     frame,
     [190, 210], // Scroll up away at frame 190
     [0, -1200],
     { easing: Easing.bezier(0.25, 1, 0.5, 1), extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const card2Y = interpolate(
     frame,
     [190, 210, 290, 310], // Enters at 190, scrolls away at 290
     [1200, 0, 0, -1200],
     { easing: Easing.bezier(0.25, 1, 0.5, 1), extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const card3Y = interpolate(
     frame,
     [290, 310], // Enters at 290
     [1200, 0],
     { easing: Easing.bezier(0.25, 1, 0.5, 1), extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Floating text that appears next to the phone
  const caption1Opacity = interpolate(frame, [100, 110, 180, 190], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const caption2Opacity = interpolate(frame, [220, 230, 280, 290], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // --- CTA (390-450) ---
  const logoOpacity = interpolate(frame, [395, 410], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const urlOpacity = interpolate(frame, [415, 425], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: bg, fontFamily: tokens.fontSans, alignItems: "center", justifyContent: "center" }}>
      
      {/* HOOK */}
      {frame < 90 && (
         <div style={{ textAlign: "center", maxWidth: 800 }}>
            <div style={{ opacity: hookText1Opacity, transform: `translateY(${hookText1Y}px)`, fontSize: 48, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
               AI moves fast.
            </div>
            <div style={{ opacity: hookText2Opacity, transform: `translateY(${hookText2Y}px)`, fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
               Keeping up shouldn't be a full-time job.
            </div>
         </div>
      )}

      {/* APP SHOWCASE */}
      {frame >= 80 && frame < 400 && (
         <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: appOpacity, transform: `scale(${actualScale})` }}>
            
            {/* The Phone Container - Sleek, minimal, 2D */}
            <div
               style={{
                  width: 380,
                  height: 800,
                  borderRadius: 48,
                  backgroundColor: "#080808",
                  border: "8px solid #1a1a1a",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
               }}
            >
               {/* Card 1 */}
               <div style={{ position: "absolute", inset: 0, transform: `translateY(${card1Y}px)` }}>
                  <StoryCardMock {...sampleHeadlines[0]} imageId={sampleHeadlines[0].id} />
               </div>

               {/* Card 2 */}
               <div style={{ position: "absolute", inset: 0, transform: `translateY(${card2Y}px)` }}>
                  <StoryCardMock {...sampleHeadlines[1]} imageId={sampleHeadlines[1].id} />
               </div>

               {/* Card 3 */}
               <div style={{ position: "absolute", inset: 0, transform: `translateY(${card3Y}px)` }}>
                  <StoryCardMock {...sampleHeadlines[2]} imageId={sampleHeadlines[2].id} />
               </div>
            </div>

            {/* Elegant Floating Captions below the phone */}
            <div style={{ position: "absolute", bottom: 60, width: "100%", textAlign: "center" }}>
               <div style={{ position: "absolute", width: "100%", opacity: caption1Opacity, fontSize: 24, fontWeight: 500, color: "#fff" }}>
                  Meet Krux. 15 stories. 100 words. 60 seconds.
               </div>
               <div style={{ position: "absolute", width: "100%", opacity: caption2Opacity, fontSize: 24, fontWeight: 500, color: "#fff" }}>
                  Swipe to curate your feed.
               </div>
            </div>

         </AbsoluteFill>
      )}

      {/* CTA */}
      {frame >= 390 && (
         <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ 
               opacity: logoOpacity, 
               fontSize: 72, 
               fontWeight: 800, 
               color: "#fff", 
               letterSpacing: 4,
               fontFamily: tokens.fontSerif, // The screenshot showed a serif logo!
               position: "relative"
            }}>
               KRUX
               {/* Subtle center glow like the screenshot */}
               <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 300,
                  height: 150,
                  background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
                  zIndex: -1,
                  pointerEvents: "none"
               }}/>
            </div>
            
            <div style={{ 
               opacity: urlOpacity, 
               fontSize: 20, 
               fontWeight: 500, 
               color: "#fff", 
               marginTop: 16 
            }}>
               Everything about AI. krux.news
            </div>
         </div>
      )}

    </AbsoluteFill>
  );
};
