import React from "react";
import { RAGSearchWidget } from "../../core/rag/RAGSearchWidget";

export const RAGExplorerApp: React.FC<{ isDarkMode?: boolean; isStandalone?: boolean }> = ({
  isDarkMode = true,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <RAGSearchWidget isDarkMode={isDarkMode} />
    </div>
  );
};
