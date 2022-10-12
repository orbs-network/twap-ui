import React from "react";
import Skeleton from "@mui/material/Skeleton";

function Loader({ width = "100%", height = "20px" }: { width?: string; height?: string }) {
  return <Skeleton animation="wave" width={width} height={height} style={{ opacity: 0.7 }} />;
}

export default Loader;
