import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";

function SmallLabel({ children }: { children?: string | ReactNode }) {
  return <StyledText>{children}</StyledText>;
}

export default SmallLabel;

const StyledText = styled(Typography)({});
