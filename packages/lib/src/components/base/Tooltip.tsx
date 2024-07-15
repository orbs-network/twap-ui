import { ClickAwayListener, styled, Tooltip as MuiTooltip } from "@mui/material";
import { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { TooltipProps } from "../../types";
import { useTwapContext } from "../../context/context";

function Tooltip({ children, text, placement, childrenStyles = {} }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const uiPreferences = useTwapContext().uiPreferences;
  const ContextTooltip = uiPreferences?.Tooltip;
  const icon = uiPreferences?.tooltipIcon;
  if (!text) {
    return <>{children}</>;
  }

  if (ContextTooltip) {
    return (
      <ContextTooltip text={text} placement={placement} childrenStyles={childrenStyles}>
        {children}
      </ContextTooltip>
    );
  }

  if (isMobile) {
    return (
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <MuiTooltip
          arrow
          title={text}
          onClose={() => setOpen(false)}
          open={open}
          PopperProps={{
            className: "twap-tooltip",
            style: {
              maxWidth: 360,
            },
          }}
          placement={placement}
        >
          <StyledContent className="twap-tooltip-children" onClick={() => setOpen(true)} style={{ ...childrenStyles, minWidth: 0 }}>
            <>
              {children}
              {icon}
            </>
          </StyledContent>
        </MuiTooltip>
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
      <StyledContent style={{ ...childrenStyles }} className="twap-tooltip-children">
        <>
          {children}
          {icon}
        </>
      </StyledContent>
    </MuiTooltip>
  );
}

const StyledContent = styled("span")({
  display: "flex",
  alignItems: "center",
  gap: 5,
});

export default Tooltip;
