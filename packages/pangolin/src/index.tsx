import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, TWAPProps, Orders } from "@orbs-network/twap-ui";
import { memo, useCallback, useState, createContext, ReactNode, useContext } from "react";
import translations from "./i18n/en.json";
import * as AdapterStyles from "./styles";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as Emotion10ThemeProvider } from "@emotion/react";
import { AiOutlineHistory } from "react-icons/ai";
import { useFormatNumber } from "@orbs-network/twap-ui/dist/hooks";
import { TokenData, Configs } from "@orbs-network/twap";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";

interface PangolinTWAPProps extends TWAPProps {
  theme: any;
  partnerDaas?: string;
}

interface ContextProps {
  twapProps: PangolinTWAPProps;
  children: ReactNode;
}

interface Values extends PangolinTWAPProps {
  toggleOrders: () => void;
  showOrders: boolean;
}

const Context = createContext({} as Values);

const AdapterContextProvider = ({ twapProps, children }: ContextProps) => {
  const [showOrders, setShowOrders] = useState(false);

  const values = {
    ...twapProps,
    toggleOrders: () => setShowOrders(!showOrders),
    showOrders,
  };

  return <Context.Provider value={values}>{children}</Context.Provider>;
};

const useAdapterContext = () => useContext(Context);

const parseToken = (rawToken: any): TokenData | undefined => {
  const { config } = getConfig();
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }

  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return config.nativeToken;
  }

  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo ? rawToken.tokenInfo.logoURI : "",
  };
};

const useGlobalStyles = (theme: any) => {
  return configureStyles(theme);
};

const getConfig = (partnerDaas?: string) => {
  const _partnerDaas = partnerDaas && !isNativeAddress(partnerDaas) ? partnerDaas : undefined;
  const config = _partnerDaas ? Configs.PangolinDaas : Configs.Pangolin;

  return {
    partnerDaas: _partnerDaas,
    config,
  };
};

const defaultTheme = createTheme();

export const TWAP = memo((props: PangolinTWAPProps) => {
  const globalStyles = useGlobalStyles(props.theme);
  const memoizedConnect = useCallback(() => {
    props.connect?.();
  }, []);

  const { partnerDaas, config } = getConfig(props.partnerDaas);

  return (
    <Emotion10ThemeProvider theme={defaultTheme}>
      <ThemeProvider theme={defaultTheme}>
        <TwapAdapter
          connect={memoizedConnect}
          config={config}
          maxFeePerGas={props.maxFeePerGas}
          priorityFeePerGas={props.priorityFeePerGas}
          translations={translations as Translations}
          provider={props.provider}
          account={props.account}
          connectedChainId={props.connectedChainId}
          askDataParams={[partnerDaas]}
          dappTokens={props.dappTokens}
          srcToken={props.srcToken}
          dstToken={props.dstToken}
          parseToken={parseToken}
        >
          <GlobalStyles styles={globalStyles as any} />
          <AdapterContextProvider twapProps={props}>
            <div className="twap-container">
              <TokenPanel isSrcToken={true} />
              <Components.ChangeTokensOrder />
              <TokenPanel isSrcToken={false} />
              <LimitPrice />
              <TradeSize />
              <TradeInterval />
              <MaxDuration />
              <ShowOrderHistory />
              <Components.SubmitButton />
              <OrderSummary />
              <OrdersComponent />
              <Components.PoweredBy />
            </div>
          </AdapterContextProvider>
        </TwapAdapter>
      </ThemeProvider>
    </Emotion10ThemeProvider>
  );
});

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
          <Components.TradeSize />
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

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal onCurrencySelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};

const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken: boolean }) => {
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={parseToken}
    />
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations;
  const marketPrice = hooks.useMarketPrice().marketPrice;
  const formattedMarketPrice = useFormatNumber({ value: marketPrice });

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <TwapStyles.StyledColumnFlex gap={4} className="twap-token-panel">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
          {!isSrcToken && marketPrice !== "0" && (
            <TwapStyles.StyledRowFlex className="twap-token-panel-price">
              <TwapStyles.StyledText>Price</TwapStyles.StyledText> {formattedMarketPrice} <Components.TokenSymbol isSrc={isSrcToken} />
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

const OrdersComponent = () => {
  const args = useAdapterContext();
  return (
    <Components.Base.SwipeContainer show={args.showOrders} close={args.toggleOrders}>
      <AdapterStyles.StyledOrders>
        <Orders />
      </AdapterStyles.StyledOrders>
    </Components.Base.SwipeContainer>
  );
};
