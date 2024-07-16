import { IconButton as MuiIconButton, styled } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import Icon from "./Icon";
import Tooltip from "./Tooltip";

function IconButton({
  children,
  tooltip,
  onClick,
  icon,
  className = "",
  disabled,
}: {
  children?: ReactNode;
  tooltip?: ReactElement | string;
  onClick: (e: any) => void;
  icon?: ReactElement;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip text={tooltip}>
      <MuiIconButton disabled={disabled} onClick={onClick} className={`twap-icon-btn ${className}`}>
        {children}
        {icon && <Icon icon={icon} />}
      </MuiIconButton>
    </Tooltip>
  );
}

export default IconButton;
