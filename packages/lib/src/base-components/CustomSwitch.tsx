import { Switch } from '@mui/material';
import React from 'react'

interface Props {
  defaultChecked?: boolean;
  value: boolean;
  onChange: () => void;
}

function CustomSwitch({ value, defaultChecked = false, onChange }: Props) {
  return <Switch value={value} defaultChecked={defaultChecked} onChange={onChange} />;
}

export default CustomSwitch