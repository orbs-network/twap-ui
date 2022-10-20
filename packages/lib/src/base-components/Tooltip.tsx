import { Tooltip as MuiTooltip } from "@mui/material";
import { Fragment, ReactElement, ReactNode } from "react";

interface Props extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  text?: string | ReactElement;
}

function Tooltip({ children, text, style }: Props) {
  if (!text) {
    return <>{children}</>;
  }
  return (
    <MuiTooltip
      title={text}
      PopperProps={{
        className: "twap-tooltip",
      }}
    >
      <span>{children}</span>
    </MuiTooltip>
  );
}

export default Tooltip;
