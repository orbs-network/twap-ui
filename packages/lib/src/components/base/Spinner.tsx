import { CircularProgress } from "@mui/material";
import React from "react";

function Spinner({ className, size }: { className?: string; size?: number }) {
  return <CircularProgress size={size} className={`twap-spinner ${className}`} />;
}

export default Spinner;
