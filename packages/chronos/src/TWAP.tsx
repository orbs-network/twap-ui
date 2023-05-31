import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles } from "@orbs-network/twap-ui";
import { useEffect, useState } from "react";
import { AdapterContextProvider, config, parseToken } from "./hooks";
import translations from "./i18n/en.json";
import { ChronosTWAPProps } from "./types";
import { Box } from "@mui/system";
import { ChangeTokensOrder, Container, OrderSummary, TokenPanel } from "./Components";
import { configureStyles, StyledColumnFlex, StyledPoweredBy } from "./styles";

const TWAP = (props: ChronosTWAPProps) => {
  const [appReady, setAppReady] = useState(false);
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(props.getTokenLogoURL, rawToken));

  useEffect(() => {
    setAppReady(true);
  }, []);

  if (!appReady) return null;
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
              <TwapStyles.StyledColumnFlex gap={10}>
                <TokenPanel isSrcToken={true} />
                <ChangeTokensOrder />
                <TokenPanel />
              </TwapStyles.StyledColumnFlex>
              <StyledColumnFlex>
                <Components.MarketPrice />
                <LimitPrice />
                <TradeSize />
                <TradeInterval />
                <MaxDuration />
                <Components.SubmitButton isMain />
              </StyledColumnFlex>
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
    <Container className="twap-trade-size">
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
    </Container>
  );
};

const MaxDuration = () => {
  return (
    <Container className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const TradeInterval = () => {
  return (
    <Container className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

export const LimitPrice = () => {
  return (
    <>
      <Container className="twap-limit-price">
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            <Components.LimitPriceToggle />{" "}
          </TwapStyles.StyledRowFlex>
          <Components.LimitPriceInput placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </Container>
    </>
  );
};
