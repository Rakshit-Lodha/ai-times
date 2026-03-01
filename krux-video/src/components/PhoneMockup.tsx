import React from "react";
import { tokens } from "../lib/tokens";

type Props = {
  children: React.ReactNode;
  scale?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  translateZ?: number;
};

export const PhoneMockup: React.FC<Props> = ({ 
  children, 
  scale = 1,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  translateZ = 0
}) => {
  return (
    <div
      style={{
        width: 320,
        height: 650,
        transformStyle: "preserve-3d",
        transform: `translateZ(${translateZ}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 44,
          border: `4px solid rgba(255,255,255,0.15)`,
          background: tokens.bg,
          boxShadow: `
            0 30px 80px rgba(0,0,0,0.8),
            inset 0 0 20px rgba(255,255,255,0.05),
            0 0 0 1px rgba(255,255,255,0.2)
          `,
          overflow: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Dynamic Screen Glare */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-50%",
            width: "200%",
            height: "200%",
            background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)`,
            transform: `translateY(${rotateX * 2}px) translateX(${rotateY * -2}px)`,
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
        
        {/* Notch */}
        <div
          style={{
            width: 120,
            height: 32,
            background: "#000",
            borderRadius: `0 0 18px 18px`,
            margin: "0 auto",
            position: "relative",
            zIndex: 30,
            boxShadow: "inset 0 -1px 3px rgba(255,255,255,0.1)",
          }}
        />

        {/* Screen content */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            zIndex: 10,
          }}
        >
          <div style={{ height: 32, width: "100%" }} />
          {children}
        </div>
      </div>
    </div>
  );
};
