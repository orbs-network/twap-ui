import { Switch as MuiSwitch } from "@mui/material";

export interface Props {
  defaultChecked?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
}

function Switch({ value, onChange, className = "", disabled = false }: Props) {
  return (
    <MuiSwitch style={{ pointerEvents: disabled ? "none" : "unset" }} className={`twap-switch ${className}`} checked={value} onChange={(event) => onChange(event.target.checked)} />
  );
}

export default Switch;
