import { Box, styled } from "@mui/system";
import { ReactNode } from "react";

const Icon = ({ icon, className = "" }: { icon: ReactNode; className?: string }) => {
  return <StyledContainer className={`twap-icon ${className}`}>{icon}</StyledContainer>;
};

export default Icon;

const StyledContainer = styled(Box)({
  height: "fit-content",
  display: "flex",
  alignItems: "center",
});
