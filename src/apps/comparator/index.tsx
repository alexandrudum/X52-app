import React from "react";
import { CompareMatrixWidget } from "../../core/compare/CompareMatrixWidget";
import { DataCatalogList } from "../../core/listing/DataCatalogList";

export const ComparatorApp: React.FC<{ isDarkMode?: boolean; isStandalone?: boolean }> = ({
  isDarkMode = true,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <CompareMatrixWidget isDarkMode={isDarkMode} />
      <DataCatalogList isDarkMode={isDarkMode} />
    </div>
  );
};
