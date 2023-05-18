import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { useCallback, useEffect } from "react";
import { AdapterContextProvider, config, parseToken, useGlobalStyles } from "./hooks";
import translations from "./i18n/en.json";
import { QuickSwapTWAPProps } from "./types";
import { Box } from "@mui/system";
import { Card, OrderSummary, TokenPanel } from "./Components";
import { StyledColumnFlex, StyledContainer, StyledPoweredBy, StyledSubmit, StyledTokenChange } from "./styles";

const TWAP = (props: QuickSwapTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(props.getTokenLogoURL, rawToken));

  const setLimitOrder = store.useTwapStore((store) => store.setLimitOrder);

  hooks.useSetTokensFromDapp(props.srcToken, props.dstToken);
  const globalStyles = useGlobalStyles(props.isProMode, props.isDarkTheme);

  const connect = useCallback(() => {
    props.connect();
  }, []);

  useEffect(() => {
    setLimitOrder(false);
  }, []);

  return (
    <Box className="twap-adapter-wrapper">
      <TwapAdapter
        connect={connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        tokenList={parsedTokens}
      >
        <GlobalStyles styles={globalStyles as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <TokenPanel isSrcToken={true} />
              <StyledTokenChange />
              <TokenPanel />
              <Components.MarketPrice />
              <LimitPrice />
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

export default TWAP;

const TradeSize = () => {
  return (
    <Card className="twap-trade-size">
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
          <Components.ChunksSliderSelect />
          <Components.ChunksInput />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <TwapStyles.StyledRowFlex justifyContent="flex-start" width="fit-content">
            <Components.Labels.ChunksAmountLabel />
            <Components.TokenLogoAndSymbol isSrc={true} />
          </TwapStyles.StyledRowFlex>
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Card>
  );
};

const MaxDuration = () => {
  return (
    <Card className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Card>
  );
};

const TradeInterval = () => {
  return (
    <Card className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Card>
  );
};

export const LimitPrice = () => {
  return (
    <>
      <Card className="twap-limit-price">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Labels.LimitPriceLabel />
          <Components.LimitPriceToggle />{" "}
        </TwapStyles.StyledRowFlex>
        <Components.LimitPriceInput placeholder="0" />
      </Card>
    </>
  );
};
