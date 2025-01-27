import React, { ReactNode } from "react";
import styled from "styled-components";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { StyledRowFlex, StyledText } from "../../styles";
import { useWidgetContext } from "../../context/context";
import { Tooltip } from "../Components";

interface Props {
  children: string | number | ReactNode;
  className?: string;
}

export function Label({ children, className = "" }: Props) {
  return <StyledContainer className={`twap-label ${className}`}>{children}</StyledContainer>;
}

const Text = ({ text, fontSize }: { text: ReactNode; fontSize?: string }) => {
  return (
    <StyledLabel className="twap-label-text" style={{ fontSize }}>
      {text}
    </StyledLabel>
  );
};

const Info = ({ text }: { text: string }) => {
  const { uiPreferences } = useWidgetContext();
  const InfoIcon = <AiOutlineQuestionCircle />;

  return (
    <Tooltip tooltipText={text}>
      <StyledInfo> {InfoIcon}</StyledInfo>
    </Tooltip>
  );
};

Label.Text = Text;
Label.Info = Info;

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
