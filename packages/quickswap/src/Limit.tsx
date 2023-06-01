import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { useCallback } from "react";
import { AdapterContextProvider, config, parseToken, useGlobalStyles } from "./hooks";
import translations from "./i18n/en.json";
import { QuickSwapTWAPProps } from "./types";
import { Box } from "@mui/system";
import { ChangeTokensOrder, OrderSummary, TokenPanel } from "./Components";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 90 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Limit = (props: QuickSwapTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(props.getTokenLogoURL, rawToken));

  const globalStyles = useGlobalStyles(props.isProMode, props.isDarkTheme);

  const connect = useCallback(() => {
    props.connect();
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
        tokenList={parsedTokens}
        storeOverride={storeOverride}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
      >
        <GlobalStyles styles={globalStyles as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <TokenPanel isSrcToken={true} />
            <ChangeTokensOrder />
            <TokenPanel />
            <Components.MarketPrice />
            <TwapStyles.StyledColumnFlex gap={12}>
              <LimitPrice />
              <Components.SubmitButton isMain />
            </TwapStyles.StyledColumnFlex>
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