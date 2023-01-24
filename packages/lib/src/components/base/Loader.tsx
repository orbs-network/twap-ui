import React from "react";
import Skeleton from "@mui/material/Skeleton";

function Loader({ width = "100%", height = "20px", className = "" }: { width?: string | number; height?: string | number; className?: string }) {
  return <Skeleton className={`twap-loader ${className}`} animation="wave" width={width} height={height} style={{ opacity: 0.7 }} />;
}

export default Loader;
