import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { useEffect } from "react";
import { AdapterContextProvider, config } from "./hooks";
import translations from "./i18n/en.json";
import { ThenaTWAPProps } from "./types";
import { Box } from "@mui/system";
import { Card, OrderSummary, TokenPanel } from "./Components";
import { configureStyles, StyledColumnFlex, StyledPoweredBy, StyledSubmit, StyledTokenChange } from "./styles";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 90 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Limit = (props: ThenaTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens);
  hooks.useSetTokensFromDapp(props.srcToken, props.dstToken);

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
        storeOverride={storeOverride}
      >
        <GlobalStyles styles={configureStyles(props.isDarkTheme) as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <TokenPanel isSrcToken={true} />
              <StyledTokenChange />
              <TokenPanel />
              <Card>
                <Components.MarketPrice />
              </Card>

              <Card>
                <LimitPrice />
              </Card>
              <StyledSubmit isMain />
            </StyledColumnFlex>
            <OrderSummary>
              <TwapStyles.StyledColumnFlex>
                <Components.OrderSummaryDetailsDeadline />
                <Components.OrderSummaryDetailsOrderType />
                <Components.OrderSummaryDetailsChunkSize />
                <Components.OrderSummaryDetailsMinDstAmount />
              </TwapStyles.StyledColumnFlex>
            </OrderSummary>
            <StyledPoweredBy />
          </div>
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

export default Limit;

const LimitPrice = () => {
  const setLimitOrder = store.useTwapStore((store) => store.setLimitOrder);
  useEffect(() => {
    setLimitOrder(true);
  }, []);

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
