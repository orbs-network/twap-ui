import { styled } from "@mui/material";
import { Styles as TwapStyles, Components, store, hooks } from "@orbs-network/twap-ui";
import { StyledOrderSummary } from "./styles";
import { MdArrowDownward } from "@react-icons/all-files/md/MdArrowDownward";
import { useAdapterContext } from "./context";
import { useCallback, useState } from "react";

export const OrderSummary = ({ onSubmit, disabled, isLimitPanel }: { onSubmit: () => void; disabled?: boolean; isLimitPanel?: boolean }) => {
  const Button = useAdapterContext().Button;
  return (
    <StyledOrderSummary gap={14}>
      <TwapStyles.StyledColumnFlex gap={14}>
        <StyledTokens>
          <TokenDisplay isSrc={true} />
          <StyledArrow />
          <TokenDisplay />
        </StyledTokens>
        <Components.Base.Card>
          <StyledSummaryDetails>
            {isLimitPanel ? (
              <>
                <Components.OrderSummaryDetailsDeadline />
                <Components.OrderSummaryDetailsOrderType />
                <Components.OrderSummaryDetailsChunkSize />
                <Components.OrderSummaryDetailsMinDstAmount />
              </>
            ) : (
              <>
                <Components.OrderSummaryDetailsDeadline />
                <Components.OrderSummaryDetailsOrderType />
                <Components.OrderSummaryDetailsChunkSize />
                <Components.OrderSummaryDetailsTotalChunks />
                <Components.OrderSummaryDetailsTradeInterval />
                <Components.OrderSummaryDetailsMinDstAmount />
              </>
            )}
          </StyledSummaryDetails>
        </Components.Base.Card>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={10}>
            <Components.DisclaimerText />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
      <Components.Base.Card>
        <TwapStyles.StyledColumnFlex gap={12}>
          <Components.AcceptDisclaimer />
          <Components.OutputAddress ellipsis={13} />
        </TwapStyles.StyledColumnFlex>
      </Components.Base.Card>
      <StyledButtonContainer>
        <Button disabled={disabled} onClick={onSubmit}>
          Confirm Order
        </Button>
      </StyledButtonContainer>
    </StyledOrderSummary>
  );
};

const StyledButtonContainer = styled(TwapStyles.StyledRowFlex)({
  width: "100%",
  button: {
    width: "100%",
  },
});

const StyledSummaryDetails = styled(TwapStyles.StyledColumnFlex)({
  gap: 9,
  ".twap-token-logo": {
    display: "none",
  },
  "@media(max-width: 700px)": {
    gap: 6,
  },
});

const TokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const { token, srcAmount } = store.useTwapStore((store) => ({
    token: isSrc ? store.srcToken : store.dstToken,
    srcAmount: store.srcAmountUi,
  }));
  const dstAmount = hooks.useOutAmount().outAmountUi;

  const _amount = isSrc ? srcAmount : dstAmount;

  const amount = hooks.useFormatNumber({ value: _amount, decimalScale: 3 });

  return (
    <StyledTokenDisplay>
      <StyledTokenDisplayAmount>{amount}</StyledTokenDisplayAmount>
      <StyledTokenDisplayRight>
        <TwapStyles.StyledText>{token?.symbol}</TwapStyles.StyledText>
        <Components.Base.TokenLogo logo={token?.logoUrl} />
      </StyledTokenDisplayRight>
    </StyledTokenDisplay>
  );
};

const StyledTokens = styled(TwapStyles.StyledColumnFlex)({
  gap: 12,
  alignItems: "center",
});

const StyledArrow = styled(MdArrowDownward)({
  width: 24,
  height: 24,
});

const StyledTokenDisplayRight = styled(TwapStyles.StyledRowFlex)({
  width: "auto",
  p: {
    fontSize: 14,
  },
  ".twap-token-logo": {
    width: 24,
    height: 24,
  },
});

const StyledTokenDisplayAmount = styled(TwapStyles.StyledOneLineText)({
  fontWeight: 600,
  fontSize: 24,
});
const StyledTokenDisplay = styled(TwapStyles.StyledRowFlex)({
  justifyContent: "space-between",
  gap: 30,
});
