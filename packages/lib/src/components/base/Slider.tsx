import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
function calculateValue(value: number) {
  return value;
}

export interface Props {
  onChange: (value: number) => void;
  value: number;
  maxTrades: number;
  className?: string;
  label?: string;
  min?: number;
}
const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 5px;
  margin: 20px 0;
`;

const SliderTrack = styled.div<{ width: number }>`
  position: absolute;
  height: 100%;
  background: #3f51b5;
  border-radius: 5px;
  width: ${(props) => props.width}%;
`;

const SliderThumb = styled.div<{ left: number }>`
  position: absolute;
  top: -5px;
  width: 16px;
  height: 16px;
  background: #3f51b5;
  border-radius: 50%;
  cursor: pointer;
  left: ${(props) => props.left}%;
  transform: translateX(-50%);
`;

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

// Slider component
export const Slider: React.FC<SliderProps> = ({ min, max, value, onChange, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const sliderRect = (e.target as HTMLDivElement).getBoundingClientRect();
        const newValue = Math.min(max, Math.max(min, min + ((e.clientX - sliderRect.left) / sliderRect.width) * (max - min)));
        onChange(newValue);
      }
    },
    [isDragging, max, min, onChange]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const valuePercentage = ((value - min) / (max - min)) * 100;

  return (
    <SliderContainer className={`twap-slider ${className}`} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <SliderTrack width={valuePercentage} />
      <SliderThumb left={valuePercentage} />
    </SliderContainer>
  );
};
