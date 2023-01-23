import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, StateComponents } from "@orbs-network/twap-ui";
import { memo, useCallback, useState } from "react";
import translations from "./i18n/en.json";
import * as AdapterStyles from "./styles";
import { Configs, isNativeAddress } from "@orbs-network/twap";
import { parseToken, useGlobalStyles, useParseTokenList, useTokensFromDapp } from "./hooks";
import { PangolinTWAPProps } from "./types";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as Emotion10ThemeProvider } from "@emotion/react";
import { AdapterContextProvider, useAdapterContext } from "./context";
import { AiOutlineHistory } from "react-icons/ai";
import OrderHistory from "./Orders";

const defaultTheme = createTheme();

const TWAP = (props: PangolinTWAPProps) => {
  const tokenList = useParseTokenList(props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const globalStyles = useGlobalStyles(props.theme);
  const memoizedConnect = useCallback(() => {
    props.connect?.();
  }, []);

  const partnerDaas = props.partnerDaas && !isNativeAddress(props.partnerDaas) ? props.partnerDaas : undefined;

  return (
    <Emotion10ThemeProvider theme={defaultTheme}>
      <ThemeProvider theme={defaultTheme}>
        <TwapAdapter
          connect={memoizedConnect}
          config={partnerDaas ? Configs.PangolinDaas : Configs.Pangolin}
          maxFeePerGas={props.maxFeePerGas}
          priorityFeePerGas={props.priorityFeePerGas}
          translations={translations as Translations}
          provider={props.provider}
          account={props.account}
          connectedChainId={props.connectedChainId}
          askDataParams={[partnerDaas]}
        >
          <GlobalStyles styles={globalStyles as any} />
          <AdapterContextProvider twapProps={props}>
            <div className="twap-container">
              <TokenPanel isSrcToken={true} />
              <StateComponents.ChangeTokensOrder />
              <TokenPanel isSrcToken={false} />
              <LimitPriceDisplay />
              <TradeSize />
              <MaxDuration />
              <TradeInterval />
              <ShowOrderHistory />
              <StateComponents.SubmitButton />
              <OrderSummary />
              <Orders />
              <Components.PoweredBy />
            </div>
          </AdapterContextProvider>
        </TwapAdapter>
      </ThemeProvider>
    </Emotion10ThemeProvider>
  );
};

export default memo(TWAP);

const buttons = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "100%", value: 1 },
];
const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  return (
    <TwapStyles.StyledRowFlex gap={5} style={{ width: "auto" }}>
      {buttons.map((btn) => {
        return (
          <button className="twap-percent-button" key={btn.text} onClick={() => onPercentClick(btn.value)}>
            {btn.text}
          </button>
        );
      })}
    </TwapStyles.StyledRowFlex>
  );
};

