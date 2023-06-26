import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles } from "@orbs-network/twap-ui";
import { useEffect, useState } from "react";
import { AdapterContextProvider, config, parseToken } from "./hooks";
import translations from "./i18n/en.json";
import { ChronosTWAPProps } from "./types";
import { Box } from "@mui/system";
import { ChangeTokensOrder, MarketPrice, OrderSummary, TokenPanel, USD } from "./Components";
import {
  configureStyles,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledMaxDuration,
  StyledPoweredByOrbs,
  StyledSubmit,
  StyledTopColumnFlex,
  StyledTradeInterval,
  StyledTradeSize,
  StyledWarningMsg,
} from "./styles";

const TWAP = (props: ChronosTWAPProps) => {
  const [appReady, setAppReady] = useState(false);
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(props.getTokenLogoURL, rawToken));

  useEffect(() => {
    setAppReady(true);
  }, []);

  if (!appReady && !props.isExample) return null;
  return (
    <Box className="adapter-wrapper">
      <TwapAdapter
        connect={props.connect ? props.connect : () => {}}
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
        <GlobalStyles styles={configureStyles() as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <StyledTopColumnFlex gap={6.5}>
                <TokenPanel isSrcToken={true} />
                <ChangeTokensOrder />
                <TokenPanel />
              </StyledTopColumnFlex>
              <StyledColumnFlex>
                <MarketPrice />
                <LimitPrice />
                <TradeSize />
                <TradeInterval />
                <MaxDuration />
                <StyledWarningMsg />
                <StyledSubmit isMain />
              </StyledColumnFlex>
            </StyledColumnFlex>
            <OrderSummary>
              <Components.OrderSummaryDetails />
            </OrderSummary>
            <StyledPoweredByOrbs />
          </div>
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

export default TWAP;

const TradeSize = () => {
  return (
    <>
      <StyledTradeSize className="twap-trade-size">
        <TwapStyles.StyledColumnFlex className="twap-trade-size-flex">
          <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
            <Components.Labels.TotalTradesLabel />
            <Components.ChunksSliderSelect />
            <Components.ChunksInput />
          </TwapStyles.StyledRowFlex>

          <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
            <Components.TradeSize />
            <USD>
              <Components.ChunksUSD onlyValue={true} emptyUi={<>0.00</>} />
            </USD>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTradeSize>
    </>
  );
};

const MaxDuration = () => {
  return (
    <StyledMaxDuration className="twap-max-duration">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between" className="twap-max-duration-flex">
        <TwapStyles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto" }}>
          <Components.Labels.MaxDurationLabel />
          <Components.PartialFillWarning />
        </TwapStyles.StyledRowFlex>
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </StyledMaxDuration>
  );
};

const TradeInterval = () => {
  return (
    <StyledTradeInterval className="twap-trade-interval">
      <TwapStyles.StyledRowFlex className="twap-trade-interval-flex">
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledTradeInterval>
  );
};

export const LimitPrice = () => {
  return (
    <>
      <StyledLimitPrice className="twap-limit-price">
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            <Components.LimitPriceToggle />{" "}
          </TwapStyles.StyledRowFlex>
          <Components.LimitPriceInput placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </StyledLimitPrice>
    </>
  );
};
