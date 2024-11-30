import { Components, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, hooks, TWAPProps, Configs, Token } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";

import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Web3 from "web3";
import { darkTheme, GlobalStyles, lightTheme } from "./styles";
import { isNativeAddress, network } from "@defi.org/web3-candies";
import { ThemeProvider } from "styled-components";

interface QuickSwapTWAPProps extends TWAPProps {
  connect: () => void;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  getTokenLogoURL: (address: string) => string;
  dappTokens: { [key: string]: QuickSwapRawToken };
  isProMode?: boolean;
  onInputChange: (value: string) => void;
}

interface QuickSwapRawToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  tokenInfo: {
    address: string;
    chainId: number;
    decimals: number;
    logoURI: string;
    name: string;
    symbol: string;
  };
}

const config = Configs.QuickSwap;
const nativeToken = network(config.chainId).native;

const parseToken = (getTokenLogoURL: (address: string) => string, rawToken: QuickSwapRawToken): Token | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo?.logoURI || getTokenLogoURL(rawToken.address),
  };
};

const AdapterContext = createContext({} as QuickSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal tokenSelected={undefined} onCurrencySelect={props.onSelect} isOpen={props.isOpen} onDismiss={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
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
          <TwapStyles.StyledColumnFlex gap={16}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.Base.SmallLabel className="twap-token-panel-title">
                {isSrcToken ? translations.from : `${translations.to} (${translations.estimate})`}
              </Components.Base.SmallLabel>
              {isSrcToken && <SrcTokenPercentSelector />}
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
              <Components.TokenPanelInput placeholder="0.00" isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenBalance isSrc={isSrcToken} />
              <Components.TokenUSD isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useOnSrcAmountPercent();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <TwapStyles.StyledRowFlex className="twap-percent-selector" width="fit-content">
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(1)}>{translations.max}</button>
    </TwapStyles.StyledRowFlex>
  );
};

const ChangeTokensOrder = () => {
  return (
    <div className="twap-change-tokens-order-wrapper">
      <Components.ChangeTokensOrder />
    </div>
  );
};

interface Props extends QuickSwapTWAPProps {
  limit?: boolean;
}

const AmountUpdater = () => {
  const srcAmount = hooks.useSrcAmount().amount;

  const onInputChange = useAdapterContext().onInputChange;
  useEffect(() => {
    onInputChange(srcAmount || "0");
  }, [onInputChange, srcAmount]);

  return null;
};

const Tooltip = () => {
  return <div></div>;
};

const TWAPContent = () => {
  const context = useAdapterContext();

  const theme = useMemo(() => {
    return context.isDarkTheme ? darkTheme : lightTheme;
  }, [context.isDarkTheme]);

  return (
    <ThemeProvider theme={theme}>
      <div className="adapter-wrapper">
        <TwapAdapter
          connect={context.connect}
          config={config}
          maxFeePerGas={context.maxFeePerGas}
          priorityFeePerGas={context.priorityFeePerGas}
          translations={translations as Translations}
          provider={context.provider}
          account={context.account}
          dappTokens={context.dappTokens}
          parsedTokens={[]}
          onTxSubmitted={context.onTxSubmitted}
          onDstTokenSelected={context.onDstTokenSelected}
          onSrcTokenSelected={context.onSrcTokenSelected}
          isLimitPanel={context.limit}
          Components={{ Tooltip }}
        >
          <GlobalStyles />
          <AmountUpdater />
          {context.limit ? <LimitPanel /> : <TWAPPanel />}
        </TwapAdapter>
      </div>
    </ThemeProvider>
  );
};

const TWAP = (props: Props) => {
  return (
    <AdapterContextProvider value={{ ...props }}>
      <TWAPContent />
    </AdapterContextProvider>
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
      <TwapStyles.StyledColumnFlex gap={12}></TwapStyles.StyledColumnFlex>

      <Components.PoweredBy />
    </div>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
      <TwapStyles.StyledColumnFlex gap={12}>
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
      </TwapStyles.StyledColumnFlex>
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
    <Components.Base.Card className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

export { TWAP };
