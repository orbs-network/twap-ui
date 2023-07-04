import { IconButton as MuiIconButton } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import Icon from "./Icon";
import Tooltip from "./Tooltip";

function IconButton({
  children,
  tooltip,
  onClick,
  icon,
  className = "",
}: {
  children?: ReactNode;
  tooltip?: ReactElement | string;
  onClick: () => void;
  icon?: ReactElement;
  className?: string;
}) {
  return (
    <Tooltip text={tooltip}>
      <MuiIconButton onClick={onClick} className={`twap-icon-btn ${className}`}>
        {children}
        {icon && <Icon icon={icon} />}
      </MuiIconButton>
    </Tooltip>
  );
}

export default IconButton;
