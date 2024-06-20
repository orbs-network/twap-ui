import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, OrdersPanel, TWAPProps, Orders } from "@orbs-network/twap-ui";
import { memo, useCallback, useState } from "react";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useMemo } from "react";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
const config = Configs.SpiritSwap;

const useGetProvider = (getProvider: () => any, account?: string) => {
  return useMemo(() => getProvider(), [account]);
};

const parseToken = (rawToken: any, getTokenImageUrl: (symbol: string) => string): TokenData | undefined => {
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
    logoUrl: getTokenImageUrl(rawToken.symbol),
  };
};

const AdapterContext = createContext({} as SpiritSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const useGlobalStyles = (isDarkMode = true) => {
  return configureStyles(isDarkMode);
};

interface SpiritSwapTWAPProps extends TWAPProps {
  getTokenImageUrl: (symbol: string) => string;
  getProvider: () => any;
}

const TWAP = memo((props: SpiritSwapTWAPProps) => {
  const provider = useGetProvider(props.getProvider, props.account);
  const globalStyles = useGlobalStyles(props.isDarkTheme);

  const connect = useCallback(() => {
    props.connect!();
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
      dappTokens={props.dappTokens}
      srcToken={props.srcToken}
      dstToken={props.dstToken}
      parseToken={(rawToken) => parseToken(rawToken, props.getTokenImageUrl)}
      onDstTokenSelected={props.onDstTokenSelected}
      onSrcTokenSelected={props.onSrcTokenSelected}
      usePriceUSD={props.usePriceUSD}
    >
      <GlobalStyles styles={globalStyles} />
      <AdapterContextProvider value={props}>
        <div className="twap-container">
          <TokenPanel isSrcToken={true} />
          <Components.ChangeTokensOrder />
          <TokenPanel />
          <TradeSize />
          <TradeInterval />
          <MaxDuration />
          <Components.SubmitButton />
          <OrderSummary />
          <Components.PoweredBy />
        </div>
        <OrdersPanel />
      </AdapterContextProvider>
    </TwapAdapter>
  );
});

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <TwapStyles.StyledRowFlex className="twap-percent-selector" gap={5}>
      <button onClick={() => onClick(0.25)}>25%</button>
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(0.75)}>75%</button>
      <button onClick={() => onClick(1)}>{translations.max}</button>
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
  return <TokenSelectModal tokenSelected={undefined} onSelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);
const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <TwapStyles.StyledColumnFlex gap={0} className="twap-token-panel">
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={10}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenPanelInput isSrc={isSrcToken} placeholder="0" />
              <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenUSD isSrc={isSrcToken} />
              <Components.TokenBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
            {isSrcToken && <SrcTokenPercentSelector />}
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const OrderSummary = () => {
  return (
    <Components.OrderSummaryModalContainer>
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
    </Components.OrderSummaryModalContainer>
  );
};

export { Orders, TWAP };
