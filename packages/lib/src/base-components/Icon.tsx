import { Box, styled } from "@mui/system";
import { ReactElement } from "react";

const Icon = ({ icon, className = "" }: { icon: ReactElement; className?: string }) => {
  return <StyledContainer className={`twap-icon ${className}`}>{icon}</StyledContainer>;
};

export default Icon;

const StyledContainer = styled(Box)({
  height: "fit-content",
  display: "flex",
  alignItems: "center",
});
