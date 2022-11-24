import { Typography } from "@mui/material";
import React, { ReactNode } from "react";

function Text({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Typography className={`twap-text ${className}`}>{children}</Typography>;
}

export default Text;
