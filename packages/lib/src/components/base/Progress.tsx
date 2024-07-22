import React from "react";
import styled, { keyframes } from "styled-components";

interface LinearProgressProps {
  value?: number;
  variant?: "determinate" | "indeterminate";
}

const indeterminate1 = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
`;

const indeterminate2 = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
`;

const ProgressBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  overflow: hidden;
`;

const ProgressBarDeterminate = styled.div<{ value: number }>`
  width: ${(props) => props.value}%;
  height: 100%;
  background-color: #3f51b5;
  transition: width 0.3s linear;
`;

const ProgressBarIndeterminate1 = styled.div`
  position: absolute;
  background-color: #3f51b5;
  height: 100%;
  animation: ${indeterminate1} 1.5s infinite linear;
`;

const ProgressBarIndeterminate2 = styled.div`
  position: absolute;
  background-color: #3f51b5;
  height: 100%;
  animation: ${indeterminate2} 1.5s infinite linear;
`;

export const LinearProgress: React.FC<LinearProgressProps> = ({ value = 0, variant = "indeterminate" }) => {
  return (
    <ProgressBarContainer>
      {variant === "determinate" ? (
        <ProgressBarDeterminate value={value} />
      ) : (
        <>
          <ProgressBarIndeterminate1 />
          <ProgressBarIndeterminate2 />
        </>
      )}
    </ProgressBarContainer>
  );
};
