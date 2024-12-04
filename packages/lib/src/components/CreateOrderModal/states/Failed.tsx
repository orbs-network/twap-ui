import { styled } from "styled-components";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../../styles";
import { IoIosWarning } from "@react-icons/all-files/io/IoIosWarning";
import { BottomContent, SmallTokens } from "../Components";
import { useOrderType } from "../hooks";
import { useMemo } from "react";
import { isNativeBalanceError } from "../../../utils";
import { useTwapContext } from "../../../context/context";
import { useNetwork } from "../../../hooks";

export function Failed({ error }: { error?: any }) {
  const nativeBalance = useMemo(() => isNativeBalanceError(error), [error]);

  const nativeToken = useNetwork()?.native.symbol;
  return (
    <StyledContainer className="twap-create-order-failed">
      <Logo />
      <Title />
      {nativeBalance && <StyledText className="twap-order-modal-failed-subtitle">Insufficient {nativeToken} balance</StyledText>}
      <SmallTokens />
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
