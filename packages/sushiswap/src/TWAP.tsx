import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AdapterContextProvider, config } from "./hooks";
import translations from "./i18n/en.json";
import { ThenaTWAPProps } from "./types";
import { OrderSummary, TokenChange, TokenPanel } from "./Components";
import { configureStyles, StyledAdapter, StyledColumnFlex, StyledLimitPrice, StyledMarketPrice, StyledPoweredBy, StyledSubmit } from "./styles";

const TWAP = (props: ThenaTWAPProps) => {
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
        srcToken={props.srcToken}
        dstToken={props.dstToken}
      >
        <GlobalStyles styles={configureStyles(props.isDarkTheme) as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <TwapStyles.StyledColumnFlex gap={8}>
                <TokenPanel isSrcToken={true} />
                <TokenChange />
                <TokenPanel />
              </TwapStyles.StyledColumnFlex>
              <StyledMarketPrice />
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
    </StyledAdapter>
  );
};

export default TWAP;

const TradeSize = () => {
  return (
    <Components.Base.Card className="twap-trade-size">
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
    </Components.Base.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

export const LimitPrice = () => {
  return (
    <>
      <Components.Base.Card className="twap-limit-price">
        <TwapStyles.StyledColumnFlex alignItems="center">
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            <Components.LimitPriceToggle />
          </TwapStyles.StyledRowFlex>
          <StyledLimitPrice placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </Components.Base.Card>
    </>
  );
};
