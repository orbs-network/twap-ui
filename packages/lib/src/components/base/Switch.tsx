import React from "react";
import { useTwapContext } from "../../context";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  const Toggle = useTwapContext().components.Toggle;
  const handleToggle = () => {
    onChange(!checked);
  };

  if (Toggle) {
    return <Toggle checked={checked} onChange={handleToggle} />;
  }

  return null;
};
