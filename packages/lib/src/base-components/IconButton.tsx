import { IconButton as MuiIconButton } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import Tooltip from "./Tooltip";

function IconButton({ children, tooltip, onClick }: { children: ReactNode; tooltip?: ReactElement | string; onClick: () => void }) {
  return (
    <Tooltip text={tooltip}>
      <MuiIconButton onClick={onClick}>{children}</MuiIconButton>
    </Tooltip>
  );
}

export default IconButton;
