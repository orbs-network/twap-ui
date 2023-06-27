import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AdapterContextProvider, config, parseToken } from "./hooks";
import translations from "./i18n/en.json";
import { ThenaTWAPProps } from "./types";
import { Box } from "@mui/system";
import { ChangeTokensOrder, Container, CurrentMarketPrice, OrderSummary, TokenPanel } from "./Components";
import { configureStyles, StyledColumnFlex, StyledSubmit } from "./styles";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Limit = (props: ThenaTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens, parseToken);

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
        srcToken={props.srcToken}
        dstToken={props.dstToken}
      >
        <GlobalStyles styles={configureStyles(props.isDarkTheme) as any} />
        <AdapterContextProvider value={props}>
          <div className="twap-container">
            <StyledColumnFlex>
              <TokenPanel isSrcToken={true} />
              <ChangeTokensOrder />
              <TokenPanel />
              <CurrentMarketPrice />

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
            {/* <StyledPoweredBy /> */}
          </div>
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

export default Limit;

const LimitPrice = () => {
  return (
    <Container enabled={1} label={<Components.Labels.LimitPriceLabel />}>
      <Components.LimitPriceInput placeholder="0" />
    </Container>
  );
};
