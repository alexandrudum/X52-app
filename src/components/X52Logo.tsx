import React from "react";

interface X52LogoProps {
  size?: number;
  inverted?: boolean;
}

/**
 * The X52 mark: a square plate with the wordmark set in it.
 *
 * `inverted` keeps its original meaning — a dark plate carrying a light glyph,
 * which is what a light surface needs. The default is the light plate with a
 * dark glyph, for dark surfaces. Both plates are drawn from the raw,
 * theme-independent ends of the palette so the mark holds its contrast in
 * either theme instead of dissolving into the navbar.
 */
export const X52Logo: React.FC<X52LogoProps> = ({ size = 28, inverted = false }) => {
  return (
    <span
      role="img"
      aria-label="X52"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "var(--x52-radius)",
        backgroundColor: inverted ? "var(--x52-black)" : "var(--x52-white)",
        color: inverted ? "var(--x52-white)" : "var(--x52-black)",
        fontFamily: "var(--x52-font-ui)",
        // Token weight, not the 900/-0.04em marketing lockup this used to be.
        fontWeight: "var(--x52-fw-bold)",
        fontSize: Math.round(size * 0.4),
        letterSpacing: "0.01em",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      X52
    </span>
  );
};
