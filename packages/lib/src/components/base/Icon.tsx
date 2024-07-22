import { styled } from "styled-components";
import { ReactNode } from "react";

const Icon = ({ icon, className = "" }: { icon: ReactNode; className?: string }) => {
  return <StyledContainer className={`twap-icon ${className}`}>{icon}</StyledContainer>;
};

export default Icon;

const StyledContainer = styled("div")({
  height: "fit-content",
  display: "flex",
  alignItems: "center",
});
