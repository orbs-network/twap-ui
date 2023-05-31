import { GlobalStyles } from "@mui/material";
import { Components, hooks, store, Styles as TwapStyles, Translations, TwapAdapter } from "@orbs-network/twap-ui";
import { useCallback } from "react";
import translations from "./i18n/en.json";
import { AdapterContextProvider, config, parseToken, useGetProvider, useGlobalStyles } from "./hooks";
import { SpookySwapTWAPProps } from ".";
import { Box } from "@mui/system";
import { OrderSummary, TokenPanel } from "./Components";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 90 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Limit = (props: SpookySwapTWAPProps) => {
  const provider = useGetProvider(props.getProvider, props.account);
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(rawToken, props.getTokenImageUrl));
  const globalStyles = useGlobalStyles(props.isDarkTheme);
  const connect = useCallback(() => {
    props.connect();
  }, []);

  return (
    <TwapAdapter
      connect={connect}
      config={config}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={provider}
      storeOverride={storeOverride}
      account={props.account}
      connectedChainId={props.connectedChainId}
      tokenList={parsedTokens}
      srcToken={props.srcToken}
      dstToken={props.dstToken}
    >
      <GlobalStyles styles={globalStyles} />

      <AdapterContextProvider value={props}>
        <div className="twap-container">
          <Box>
            <TokenPanel isSrcToken={true} />
            <Box my="10px">
              <Components.ChangeTokensOrder />
            </Box>
            <TokenPanel />
          </Box>
          <LimitPrice />
          <TwapStyles.StyledRowFlex className="twap-create-order-btn">
            <Components.SubmitButton />
          </TwapStyles.StyledRowFlex>
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
  );
};

export default Limit;

const LimitPrice = () => {
  return (
    <Components.Base.Card className="twap-limit-price">
      <TwapStyles.StyledColumnFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Labels.LimitPriceLabel />
        </TwapStyles.StyledRowFlex>
        <Components.LimitPriceRadioGroup />
        <Components.LimitPriceInput placeholder="0" />
        <Components.MarketPrice />
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};
