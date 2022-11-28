import { Typography } from "@mui/material";
import React, { CSSProperties, ReactNode } from "react";

function Text({ children, className = "", style = {} }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <Typography className={`twap-text ${className}`} style={style}>
      {children}
    </Typography>
  );
}

export default Text;
