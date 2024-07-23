import { Components, Styles as TwapStyles, TWAPTokenSelectProps, hooks, Translations, TwapAdapter, TwapContextUIPreferences, Configs, Token } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, useContext, useEffect, useMemo } from "react";
import Web3 from "web3";
import { eqIgnoreCase, isNativeAddress, network, networks } from "@defi.org/web3-candies";
import { TWAPProps } from "@orbs-network/twap-ui";
import { memo, ReactNode, useCallback, useState } from "react";
import {
  StyledBalance,
  StyledCard,
  StyledContainer,
  StyledPanelInput,
  StyledPercentSelector,
  StyledTokenSelect,
  configureStyles,
  StyledColumnFlex,
  StyledPoweredBy,
  StyledSubmit,
  StyledTokenChange,
  darkTheme,
  lightTheme,
  StyledTokenPanelUsd,
  StyledTopColumn,
} from "./styles";

import { useTwapContext } from "@orbs-network/twap-ui";

const uiPreferences: TwapContextUIPreferences = {
  usdPrefix: "$",
  inputPlaceholder: "0.0",
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
    [onTokenSelectedCallback, isSrc],
  );
  const { srcToken, dstToken } = useTwapContext();

  const { srcTokenSelected, dstTokenSelected } = useMemo(() => {
    return {
      srcTokenSelected: dappTokens?.find((it) => eqIgnoreCase(it.address, srcToken?.address || "")),
      dstTokenSelected: dappTokens?.find((it) => eqIgnoreCase(it.address, dstToken?.address || "")),
    };
  }, [dappTokens, srcToken, dstToken]);

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
  const onPercentClick = hooks.useOnSrcAmountPercent();

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

const config = Configs.Thena;

interface ThenaTWAPProps extends TWAPProps {
  connect: () => void;
  dappTokens: any[];
  connector?: any;
  setFromAmount: (amount: string) => void;
}

const parseToken = (rawToken: any): Token | undefined => {
  const { address, decimals, symbol, logoURI } = rawToken;
  if (!symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!address || isNativeAddress(address) || address === "BNB") {
    return network(config.chainId).native;
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
  const srcAmount = hooks.useSrcAmount().amountUi;
  const setFromAmount = useAdapterContext().setFromAmount;
  useEffect(() => {
    setFromAmount(srcAmount || "0");
  }, [setFromAmount, srcAmount]);

  return null;
};

const usePriceUSD = (address?: string) => {
  const dappTokens = useAdapterContext().dappTokens;
  return useMemo(() => {
    if (!address) return undefined;
    const token = dappTokens?.find((it: any) => eqIgnoreCase(it.address, address));
    return token?.price;
  }, [address, dappTokens]);
};

const Tooltip = () => {
  return <div></div>;
};

const TWAP = (props: ThenaTWAPProps) => {
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const provider = useProvider(props);

  return (
    <div className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        dappTokens={props.dappTokens}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        uiPreferences={uiPreferences}
        parsedTokens={[]}
        isLimitPanel={props.limit}
        Components={{ Tooltip }}
      >
        {/* <ThemeProvider theme={theme}>
          <AdapterContextProvider value={props}>
            <AmountUpdater />
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
          </AdapterContextProvider>
        </ThemeProvider> */}
      </TwapAdapter>
    </div>
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

      <StyledPoweredBy />
    </div>
  );
};

const MainSubmit = () => {
  const account = useAdapterContext().account;
  return <StyledSubmit connected={account ? 1 : 0} />;
};

const TradeSize = () => {
  return (
    <StyledCard className="twap-trade-size">
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
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
      </TwapStyles.StyledRowFlex>
    </StyledCard>
  );
};

const TradeInterval = () => {
  return (
    <StyledCard className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />

        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledCard>
  );
};

export { TWAP };
