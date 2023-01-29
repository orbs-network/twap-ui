import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles } from "@orbs-network/twap-ui";
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
              <Components.ChangeTokensOrder />
              <TokenPanel isSrcToken={false} />
              <LimitPrice />
              <TradeSize />
              <MaxDuration />
              <TradeInterval />
              <ShowOrderHistory />
              <Components.SubmitButton />
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
              <Components.ChunksAmount />
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
          <Components.LimitPriceToggle />
        </TwapStyles.StyledRowFlex>
        <Components.LimitPriceInput placeholder="0" />
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

// const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
//   const TokenSelectModal = useAdapterContext().TokenSelectModal;

//   return <TokenSelectModal onCurrencySelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
// };

const TokenSelect = (props: any) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  if (!props.isOpen) return null;
  return <TokenSelectModal isOpen={true} onClose={props.onClose} onCurrencySelect={props.onCurrencySelect} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations;
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();
  const marketPrice = hooks.useMarketPrice().marketPrice;
  const select = hooks.useOnTokenSelect(isSrcToken);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  const onTokenSelected = useCallback(
    (token: any) => {
      setTokenListOpen(false);
      select(parseToken(token));
      if (isSrcToken) {
        onSrcTokenSelected?.(token);
      } else {
        onDstTokenSelected?.(token);
      }
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected]
  );

  return (
    <>
      <TokenSelect isOpen={tokenListOpen} onClose={onClose} onCurrencySelect={onTokenSelected} />

      <TwapStyles.StyledColumnFlex gap={4} className="twap-token-panel">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
          {!isSrcToken && marketPrice !== "0" && (
            <TwapStyles.StyledRowFlex className="twap-token-panel-price">
              <TwapStyles.StyledText>Price</TwapStyles.StyledText> <Components.Base.NumberDisplay value={marketPrice} /> <Components.TokenSymbol isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          )}
        </TwapStyles.StyledRowFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenInput isSrc={isSrcToken} />
              <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenUSD isSrc={isSrcToken} />
              <Components.TokenBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const OrderSummary = () => {
  return (
    <Components.OrderSummarySwipeContainer>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.OrderSummaryLimitPrice />
          <Components.Base.Card>
            <Components.OrderSummaryDetails />
          </Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <Components.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </Components.OrderSummarySwipeContainer>
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
