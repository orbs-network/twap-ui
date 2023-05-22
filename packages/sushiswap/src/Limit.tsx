import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { useEffect } from "react";
import { AdapterContextProvider, config } from "./hooks";
import translations from "./i18n/en.json";
import { ThenaTWAPProps } from "./types";
import { OrderSummary, TokenChange, TokenPanel } from "./Components";
import { configureStyles, StyledAdapter, StyledColumnFlex, StyledPoweredBy, StyledSubmit } from "./styles";

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
    <StyledAdapter className="twap-adapter-wrapper">
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
        <GlobalStyles styles={configureStyles() as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <TwapStyles.StyledColumnFlex gap={8}>
                <TokenPanel isSrcToken={true} />
                <TokenChange />
                <TokenPanel />
              </TwapStyles.StyledColumnFlex>
              <Components.Base.Card>
                <Components.MarketPrice />
              </Components.Base.Card>

              <Components.Base.Card>
                <LimitPrice />
              </Components.Base.Card>
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
    </StyledAdapter>
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
