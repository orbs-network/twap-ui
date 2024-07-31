import React, { useState } from "react";
import styled from "styled-components";

interface SwitchContainerProps {
  checked: boolean;
}

const SwitchContainer = styled.div<SwitchContainerProps>`
  display: inline-block;
  width: 50px;
  height: 25px;
  background-color: ${(props) => (props.checked ? "#4caf50" : "#ccc")};
  border-radius: 25px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
`;

interface SwitchHandleProps {
  checked: boolean;
}

const SwitchHandle = styled.div<SwitchHandleProps>`
  width: 23px;
  height: 23px;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: ${(props) => (props.checked ? "26px" : "1px")};
  transition: left 0.2s;
`;

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <SwitchContainer checked={checked} onClick={handleToggle} className={`twap-switch ${checked ? "twap-switch-checked" : ""}`}>
      <SwitchHandle checked={checked} className={`twap-switch-handle `} />
    </SwitchContainer>
  );
};
