import { Tooltip as MuiTooltip } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  text: string | ReactElement;
}

function Tooltip({ children, text }: Props) {
  return (
    <MuiTooltip title={text}>
      <span>{children}</span>
    </MuiTooltip>
  );
}

export default Tooltip;
