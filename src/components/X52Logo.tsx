import React from "react";

interface X52LogoProps {
  size?: number;
  inverted?: boolean;
}

export const X52Logo: React.FC<X52LogoProps> = ({ size = 28, inverted = false }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "6px",
        backgroundColor: inverted ? "#0f172a" : "#ffffff",
        color: inverted ? "#ffffff" : "#090d11",
        fontWeight: 900,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: Math.round(size * 0.44),
        letterSpacing: "-0.04em",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      X52
    </div>
  );
};
