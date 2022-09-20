import { Box, styled } from "@mui/system";
import React, { ReactElement, ReactNode } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import CustomTooltip from "./CustomTooltip";
import Icon from "./Icon";

interface Props {
  children: ReactNode;
  text: string | ReactElement;
}

function InfoIconTooltip({ children, text }: Props) {
  return (
    <CustomTooltip text={text}>
      <StyledContainer>
        <Icon style={{ width: 18, height: 18 }} icon={AiOutlineInfoCircle} />
        {children}
      </StyledContainer>
    </CustomTooltip>
  );
}

export default InfoIconTooltip;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});
