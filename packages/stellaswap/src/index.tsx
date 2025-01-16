import { Translations, TwapAdapter, Components, Styles as TwapStyles, TWAPTokenSelectProps, TWAPProps, Configs, Token } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";

import Web3 from "web3";
import { isNativeAddress, network } from "@defi.org/web3-candies";
import { memo, ReactNode, useCallback, useState, createContext, useContext, useMemo } from "react";
import {
  StyledBalance,
  StyledBalanceAndUSD,
  StyledPanelRight,
  StyledTokenChange,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledUSD,
  configureStyles,
  StyledAdapter,
  StyledColumnFlex,
  StyledPoweredBy,
  StyledSubmit,
  StyledTop,
  darkTheme,
  lightTheme,
  StyledChunkSize,
} from "./styles";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

import { AiFillAccountBook } from "@react-icons/all-files/ai/AiFillAccountBook";

interface ThenaTWAPProps extends TWAPProps {
  connect: () => void;
  dappTokens: any;
}
const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
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
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const TokenChange = () => {
  return <StyledTokenChange icon={<AiFillAccountBook />} />;
};

const TokenSelectButton = ({ isSrc, onClick }: { isSrc?: boolean; onClick: () => void }) => {
  const { parsedSrcToken: srcToken, parsedDstToken: dstToken } = useTwapContextUI();

  const notSelected = (isSrc && !srcToken) || (!isSrc && !dstToken);
  return (
    <StyledTokenSelect onClick={onClick}>
      <Components.TokenLogo isSrc={isSrc} />
      <TwapStyles.StyledColumnFlex style={{ flex: 1 }} gap={1}>
        <p className="twap-token-select-title">Swap {isSrc ? "From" : "To"}</p>

        <TwapStyles.StyledRowFlex gap={5} justifyContent="flex-start">
          {notSelected ? <p className="twap-token-select-text">Select</p> : <Components.TokenSymbol isSrc={isSrc} />}
          <AiFillAccountBook className="twap-token-select-icon" />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </StyledTokenSelect>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenPanel className="twap-token-panel">
        <TokenSelectButton isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
        <StyledPanelRight isSrcToken={isSrcToken ? 1 : 0} gap={3}>
          <Components.TokenPanelInput placeholder="0" isSrc={isSrcToken} />
          <StyledBalanceAndUSD>
            <StyledUSD isSrc={isSrcToken} />
            <StyledBalance emptyUi={<div>0.00</div>} isSrc={isSrcToken} />
          </StyledBalanceAndUSD>
        </StyledPanelRight>
      </StyledTokenPanel>
    </>
  );
};

const config = Configs.QuickSwap;

const parseToken = (rawToken: any): Token | undefined => {
  const { address, symbol } = rawToken;
  if (!symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!address || isNativeAddress(address) || address === "BNB") {
    return network(config.chainId).native;
  }
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo?.logoURI,
  };
};

const AdapterContext = createContext({} as ThenaTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);
const Tooltip = () => {
  return <div>Tooltip</div>;
};
const TWAP = (props: ThenaTWAPProps) => {
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  return (
    <StyledAdapter className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        dappTokens={props.dappTokens}
        parsedTokens={[]}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        isLimitPanel={props.limit}
        Components={{ Tooltip }}
      >
        {/* <GlobalStyles styles={configureStyles(theme) as any} /> */}
        <AdapterContextProvider value={props}>{props.limit ? <LimitPanel /> : <TWAPPanel />}</AdapterContextProvider>
      </TwapAdapter>
    </StyledAdapter>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel />
        </StyledTop>
        <TotalTrades />
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
      </StyledColumnFlex>

      <StyledPoweredBy />
    </div>
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel />
        </StyledTop>
      </StyledColumnFlex>

      <StyledPoweredBy />
    </div>
  );
};

const TotalTrades = () => {
  return (
    <Components.Base.Card className="twap-trade-size">
      <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
        <Components.Labels.TotalTradesLabel />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeSize = () => {
  return (
    <StyledChunkSize className="twap-chunks-size">
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.Labels.ChunksAmountLabel />
        <TwapStyles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto", flex: 1, justifyContent: "flex-end" }}>
          <Components.TokenLogo isSrc={true} />
          <Components.TradeSizeValue />
          <TwapStyles.StyledRowFlex className="twap-chunks-size-usd" gap={3} style={{ width: "auto" }}>
            <p>{"( "}</p>
            <Components.ChunksUSD />
            <p>{" )"}</p>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledChunkSize>
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
