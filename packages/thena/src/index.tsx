import { GlobalStyles, Box, ThemeProvider } from "@mui/material";
import { Components, Styles as TwapStyles, TWAPTokenSelectProps, hooks, Translations, TwapAdapter, Orders, TwapContextUIPreferences } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useEffect, useMemo } from "react";
import Web3 from "web3";
import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { TWAPProps, store } from "@orbs-network/twap-ui";
import { memo, ReactNode, useCallback, useState } from "react";
import {
  StyledBalance,
  StyledCard,
  StyledContainer,
  StyledOrderSummary,
  StyledPanelInput,
  StyledPercentSelector,
  StyledTokenSelect,
  configureStyles,
  StyledColumnFlex,
  StyledOrders,
  StyledPoweredBy,
  StyledSubmit,
  StyledTokenChange,
  StyledDisclaimerText,
  darkTheme,
  lightTheme,
  StyledTokenPanelUsd,
  StyledTopColumn,
} from "./styles";

import { useTwapContext } from "@orbs-network/twap-ui";
const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const uiPreferences: TwapContextUIPreferences = {
  usdPrefix: "$",
  inputPlaceholder: "0.0",
  switchVariant: "ios",
  orders: {
    paginationChunks: 4,
  },
};

const MemoizedTokenModal = memo((props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, dappTokens } = useAdapterContext();

  return (
    <TokenSelectModal
      otherAsset={props.dstTokenSelected}
      selectedAsset={props.srcTokenSelected}
      setSelectedAsset={props.onSelect}
      popup={props.isOpen}
      setPopup={props.onClose}
      baseAssets={dappTokens}
      setOtherAsset={props.onSelect}
    />
  );
});

const TokenSelectModal = ({ onClose, isSrc, isOpen }: any) => {
  const { dappTokens } = useAdapterContext();
  const onTokenSelectedCallback = hooks.useTokenSelect();

  const onSelect = useCallback(
    (token: any) => {
      onTokenSelectedCallback({ isSrc, token });
      onClose();
    },
    [onTokenSelectedCallback, isSrc]
  );
  const { srcTokenAddress, dstTokenAddress } = store.useTwapStore((s) => ({
    srcTokenAddress: s.srcToken?.address,
    dstTokenAddress: s.dstToken?.address,
  }));

  const { srcTokenSelected, dstTokenSelected } = useMemo(() => {
    return {
      srcTokenSelected: dappTokens?.find((it) => eqIgnoreCase(it.address, srcTokenAddress || "")),
      dstTokenSelected: dappTokens?.find((it) => eqIgnoreCase(it.address, dstTokenAddress || "")),
    };
  }, [dappTokens, srcTokenAddress, dstTokenAddress]);

  return <MemoizedTokenModal onClose={onClose} isOpen={isOpen} onSelect={onSelect} srcTokenSelected={srcTokenSelected} dstTokenSelected={dstTokenSelected} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelectModal onClose={onClose} isOpen={tokenListOpen} isSrc={isSrcToken} />
      <StyledContainer className="twap-token-panel">
        {isSrcToken && <SrcTokenPercentSelector />}
        <StyledCard>
          <TwapStyles.StyledColumnFlex gap={12}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StyledPanelInput isSrc={isSrcToken} />
              <StyledTokenSelect hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex style={{ justifyContent: "space-between" }}>
              <StyledTokenPanelUsd isSrc={isSrcToken} />
              <StyledBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </StyledCard>
      </StyledContainer>
    </>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions();

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelector className="twap-percent-selector">
      <button onClick={() => onClick(0.1)}>10%</button>
      <button onClick={() => onClick(0.25)}>25%</button>
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(1)}>Max</button>
    </StyledPercentSelector>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <StyledOrderSummary>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryLimitPrice />
          </Components.Base.Card>
          <Components.Base.Card>{children}</Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <StyledDisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <StyledSubmit />
      </TwapStyles.StyledColumnFlex>
    </StyledOrderSummary>
  );
};

const config = Configs.Thena;

interface ThenaTWAPProps extends TWAPProps {
  connect: () => void;
  dappTokens: any[];
  connector?: any;
  setFromAmount: (amount: string) => void;
}

const parseToken = (rawToken: any): TokenData | undefined => {
  const { address, decimals, symbol, logoURI } = rawToken;
  if (!symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!address || isNativeAddress(address) || address === "BNB") {
    return config.nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(address),
    decimals,
    symbol,
    logoUrl: logoURI,
  };
};

const AdapterContext = createContext({} as ThenaTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

export const useProvider = (props: ThenaTWAPProps) => {
  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    const res = await props.connector?.getProvider();
    setProvider(res);
  }, [setProvider, props.connector]);

  useEffect(() => {
    setProviderFromConnector();
  }, [props.account, props.connectedChainId, setProviderFromConnector]);

  return provider;
};

const AmountUpdater = () => {
  const srcAmount = store.useTwapStore((state) => state.srcAmountUi);
  const setFromAmount = useAdapterContext().setFromAmount;
  useEffect(() => {
    setFromAmount(srcAmount || "0");
  }, [setFromAmount, srcAmount]);

  return null;
};

const usePriceUSD = (address?: string) => {
  const dappTokens = useTwapContext().dappTokens;
  return useMemo(() => {
    if (!address) return undefined;
    const token = dappTokens?.find((it: any) => eqIgnoreCase(it.address, address));
    return token?.price;
  }, [address, dappTokens]);
};

const TWAP = (props: ThenaTWAPProps) => {
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const provider = useProvider(props);

  return (
    <Box className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        dappTokens={props.dappTokens}
        parseToken={parseToken}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        storeOverride={props.limit ? storeOverride : undefined}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        usePriceUSD={usePriceUSD}
        uiPreferences={uiPreferences}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            <AmountUpdater />
            {props.limit ? <LimitPanel /> : <TWAPPanel />}

            <StyledOrders />
          </AdapterContextProvider>
        </ThemeProvider>
      </TwapAdapter>
    </Box>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <StyledTopColumn>
          <TokenPanel isSrcToken={true} />
          <StyledTokenChange />
          <TokenPanel />
        </StyledTopColumn>
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
        <MainSubmit />
      </StyledColumnFlex>
      <OrderSummary>
        <Components.OrderSummaryDetails />
      </OrderSummary>
      <StyledPoweredBy />
    </div>
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <StyledTopColumn>
          <TokenPanel isSrcToken={true} />
          <StyledTokenChange />
          <TokenPanel />
        </StyledTopColumn>
        <MainSubmit />
      </StyledColumnFlex>
      <OrderSummary>
        <TwapStyles.StyledColumnFlex>
          <Components.OrderSummaryDetailsDeadline />
          <Components.OrderSummaryDetailsOrderType />
          <Components.OrderSummaryDetailsChunkSize />
          <Components.OrderSummaryDetailsMinDstAmount />
        </TwapStyles.StyledColumnFlex>
      </OrderSummary>
      <StyledPoweredBy />
    </div>
  );
};

const MainSubmit = () => {
  const account = useAdapterContext().account;
  return <StyledSubmit isMain connected={account ? 1 : 0} />;
};

const TradeSize = () => {
  return (
    <StyledCard className="twap-trade-size">
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
    </StyledCard>
  );
};

const MaxDuration = () => {
  return (
    <StyledCard className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </StyledCard>
  );
};

const TradeInterval = () => {
  return (
    <StyledCard className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledCard>
  );
};

export { TWAP, Orders };
