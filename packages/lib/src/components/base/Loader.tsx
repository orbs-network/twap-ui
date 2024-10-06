import { keyframes, styled } from "styled-components";

const fade = keyframes`
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
`;

interface Shared {
  width?: number | string;
  height?: number | string;
  borderRadius?: string;
  margin?: string;
}

// Styled component for the skeleton loader
const SkeletonWrapper = styled.div<Shared>`
  display: inline-block;
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "100%"};
  background-color: #f6f7f8;
  position: relative;
  animation: ${fade} 1.5s infinite ease-in-out;
  border-radius: ${(props) => props.borderRadius || "4px"};
  margin: ${(props) => props.margin || "0"};
`;

interface SkeletonLoaderProps extends Shared {
  className?: string;
}

// Skeleton Loader component
export const Loader: React.FC<SkeletonLoaderProps> = ({ width, height, borderRadius, margin, className = "" }) => {
  return <SkeletonWrapper className={`twap-loader ${className}`} width={width} height={height} borderRadius={borderRadius} margin={margin} />;
};
