import { GlobalStyles, styled } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AdapterContextProvider, config } from "./hooks";
import translations from "./i18n/en.json";
import { ThenaTWAPProps } from "./types";
import { OrderSummary, TokenChange, TokenPanel } from "./Components";
import { configureStyles, StyledAdapter, StyledColumnFlex, StyledPoweredBy, StyledSubmit, StyledTop } from "./styles";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 90 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Limit = (props: ThenaTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens);

  return (
    <StyledAdapter isDarkMode={props.isDarkTheme ? 1 : 0} className="twap-adapter-wrapper">
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
        srcToken={props.srcToken}
        dstToken={props.dstToken}
      >
        <GlobalStyles styles={configureStyles(props.isDarkTheme) as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <StyledTop>
                <TokenPanel isSrcToken={true} />
                <TokenChange />
                <TokenPanel />
              </StyledTop>
              <Components.Base.Card>
                <Components.MarketPrice />
              </Components.Base.Card>

              <LimitPrice />
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
  return (
    <>
      <StyledLimitPrice className="twap-limit-price">
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
          </TwapStyles.StyledRowFlex>
          <Components.LimitPriceInput placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </StyledLimitPrice>
    </>
  );
};

const StyledLimitPrice = styled(Components.Base.Card)({
  ".twap-limit-price-input": {
    background: "#151519",
    padding: "5px",
    borderRadius: 8,
  },
});
