import { Switch as MuiSwitch } from "@mui/material";

export interface Props {
  defaultChecked?: boolean;
  value: boolean;
  onChange: () => void;
  className?: string;
  disabled?: boolean;
}

function Switch({ value, onChange, className = "", disabled = false }: Props) {
  return <MuiSwitch style={{ pointerEvents: disabled ? "none" : "unset" }} className={`twap-switch ${className}`} value={value} onChange={onChange} />;
}

export default Switch;
