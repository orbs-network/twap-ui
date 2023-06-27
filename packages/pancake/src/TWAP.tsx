import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles } from "@orbs-network/twap-ui";
import { AdapterContextProvider, config, parseToken } from "./hooks";
import translations from "./i18n/en.json";
import { ThenaTWAPProps } from "./types";
import { Box } from "@mui/system";
import { ChangeTokensOrder, Container, CurrentMarketPrice, OrderSummary, TokenPanel } from "./Components";
import { configureStyles, StyledChunksInput, StyledChunksSlider, StyledColumnFlex, StyledSubmit } from "./styles";
import { store } from "@orbs-network/twap-ui";

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
            {/* <StyledPoweredBy /> */}
          </div>
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

export default TWAP;

const TotalTrades = () => {
  const getChunksBiggerThanOne = store.useTwapStore((store) => store.getChunksBiggerThanOne());
  return (
    <Container enabled={getChunksBiggerThanOne ? 1 : 0} label={<Components.Labels.TotalTradesLabel />}>
      <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between">
        <StyledChunksSlider />
        <StyledChunksInput />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const TradeSize = () => {
  return (
    <Container label={<Components.Labels.ChunksAmountLabel />}>
      <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
        <Components.TradeSize hideLabel={true} />
        <Components.ChunksUSD symbol="USD" />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const MaxDuration = () => {
  return (
    <Container enabled={1} label={<Components.Labels.MaxDurationLabel />}>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const TradeInterval = () => {
  return (
    <Container enabled={1} label={<Components.Labels.TradeIntervalLabel />}>
      <Components.FillDelayWarning />
      <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
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
