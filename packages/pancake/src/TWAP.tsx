import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AdapterContextProvider, config, parseToken, useAdapterContext } from "./hooks";
import translations from "./i18n/en.json";
import { ThenaTWAPProps } from "./types";
import { Box } from "@mui/system";
import { ChangeTokensOrder, Container, CurrentMarketPrice, OrderSummary, TokenPanel } from "./Components";
import { configureStyles, StyledChunksInput, StyledChunksSlider, StyledColumnFlex, StyledPoweredBy, StyledSubmit } from "./styles";
import { TwapErrorWrapper } from "@orbs-network/twap-ui";

const TWAP = (props: ThenaTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens, parseToken);

  return (
    <Box className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        tokenList={parsedTokens}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
      >
        <GlobalStyles styles={configureStyles(props.isDarkTheme) as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <TokenPanel isSrcToken={true} />
              <ChangeTokensOrder />
              <TokenPanel />
              <CurrentMarketPrice />
              <LimitPrice />
              <TotalTrades />
              <TradeSize />
              <TradeInterval />
              <MaxDuration />
              <StyledSubmit isMain />
            </StyledColumnFlex>
            <OrderSummary>
              <Components.OrderSummaryDetails />
            </OrderSummary>
            <StyledPoweredBy />
          </div>
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

const Test = (props: ThenaTWAPProps) => {
  return (
    <TwapErrorWrapper>
      <TWAP {...props} />
    </TwapErrorWrapper>
  );
};

export default Test;

const TotalTrades = () => {
  const { isDarkTheme } = useAdapterContext();
  const getChunksBiggerThanOne = store.useTwapStore((store) => store.getChunksBiggerThanOne());

  return (
    <Container enabled={getChunksBiggerThanOne ? 1 : 0} label={<Components.Labels.TotalTradesLabel />}>
      <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between">
        <StyledChunksSlider isDarkTheme={isDarkTheme ? 1 : 0} />
        <StyledChunksInput />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const TradeSize = () => {
  return (
    <TwapStyles.StyledRowFlex className="twap-trade-size" justifyContent="space-between">
      <Components.Labels.ChunksAmountLabel />
      <TwapStyles.StyledRowFlex style={{ width: "unset", minWidth: 0 }}>
        <Components.TradeSize hideLabel={true} />
        <Components.ChunksUSD symbol="USD" emptyUi={<></>} />
      </TwapStyles.StyledRowFlex>
    </TwapStyles.StyledRowFlex>
  );
};

const MaxDuration = () => {
  return (
    <Container enabled={1} label={<Components.Labels.MaxDurationLabel />}>
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const TradeInterval = () => {
  return (
    <Container enabled={1} label={<Components.Labels.TradeIntervalLabel />}>
      <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
        <Components.FillDelayWarning />
        <Components.TradeIntervalSelector />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

export const LimitPrice = () => {
  const isLimitOrder = store.useTwapStore((store) => store.isLimitOrder);

  return (
    <Container
      enabled={1}
      hideChildren={!isLimitOrder}
      label={
        <TwapStyles.StyledRowFlex justifyContent="flex-start">
          <Components.Labels.LimitPriceLabel />
          <Components.LimitPriceToggle variant="ios" />
        </TwapStyles.StyledRowFlex>
      }
    >
      <Components.LimitPriceInput placeholder="0" />
    </Container>
  );
};
