import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps } from "@orbs-network/twap-ui";
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

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;
  console.log('render');
  
  return <TokenSelectModal
   onCurrencySelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};

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
          <AdapterContextProvider twapProps={props} ModifiedTokenSelectModal={ModifiedTokenSelectModal}>
            <div className="twap-container">
              <TokenPanel isSrcToken={true} />
              <Components.TWAP.ChangeTokensOrder />
              <TokenPanel isSrcToken={false} />
              <LimitPrice />
              <TradeSize />
              <MaxDuration />
              <TradeInterval />
              <ShowOrderHistory />
              <Components.TWAP.SubmitButton />
              <OrderSummary />
              <Orders />
              <Components.TWAP.PoweredBy />
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
    <Components.Base.Card className="twap-trade-size">
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
          <Components.TWAP.ChunksSliderSelect />
          <Components.TWAP.ChunksInput />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <TwapStyles.StyledRowFlex justifyContent="flex-start" width="fit-content">
            <TwapStyles.StyledRowFlex>
              <Components.Labels.ChunksAmountLabel />
              <Components.TWAP.ChunksAmount />
            </TwapStyles.StyledRowFlex>
            <Components.TWAP.TokenLogoAndSymbol isSrc={true} />
          </TwapStyles.StyledRowFlex>
          <Components.TWAP.ChunksUSD />
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
          <Components.TWAP.LimitPriceToggle />
        </TwapStyles.StyledRowFlex>
        <Components.TWAP.LimitPriceInput placeholder="0" />
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.TWAP.PartialFillWarning />
        <Components.TWAP.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.TWAP.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TWAP.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { onSrcTokenSelected, onDstTokenSelected, ModifiedTokenSelectModal } = useAdapterContext();
  const translations = useTwapContext().translations;
  const marketPrice = hooks.useMarketPrice().marketPrice;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <Components.TWAP.TokenSelectModal
        Component={ModifiedTokenSelectModal}
        onSrcSelect={onSrcTokenSelected}
        onDstSelect={onDstTokenSelected}
        isOpen={tokenListOpen}
        onClose={onClose}
        isSrc={isSrcToken}
        parseToken={parseToken}
      />
      <TwapStyles.StyledColumnFlex gap={4} className="twap-token-panel">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
          {!isSrcToken && marketPrice !== "0" && (
            <TwapStyles.StyledRowFlex className="twap-token-panel-price">
              <TwapStyles.StyledText>Price</TwapStyles.StyledText> <Components.Base.NumberDisplay value={marketPrice} /> <Components.TWAP.TokenSymbol isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          )}
        </TwapStyles.StyledRowFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TWAP.TokenInput isSrc={isSrcToken} />
              <Components.TWAP.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <TwapStyles.StyledOverflowContainer>
                <Components.TWAP.TokenUSD isSrc={isSrcToken} />
              </TwapStyles.StyledOverflowContainer>
              <Components.TWAP.TokenBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const OrderSummary = () => {
  return (
    <Components.TWAP.OrderSummarySwipeContainer>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.TWAP.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.TWAP.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.TWAP.OrderSummaryLimitPrice />
          <Components.Base.Card>
            <Components.TWAP.OrderSummaryDetails />
          </Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.TWAP.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.TWAP.AcceptDisclaimer />
            <Components.TWAP.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <Components.TWAP.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </Components.TWAP.OrderSummarySwipeContainer>
  );
};

const ShowOrderHistory = () => {
  const toggleOrders = useAdapterContext().toggleOrders;
  const translations = useTwapContext().translations;

  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <TwapStyles.StyledRowFlex justifyContent="flex-start">
          <Components.Base.Icon icon={<AiOutlineHistory style={{ width: 23, height: 23 }} />} />
          <Components.Base.Label>{translations.viewOrders}</Components.Base.Label>
        </TwapStyles.StyledRowFlex>
        <AdapterStyles.StyledShowOrdersButton onClick={toggleOrders}>
          <TwapStyles.StyledText>{translations.view}</TwapStyles.StyledText>
        </AdapterStyles.StyledShowOrdersButton>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const Orders = () => {
  const args = useAdapterContext();
  return (
    <Components.Base.SwipeContainer show={args.showOrders} close={args.toggleOrders}>
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
    </Components.Base.SwipeContainer>
  );
};
