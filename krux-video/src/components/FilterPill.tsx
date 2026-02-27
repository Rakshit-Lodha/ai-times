import React from "react";
import { tokens } from "../lib/tokens";

type Props = {
  label: string;
  isActive: boolean;
};

export const FilterPill: React.FC<Props> = ({ label, isActive }) => {
  return (
    <div
      style={{
        padding: "6px 16px",
        borderRadius: 20,
        background: isActive ? tokens.accent : "rgba(255,255,255,0.08)",
        color: isActive ? "#000" : tokens.textSecondary,
        fontSize: 13,
        fontFamily: tokens.fontSans,
        fontWeight: 600,
        display: "inline-block",
        marginRight: 8,
      }}
    >
      {label}
    </div>
  );
};
