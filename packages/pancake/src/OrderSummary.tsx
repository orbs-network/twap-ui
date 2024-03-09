import { styled, Typography } from "@mui/material";
import { Styles as TwapStyles, Components, store, hooks } from "@orbs-network/twap-ui";
import { StyledOrderSummary } from "./styles";
import { MdArrowDownward } from "@react-icons/all-files/md/MdArrowDownward";
import { ReactNode } from "react";
import { useAdapterContext } from "./context";
import { Price } from "./components";

export const OrderSummary = ({ onSubmit, disabled }: { onSubmit: () => void; disabled?: boolean }) => {
  const limit = store.useTwapStore((store) => store.isLimitOrder);
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
            {limit ? (
              <>
                <Price />
                <Components.OrderSummaryDetailsDeadline />
                <Components.OrderSummaryDetailsOrderType />
                <Components.OrderSummaryDetailsChunkSize />
                <Components.OrderSummaryDetailsMinDstAmount />
              </>
            ) : (
              <>
                <Price />
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
});

const TokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const { token, srcAmount } = store.useTwapStore((store) => ({
    token: isSrc ? store.srcToken : store.dstToken,
    srcAmount: store.srcAmountUi,
  }));

  const amount = hooks.useFormatNumber({ value: srcAmount, decimalScale: 3 });

  return (
    <StyledTokenDisplay>
      <StyledTokenDisplayAmount>{amount || 20.2}</StyledTokenDisplayAmount>
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

const SummaryRow = ({ children }: { children: ReactNode }) => {
  return <TwapStyles.StyledSummaryRow className="twap-order-summary-details-item">{children}</TwapStyles.StyledSummaryRow>;
};
