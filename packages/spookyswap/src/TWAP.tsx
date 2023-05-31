import { GlobalStyles } from "@mui/material";
import { Components, hooks, Styles as TwapStyles, Translations, TwapAdapter } from "@orbs-network/twap-ui";
import { memo, useCallback } from "react";
import translations from "./i18n/en.json";
import { AdapterContextProvider, config, parseToken, useGetProvider, useGlobalStyles } from "./hooks";
import { SpookySwapTWAPProps } from ".";
import { Box } from "@mui/system";
import { OrderSummary, TokenPanel } from "./Components";

const TWAP = (props: SpookySwapTWAPProps) => {
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
          <TradeSize />
          <TradeInterval />
          <MaxDuration />
          <TwapStyles.StyledRowFlex className="twap-create-order-btn">
            <Components.SubmitButton />
          </TwapStyles.StyledRowFlex>
          <OrderSummary>
            <Components.OrderSummaryDetails />
          </OrderSummary>
          <Components.PoweredBy />
        </div>
      </AdapterContextProvider>
    </TwapAdapter>
  );
};

export default memo(TWAP);

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
            <TwapStyles.StyledRowFlex>
              <Components.Labels.ChunksAmountLabel />
            </TwapStyles.StyledRowFlex>
            <Components.TokenLogoAndSymbol isSrc={true} />
          </TwapStyles.StyledRowFlex>
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

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
const MaxDuration = () => {
  return (
    <Components.Base.Card>
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
    <Components.Base.Card>
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
