import { keyframes, styled } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
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
  background: #f6f7f8;
  background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
  background-repeat: no-repeat;
  background-size: 800px 104px;
  position: relative;
  animation: ${shimmer} 1.2s infinite linear;
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
