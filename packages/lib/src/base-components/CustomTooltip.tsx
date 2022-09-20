import { Tooltip } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  text: string | ReactElement;
}

function CustomTooltip({ children, text }: Props) {
  return (
    <Tooltip title={text}>
      <span>{children}</span>
    </Tooltip>
  );
}

export default CustomTooltip;
