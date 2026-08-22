import React from "react";

interface X52BrandMarkProps {
  size?: number;
  isDarkMode?: boolean;
}

export const X52BrandMark: React.FC<X52BrandMarkProps> = ({
  size = 56,
  isDarkMode = true,
}) => {
  const textColor = isDarkMode ? "#ffffff" : "#0f172a";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        userSelect: "none",
      }}
    >
      {/* Simple, sleek minimalist X52 icon badge */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "10px",
          backgroundColor: isDarkMode ? "#ffffff" : "#0f172a",
          color: isDarkMode ? "#090d11" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: Math.round(size * 0.42),
          letterSpacing: "-0.04em",
          flexShrink: 0,
          boxShadow: isDarkMode
            ? "0 4px 12px rgba(255, 255, 255, 0.15)"
            : "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        X52
      </div>

      {/* Clean companion wordmark */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontSize: Math.round(size * 0.42),
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: textColor,
          }}
        >
          X52
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: isDarkMode ? "#9ca3af" : "#64748b",
            marginTop: "4px",
          }}
        >
          ENTERPRISE
        </span>
      </div>
    </div>
  );
};
