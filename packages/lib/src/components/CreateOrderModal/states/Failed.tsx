import { styled } from "styled-components";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../../styles";
import { IoIosWarning } from "@react-icons/all-files/io/IoIosWarning";
import { useOrderType } from "../hooks";
import React, { useMemo } from "react";
import { isNativeBalanceError } from "../../../utils";
import { useNetwork } from "../../../hooks/hooks";

export function Failed({ error }: { error?: any }) {
  const nativeBalance = useMemo(() => isNativeBalanceError(error), [error]);

  const nativeToken = useNetwork()?.native.symbol;
  return (
    <StyledContainer className="twap-create-order-failed">
      <Logo />
      <Title />
      {nativeBalance && <StyledText className="twap-order-modal-failed-subtitle">Insufficient {nativeToken} balance</StyledText>}
      <BottomContent text="Learn more" href="https://www.orbs.com/dtwap-and-dlimit-faq/" />
    </StyledContainer>
  );
}

const Title = () => {
  const type = useOrderType();

  return <StyledTitle className="twap-order-modal-failed-title">{`${type} order failed`}</StyledTitle>;
};

const StyledTitle = styled(StyledText)({
  fontSize: 24,
});

const Logo = () => {
  return (
    <StyledLogo className="twap-order-modal-failed-logo">
      <IoIosWarning />
    </StyledLogo>
  );
};

const StyledLogo = styled(StyledRowFlex)({
  background: "rgba(255, 255, 255, 0.07)",
  width: 48,
  height: 48,
  borderRadius: 12,
  svg: {
    fill: "rgb(155, 155, 155)",
    width: 24,
    height: 24,
  },
});

const StyledContainer = styled(StyledColumnFlex)({
  alignItems: "center",
  ".twap-order-modal-failed-subtitle": {
    fontSize: 15,
    fontWeight: 500,
  },
});

export const BottomContent = ({ href, text }: { href?: string; text?: string }) => {
  let content;
  if (href) {
    content = (
      <a href={href} target="_blank" className="twap-order-modal-link">
        {text}
      </a>
    );
  } else {
    content = <StyledBottomContentText>{text}</StyledBottomContentText>;
  }

  return <StyledBottomContent className="twap-order-modal-bottom-content">{content}</StyledBottomContent>;
};

const StyledBottomContent = styled(StyledColumnFlex)({
  marginTop: 40,
  alignItems: "center",
});

const StyledBottomContentText = styled(StyledText)({
  textAlign: "center",
  color: "rgb(155, 155, 155)",
  fontSize: 14,
  fontWeight: 500,
});
