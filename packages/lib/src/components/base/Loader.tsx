import React from "react";
import Skeleton from "@mui/material/Skeleton";

function Loader({ className = "" }: { width?: string | number; height?: string | number; className?: string }) {
  return <Skeleton className={`twap-loader ${className}`} animation="wave" style={{ opacity: 0.7 }} />;
}

export default Loader;
