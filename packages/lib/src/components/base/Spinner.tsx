import { CircularProgress } from "@mui/material";
import React from "react";

function Spinner({ className }: { className?: string }) {
  return <CircularProgress className={`twap-spinner ${className}`} />;
}

export default Spinner;
