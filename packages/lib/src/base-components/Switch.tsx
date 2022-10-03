import { Switch as MuiSwitch } from "@mui/material";

interface Props {
  defaultChecked?: boolean;
  value: boolean;
  onChange: () => void;
}

function Switch({ value, defaultChecked = false, onChange }: Props) {
  return <MuiSwitch className="twap-switch" value={value} defaultChecked={defaultChecked} onChange={onChange} />;
}

export default Switch;
