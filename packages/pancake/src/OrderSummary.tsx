import { styled } from "@mui/material";
import { Styles as TwapStyles, Components, store, hooks, useTwapContext } from "@orbs-network/twap-ui";
import { StyledDisclaimer, StyledOrderSummary, StyledOrderSummaryInfo } from "./styles";
import { useAdapterContext } from "./context";
import { ArrowBottom, InfoIcon } from "./icons";

const Expiration = () => {
  const t = useTwapContext().translations;
  const deadline = hooks.useDeadline();

  return <Components.OrderDetails.Expiry expiryMillis={deadline} />;
};

const Price = () => {
  const price = hooks.useTradePrice().priceUI;
  const { srcToken, dstToken } = store.useTwapStore((store) => ({
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
  return <Components.OrderDetails.Price price={price} srcToken={srcToken} dstToken={dstToken} />;
};

const MinReceived = () => {
  const minReceived = hooks.useDstMinAmountOut().amountUI;
  const { isLimitOrder, dstToken } = store.useTwapStore((store) => ({
    dstToken: store.dstToken,
    isLimitOrder: store.isLimitOrder,
  }));
  return <Components.OrderDetails.MinReceived symbol={dstToken?.symbol} minReceived={minReceived} isMarketOrder={!isLimitOrder} />;
};

const TotalTrades = () => {
  const chunks = hooks.useChunks();
  return <Components.OrderDetails.TotalTrades totalTrades={chunks} />;
};

const SizePerTrade = () => {
  const token = store.useTwapStore((store) => store.srcToken);
  const sizePerTrade = hooks.useSrcChunkAmountUi();
  return <Components.OrderDetails.SizePerTrade symbol={token?.symbol} sizePerTrade={sizePerTrade} />;
};

const TradeInterval = () => {
  const tradeInterval = store.useTwapStore((s) => s.getFillDelayUiMillis());
  return <Components.OrderDetails.TradeInterval tradeIntervalMillis={tradeInterval} />;
};

const Fee = () => {
  const fee = useTwapContext().fee;
  const dstToken = store.useTwapStore((store) => store.dstToken);
  const outAmount = hooks.useDstAmount().amountUI;
  console.log({ outAmount });

  return <Components.OrderDetails.Fee outAmount={outAmount} dstToken={dstToken} fee={fee} />;
};

export const OrderSummary = ({ onSubmit, disabled }: { onSubmit: () => void; disabled?: boolean }) => {
  const Button = useAdapterContext().Button;
  return (
    <StyledOrderSummary>
      <StyledTokens>
        <TokenDisplay isSrc={true} />
        <ArrowBottom />
        <TokenDisplay />
      </StyledTokens>

      <StyledOrderSummaryInfo>
        <Price />
        <Expiration />
        <MinReceived />
        <TotalTrades />
        <SizePerTrade />
        <TradeInterval />
        <Fee />
      </StyledOrderSummaryInfo>

      <StyledDisclaimer>
        <InfoIcon />
        <Components.DisclaimerText />
      </StyledDisclaimer>
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

const TokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const { token, srcAmount } = store.useTwapStore((store) => ({
    token: isSrc ? store.srcToken : store.dstToken,
    srcAmount: store.srcAmountUi,
  }));
  const dstAmount = hooks.useDstAmount().amountUI;
  const _amount = isSrc ? srcAmount : dstAmount;

  const amount = hooks.useFormatNumber({ value: _amount, decimalScale: 6 });

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
  svg: {
    width: 24,
    height: 24,
  },
});

const StyledTokenDisplayRight = styled(TwapStyles.StyledRowFlex)({
  width: "auto",
  p: {
    fontSize: 20,
    fontWeight: 600,
  },
  ".twap-token-logo": {
    width: 40,
    height: 40,
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
