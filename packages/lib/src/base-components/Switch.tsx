import { Switch as MuiSwitch } from "@mui/material";

interface Props {
  defaultChecked?: boolean;
  value: boolean;
  onChange: () => void;
  className?: string;
  disabled?: boolean;
}

function Switch({ value, defaultChecked = false, onChange, className = "", disabled = false }: Props) {
  return (
    <MuiSwitch style={{ pointerEvents: disabled ? "none" : "unset" }} className={`twap-switch ${className}`} value={value} defaultChecked={defaultChecked} onChange={onChange} />
  );
}

export default Switch;