const TradeSize = () => {
  return (
    <Components.Card>
      <TwapStyles.StyledColumnFlex gap={5}>
        <AdapterStyles.StyledSliderContainer gap={10}>
          <StateComponents.TotalTradesLabel />
          <StateComponents.ChunksSelectDisplay />
        </AdapterStyles.StyledSliderContainer>
        <TwapStyles.StyledRowFlex>
          <AdapterStyles.StyledTradeSize>
            <TwapStyles.StyledRowFlex>
              <StateComponents.ChunksAmountLabel />
              <StateComponents.ChunksAmount />
            </TwapStyles.StyledRowFlex>
            <StateComponents.TokenLogoAndSymbol isSrc={true} hideIfNullToken={true} />
          </AdapterStyles.StyledTradeSize>
          <StateComponents.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const LimitPriceDisplay = () => {
  return (
    <Components.Card className="twap-limit-price">
      <TwapStyles.StyledColumnFlex>
        <AdapterStyles.StyledFlexStart>
          <StateComponents.LimitPriceToggle />
          <StateComponents.LimitPriceLabel />
        </AdapterStyles.StyledFlexStart>
        <StateComponents.LimitPrice placeholder="0" />
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <StateComponents.MaxDurationLabel />
        <StateComponents.PartialFillWarning />
        <StateComponents.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex>
        <StateComponents.TradeIntervalLabel />
        <StateComponents.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <StateComponents.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { TokenSelectModal, onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();
  const translations = useTwapContext().translations;
  const marketPrice = hooks.useMarketPrice().marketPrice;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <StateComponents.TokenSelectModal
        Modal={TokenSelectModal}
        onSrcSelect={onSrcTokenSelected}
        onDstSelect={onDstTokenSelected}
        isOpen={tokenListOpen}
        onClose={onClose}
        isSrc={isSrcToken}
        parseToken={parseToken}
      />

      <AdapterStyles.StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={4}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.SmallLabel>
            {isSrcToken && <SrcTokenPercentSelector />}
            {!isSrcToken && marketPrice !== "0" && (
              <AdapterStyles.Text>
                Price <Components.NumberDisplay value={marketPrice} /> <StateComponents.TokenSymbol isSrc={isSrcToken} />
              </AdapterStyles.Text>
            )}
          </TwapStyles.StyledRowFlex>
          <Components.Card>
            <TwapStyles.StyledColumnFlex gap={15}>
              <TwapStyles.StyledRowFlex justifyContent="space-between">
                <StateComponents.TokenInput isSrc={isSrcToken} />
                <StateComponents.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
              </TwapStyles.StyledRowFlex>
              <TwapStyles.StyledRowFlex justifyContent="space-between">
                <StateComponents.TokenUSD isSrc={isSrcToken} />
                <StateComponents.TokenBalance isSrc={isSrcToken} />
              </TwapStyles.StyledRowFlex>
            </TwapStyles.StyledColumnFlex>
          </Components.Card>
        </TwapStyles.StyledColumnFlex>
      </AdapterStyles.StyledTokenPanel>
    </>
  );
};

const OrderSummary = () => {
  return (
    <StateComponents.OrderSummarySwipeContainer>
      <AdapterStyles.StyledSummary className="twap-summary">
        <TwapStyles.StyledColumnFlex gap={14}>
          <TwapStyles.StyledColumnFlex gap={14}>
            <Components.Card>
              <StateComponents.OrderSummarySrcTokenDisplay />
            </Components.Card>
            <Components.Card>
              <StateComponents.OrderSummaryDstTokenDisplay />
            </Components.Card>
            <StateComponents.OrderSummaryLimitPrice />
            <Components.Card className="twap-summary-breakdown">
              <StateComponents.OrderSummaryDetails />
            </Components.Card>
            <Components.Card>
              <TwapStyles.StyledColumnFlex gap={10}>
                <Components.Disclaimer />
              </TwapStyles.StyledColumnFlex>
            </Components.Card>
          </TwapStyles.StyledColumnFlex>
          <Components.Card>
            <TwapStyles.StyledColumnFlex gap={12}>
              <StateComponents.AcceptDisclaimer />
              <StateComponents.OutputAddress />
            </TwapStyles.StyledColumnFlex>
          </Components.Card>
          <StateComponents.SubmitButton />
        </TwapStyles.StyledColumnFlex>
      </AdapterStyles.StyledSummary>
    </StateComponents.OrderSummarySwipeContainer>
  );
};

const ShowOrderHistory = () => {
  const toggleOrders = useAdapterContext().toggleOrders;
  const translations = useTwapContext().translations;

  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <TwapStyles.StyledRowFlex justifyContent="flex-start">
          <Components.Icon icon={<AiOutlineHistory style={{ width: 23, height: 23 }} />} />
          <Components.Label>{translations.viewOrders}</Components.Label>
        </TwapStyles.StyledRowFlex>
        <AdapterStyles.StyledShowOrdersButton onClick={toggleOrders}>
          <AdapterStyles.Text>{translations.view}</AdapterStyles.Text>
        </AdapterStyles.StyledShowOrdersButton>
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const Orders = () => {
  const args = useAdapterContext();
  return (
    <Components.SwipeContainer show={args.showOrders} close={args.toggleOrders}>
      <AdapterStyles.StyledOrders>
        <OrderHistory
          dappTokens={args.dappTokens}
          connectedChainId={args.connectedChainId}
          account={args.account}
          provider={args.provider}
          maxFeePerGas={args.maxFeePerGas}
          priorityFeePerGas={args.priorityFeePerGas}
        />
      </AdapterStyles.StyledOrders>
    </Components.SwipeContainer>
  );
};


