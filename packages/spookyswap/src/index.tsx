import { GlobalStyles, Box } from "@mui/material";
import { Components, Orders, Styles as TwapStyles, Translations, TwapAdapter, TWAPProps, hooks, TWAPTokenSelectProps, useTwapContext, store } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useMemo } from "react";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode, useCallback, useState } from "react";

const config = Configs.SpookySwap;

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
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
            <Components.Base.Card>{children}</Components.Base.Card>
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

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;
  return <TokenSelectModal commonTokens={[]} tokenSelected={undefined} onSelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  const { onSrcTokenSelected, onDstTokenSelected, getTokenImageUrl } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: any) => parseToken(token, getTokenImageUrl)}
    />
  );
};

const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <TwapStyles.StyledRowFlex width="fit-content" className="twap-percent-selector">
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(1)}>{translations.max}</button>
    </TwapStyles.StyledRowFlex>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations;

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
              <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : translations.to}</Components.Base.SmallLabel>
              {isSrcToken && <SrcTokenPercentSelector />}
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
              <TwapStyles.StyledOverflowContainer>
                <TwapStyles.StyledColumnFlex style={{ width: "fit-content", alignItems: "flex-end", flex: 1 }} gap={2}>
                  <Components.TokenInput isSrc={isSrcToken} />
                  <Components.TokenUSD isSrc={isSrcToken} />
                </TwapStyles.StyledColumnFlex>
              </TwapStyles.StyledOverflowContainer>
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex className="twap-balance-container" justifyContent="flex-start">
              <Components.TokenBalance label={translations.balance} isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const useGetProvider = (getProvider: () => any, account?: string) => {
  return useMemo(() => {
    return getProvider();
  }, [account]);
};

const parseToken = (rawToken: any, getTokenImage: (symbol: string) => string): TokenData | undefined => {
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
    logoUrl: getTokenImage(rawToken.symbol),
  };
};

const AdapterContext = createContext({} as SpookySwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);
const useGlobalStyles: any = (isDarkMode = true) => {
  return configureStyles(isDarkMode);
};

interface SpookySwapTWAPProps extends TWAPProps {
  getTokenImageUrl: (symbol: string) => string;
  connect: () => void;
  getProvider: () => any;
}

export const TWAP = (props: SpookySwapTWAPProps) => {
  const provider = useGetProvider(props.getProvider, props.account);
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
      dappTokens={props.dappTokens}
      parseToken={(rawToken) => parseToken(rawToken, props.getTokenImageUrl)}
      srcToken={props.srcToken}
      dstToken={props.dstToken}
      storeOverride={props.limit ? storeOverride : undefined}
    >
      <GlobalStyles styles={globalStyles} />

      <AdapterContextProvider value={props}>
        {props.limit ? <LimitPanel /> : <TWAPPanel />}
        <Components.Base.Portal id={props.ordersContainerId}>
          <Orders />
        </Components.Base.Portal>
      </AdapterContextProvider>
    </TwapAdapter>
  );
};

const TWAPPanel = () => {
  return (
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
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <Box>
        <TokenPanel isSrcToken={true} />
        <Box my="10px">
          <Components.ChangeTokensOrder />
        </Box>
        <TokenPanel />
      </Box>
      <LimitPrice />
      <TwapStyles.StyledRowFlex className="twap-create-order-btn">
        <Components.SubmitButton />
      </TwapStyles.StyledRowFlex>
      <OrderSummary>
        <TwapStyles.StyledColumnFlex>
          <Components.OrderSummaryDetailsDeadline />
          <Components.OrderSummaryDetailsOrderType />
          <Components.OrderSummaryDetailsChunkSize />
          <Components.OrderSummaryDetailsMinDstAmount />
        </TwapStyles.StyledColumnFlex>
      </OrderSummary>
      <Components.PoweredBy />
    </div>
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

const LimitPrice = ({ limit }: { limit?: boolean }) => {
  return (
    <Components.Base.Card className="twap-limit-price">
      <TwapStyles.StyledColumnFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Labels.LimitPriceLabel />
        </TwapStyles.StyledRowFlex>
        {!limit && <Components.LimitPriceRadioGroup />}
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
