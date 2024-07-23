import React from "react";
import { styled, keyframes } from "styled-components";

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const CircularContainer = styled.div<{ size: number, color?: string }>`
  display: inline-block;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid ${(props) => props.color || "#3f51b5"};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

interface CircularProgressProps {
  size?: number;
  className?: string;
  color?: string;
}

// Circular Progress component
export const Spinner: React.FC<CircularProgressProps> = ({ size = 40, className = "", color }) => {
return <CircularContainer size={size} className={`twap-spinner ${className}`} color={color} />;
};
