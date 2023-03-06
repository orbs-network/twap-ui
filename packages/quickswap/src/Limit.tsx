import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store, SIMPLE_LIMIT_ORDER_DURATION_DAYS } from "@orbs-network/twap-ui";
import { useCallback, useEffect } from "react";
import { AdapterContextProvider, config, parseToken, useGlobalStyles } from "./hooks";
import translations from "./i18n/en.json";
import { QuickSwapTWAPProps } from "./types";
import { Box } from "@mui/system";
import { ChangeTokensOrder, OrderSummary, TokenPanel } from "./Components";

const Limit = (props: QuickSwapTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(props.getTokenLogoURL, rawToken));

  hooks.useSetTokensFromDapp(props.srcToken, props.dstToken);
  const globalStyles = useGlobalStyles();

  const connect = useCallback(() => {
    props.connect();
  }, []);

  const setChunks = store.useTwapStore((store) => store.setChunks);
  const setFillDelay = store.useTwapStore((store) => store.setFillDelay);
  const setDuration = store.useTwapStore((store) => store.setDuration);

  useEffect(() => {
    resetValues();
  }, []);

  const resetValues = useCallback(() => {
    setChunks(1);
    setFillDelay({ resolution: store.TimeResolution.Minutes, amount: 2 });
    setDuration({ resolution: store.TimeResolution.Days, amount: SIMPLE_LIMIT_ORDER_DURATION_DAYS });
  }, []);

  return (
    <Box className="adapter-wrapper">
      <TwapAdapter
        connect={connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        tokensList={parsedTokens}
      >
        <GlobalStyles styles={globalStyles as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <TokenPanel isSrcToken={true} />
            <ChangeTokensOrder />
            <TokenPanel />
            <Components.MarketPrice />
            <LimitPrice />
            <Box mb={2} mt={3}>
              <Components.SubmitButton onPlaceOrderClick={resetValues} />
            </Box>
            <OrderSummary>
              <TwapStyles.StyledColumnFlex>
                <Components.OrderSummaryDetailsDeadline />
                <Components.OrderSummaryDetailsOrderType />
                <Components.OrderSummaryDetailsChunkSize />
                <Components.OrderSummaryDetailsMinDstAmount />
              </TwapStyles.StyledColumnFlex>
            </OrderSummary>
            <Components.PoweredBy />
          </div>
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

export default Limit;

const LimitPrice = () => {
  const marketPriceUi = store.useTwapStore((store) => store.getMarketPrice(false)).marketPriceUi;

  const setLimitOrder = store.useTwapStore((store) => store.setLimitOrder);
  useEffect(() => {
    if (Number(marketPriceUi) > 0) {
      setTimeout(() => {
        setLimitOrder(true);
      }, 0);
    }
  }, [marketPriceUi]);

  return (
    <>
      <Components.Base.Card className="twap-limit-price">
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
          </TwapStyles.StyledRowFlex>
          <Components.LimitPriceInput placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </Components.Base.Card>
    </>
  );
};
