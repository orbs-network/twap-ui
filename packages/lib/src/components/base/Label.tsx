import styled from "styled-components";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { StyledRowFlex, StyledText } from "../../styles";
import { Tooltip } from "./Tooltip";
import { useTwapContext } from "../../context";
import { ReactNode } from "react";

interface Props {
  tooltip?: string;
  className?: string;
  text: string;
}

export function Label({ tooltip, className = "", text }: Props) {
  const { components } = useTwapContext();

  if (components.Label) {
    return <components.Label text={text || ""} tooltip={tooltip} />;
  }

  return (
    <StyledContainer className={`twap-label ${className}`}>
      <StyledLabel className="twap-label-text">{text}</StyledLabel>
      {tooltip && (
        <Tooltip tooltipText={tooltip}>
          <StyledInfo>
            <AiOutlineQuestionCircle />
          </StyledInfo>
        </Tooltip>
      )}
    </StyledContainer>
  );
}

const StyledInfo = styled(StyledRowFlex)({
  position: "relative",
  top: 1,
});

const StyledContainer = styled(StyledRowFlex)({
  justifyContent: "center",
  gap: 7,
  width: "fit-content",
});

const StyledLabel = styled(StyledText)({
  fontSize: "inherit",
  fontFamily: "inherit",
});
