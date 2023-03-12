import React from "react";
import { FormControlLabel, Radio as RadioButton } from "@mui/material";

export interface Props {
  label: string;
  value: string;
  className?: string;
  disabled?: boolean;
}

function Radio({ value, className = "", disabled = false, label }: Props) {
  return <FormControlLabel disabled={disabled} value={value} control={<RadioButton />} label={label} className={`twap-radio ${className}`} />;
}

export default Radio;
