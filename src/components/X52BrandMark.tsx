import React from "react";

interface X52BrandMarkProps {
  size?: number;
  isDarkMode?: boolean;
}

/**
 * Plate + wordmark lockup, used where the product needs to name itself
 * (dashboard masthead) rather than just sit in the navbar.
 *
 * The plate polarity follows `isDarkMode` exactly as before — light plate on a
 * dark UI, dark plate on a light one — but every value now comes from the token
 * layer, so the lockup is flat (a brand mark is not an overlay: no drop shadow)
 * and lightly rounded rather than a 10px pill-ish badge.
 */
export const X52BrandMark: React.FC<X52BrandMarkProps> = ({
  size = 56,
  isDarkMode = true,
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--x52-space-3)",
        userSelect: "none",
      }}
    >
      <span
        role="img"
        aria-label="X52"
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--x52-radius)",
          backgroundColor: isDarkMode ? "var(--x52-white)" : "var(--x52-black)",
          color: isDarkMode ? "var(--x52-black)" : "var(--x52-white)",
          fontFamily: "var(--x52-font-ui)",
          fontWeight: "var(--x52-fw-bold)",
          fontSize: Math.round(size * 0.4),
          letterSpacing: "0.01em",
          lineHeight: 1,
        }}
      >
        X52
      </span>

      <span style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-1)" }}>
        <span
          style={{
            fontSize: Math.round(size * 0.4),
            fontWeight: "var(--x52-fw-bold)",
            letterSpacing: "0.01em",
            lineHeight: 1,
            color: "var(--x52-heading)",
          }}
        >
          X52
        </span>
        <span className="x52-label" style={{ lineHeight: 1 }}>
          Enterprise
        </span>
      </span>
    </div>
  );
};
