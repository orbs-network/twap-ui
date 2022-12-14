import { ClickAwayListener, Tooltip as MuiTooltip } from "@mui/material";
import { CSSProperties, ReactElement, ReactNode, useState } from "react";
import { isMobile } from "react-device-detect";

interface Props extends React.HTMLAttributes<HTMLElement> {
  childrenStyles?: CSSProperties;
  children: ReactNode;
  text?: string | ReactElement | number;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
}

function Tooltip({ children, text, placement, childrenStyles }: Props) {
  const [open, setOpen] = useState(false);

  if (!text) {
    return <>{children}</>;
  }

  if (isMobile) {
    return (
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <MuiTooltip
            arrow
            title={text}
            onClose={() => setOpen(false)}
            open={open}
            PopperProps={{
              className: "twap-tooltip",
              disablePortal: true,
              style: {
                maxWidth: 200,
              },
            }}
            placement="bottom"
          >
            <span onClick={() => setOpen(true)} style={childrenStyles}>
              {children}
            </span>
          </MuiTooltip>
        </div>
      </ClickAwayListener>
    );
  }

  return (
    <MuiTooltip
      arrow
      title={text}
      PopperProps={{
        className: "twap-tooltip",
        style: {
          maxWidth: 350,
        },
      }}
      placement={placement}
    >
      <span style={childrenStyles}>{children}</span>
    </MuiTooltip>
  );
}

export default Tooltip;
