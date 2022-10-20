import { Switch as MuiSwitch } from "@mui/material";

interface Props {
  defaultChecked?: boolean;
  value: boolean;
  onChange: () => void;
  className?: string;
}

function Switch({ value, defaultChecked = false, onChange, className = "" }: Props) {
  return <MuiSwitch className={`twap-switch ${className}`} value={value} defaultChecked={defaultChecked} onChange={onChange} />;
}

export default Switch;
