import { IconButton as MuiIconButton } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import Icon from "./Icon";
import Tooltip from "./Tooltip";

function IconButton({ children, tooltip, onClick, icon }: { children?: ReactNode; tooltip?: ReactElement | string; onClick: () => void; icon?: ReactElement }) {
  return (
    <Tooltip text={tooltip}>
      <MuiIconButton onClick={onClick}>
        {children}
        {icon && <Icon icon={icon} />}
      </MuiIconButton>
    </Tooltip>
  );
}

export default IconButton;
