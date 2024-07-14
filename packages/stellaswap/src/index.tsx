import { GlobalStyles, ThemeProvider, Typography } from "@mui/material";
import { Translations, TwapAdapter, Components, Styles as TwapStyles, TWAPTokenSelectProps, TWAPProps, Orders } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode, useCallback, useState, createContext, useContext, useMemo } from "react";
import {
  StyledBalance,
  StyledBalanceAndUSD,
  StyledOrderSummary,
  StyledPanelRight,
  StyledTokenChange,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledUSD,
  configureStyles,
  StyledAdapter,
  StyledColumnFlex,
  StyledOrders,
  StyledPoweredBy,
  StyledSubmit,
  StyledTop,
  darkTheme,
  lightTheme,
  StyledChunkSize,
} from "./styles";

import { AiFillAccountBook } from "@react-icons/all-files/ai/AiFillAccountBook";
import { useTwapContext } from "@orbs-network/twap-ui";

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
  const { srcToken, dstToken } = useTwapContext();

  const notSelected = (isSrc && !srcToken) || (!isSrc && !dstToken);
  return (
    <StyledTokenSelect onClick={onClick}>
      <Components.TokenLogo isSrc={isSrc} />
      <TwapStyles.StyledColumnFlex style={{ flex: 1 }} alignItems="flex-start" gap={1}>
        <Typography className="twap-token-select-title">Swap {isSrc ? "From" : "To"}</Typography>

        <TwapStyles.StyledRowFlex gap={5} justifyContent="flex-start">
          {notSelected ? <Typography className="twap-token-select-text">Select</Typography> : <Components.TokenSymbol isSrc={isSrc} />}
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
        <StyledSubmit />
      </TwapStyles.StyledColumnFlex>
    </StyledOrderSummary>
  );
};

const config = Configs.QuickSwap;

const parseToken = (rawToken: any): TokenData | undefined => {
  const { address, symbol } = rawToken;
  if (!symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!address || isNativeAddress(address) || address === "BNB") {
    return config.nativeToken;
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

const TWAP = (props: ThenaTWAPProps) => {
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  return (
    <ThemeProvider theme={theme}>
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
        >
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
            <StyledOrders />
          </AdapterContextProvider>
        </TwapAdapter>
      </StyledAdapter>
    </ThemeProvider>
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
        <StyledSubmit isMain />
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
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel />
        </StyledTop>
        <StyledSubmit isMain />
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
            <Typography>{"( "}</Typography>
            <Components.ChunksUSD />
            <Typography>{" )"}</Typography>
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

export { TWAP, Orders };
