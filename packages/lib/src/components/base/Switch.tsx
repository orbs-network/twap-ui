import { styled, Switch as MuiSwitch, SwitchProps } from "@mui/material";
import { CSSProperties } from "react";
import { useTwapContext } from "../../context/context";
import { SwitchVariant } from "../../types";
export interface Props {
  defaultChecked?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
  variant?: SwitchVariant;
  style?: CSSProperties;
}

function Switch({ value, onChange, className = "", disabled = false, variant, style = {} }: Props) {
  const { switchVariant } = useTwapContext().uiPreferences;

  const props = {
    style: { pointerEvents: disabled ? "none" : "unset" } as CSSProperties,
    className: `twap-switch ${className}`,
    checked: value,
    onChange: (event: any) => onChange(event.target.checked),
  };

  const _variant = variant || switchVariant;

  if (_variant === "ios") {
    return <IOSSwitch {...props} style={style} disabled={disabled} />;
  }

  return <MuiSwitch {...props} style={style} disabled={disabled} />;
}

const IOSSwitch = styled((props: SwitchProps) => <MuiSwitch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(({ theme }) => ({
  width: 50,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 3,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(24px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 20,
    height: 20,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export { Switch, IOSSwitch };
