import { Tooltip as MuiTooltip } from "@mui/material";
import { CSSProperties, Fragment, ReactElement, ReactNode } from "react";

interface Props extends React.HTMLAttributes<HTMLElement> {
  childrenStyles?: CSSProperties;
  children: ReactNode;
  text?: string | ReactElement;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
}

function Tooltip({ children, text, placement, childrenStyles }: Props) {
  if (!text) {
    return <>{children}</>;
  }
  return (
    <MuiTooltip
      arrow
      title={text}
      PopperProps={{
        className: "twap-tooltip",
      }}
      placement={placement}
    >
      <span style={childrenStyles}>{children}</span>
    </MuiTooltip>
  );
}

export default Tooltip;
