import React from "react";

type Props = {
  headlines: string[];
};

export const WhatsAppChat: React.FC<Props> = ({ headlines }) => {
  return (
    <div
      style={{
        background: "#1a1a2e",
        borderRadius: 16,
        padding: 16,
        maxWidth: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Sender */}
      <div
        style={{
          color: "#25D366",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Krux Daily Digest
      </div>
      {/* Message */}
      <div
        style={{
          color: "#fff",
          fontSize: 14,
          marginTop: 8,
          lineHeight: 1.6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Top 3 AI stories today:
        <br />
        {headlines.map((h, i) => (
          <React.Fragment key={i}>
            {i + 1}. {h}
            {i < headlines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
      {/* Timestamp */}
      <div
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          textAlign: "right" as const,
          marginTop: 6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        9:00 AM ✓✓
      </div>
    </div>
  );
};
