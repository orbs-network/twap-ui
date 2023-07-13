import { GlobalStyles, Box } from "@mui/material";
import { Components, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, hooks, Translations, TwapAdapter, Orders } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext } from "react";
import Web3 from "web3";
import { isNativeAddress } from "@defi.org/web3-candies";
import { TWAPProps, store } from "@orbs-network/twap-ui";
import { memo, ReactNode, useCallback, useState } from "react";
import {
  StyledBalance,
  StyledCard,
  StyledContainer,
  StyledOrderSummary,
  StyledPanelInput,
  StyledPercentSelector,
  StyledTokenPanelTop,
  StyledTokenSelect,
  configureStyles,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledOrders,
  StyledPoweredBy,
  StyledSubmit,
  StyledTokenChange,
  StyledDisclaimerText,
} from "./styles";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

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
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: ThenaRawToken) => parseToken(token)}
    />
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

      <StyledContainer className="twap-token-panel">
        <StyledTokenPanelTop>
          <Components.Base.SmallLabel className="twap-token-panel-title">{isSrcToken ? translations.from : translations.to}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
        </StyledTokenPanelTop>
        <Card>
          <TwapStyles.StyledColumnFlex gap={16}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <TwapStyles.StyledColumnFlex gap={0} style={{ width: "auto", flex: 1 }}>
                <StyledPanelInput placeholder="0.00" isSrc={isSrcToken} />
                <Components.TokenUSD isSrc={isSrcToken} />
              </TwapStyles.StyledColumnFlex>
              <TwapStyles.StyledColumnFlex style={{ width: "fit-content", alignItems: "flex-end" }}>
                <StyledTokenSelect hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
                <StyledBalance isSrc={isSrcToken} />
              </TwapStyles.StyledColumnFlex>
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Card>
      </StyledContainer>
    </>
  );
};

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { isDarkTheme } = useAdapterContext();
  return (
    <StyledCard isDarkTheme={isDarkTheme ? 1 : 0} className={`twap-card ${className}`}>
      <div className="twap-card-children">{children}</div>
    </StyledCard>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelector className="twap-percent-selector">
      <button onClick={() => onClick(0.25)}>25%</button>
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(0.75)}>75%</button>
      <button onClick={() => onClick(1)}>100%</button>
    </StyledPercentSelector>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  const { isDarkTheme } = useAdapterContext();
  return (
    <StyledOrderSummary isDarkMode={isDarkTheme ? 1 : 0}>
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
              <StyledDisclaimerText isDarkMode={isDarkTheme ? 1 : 0} />
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
  dappTokens: ThenaRawToken[];
}

interface ThenaRawToken {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
}

const parseToken = (rawToken: ThenaRawToken): TokenData | undefined => {
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

const TWAP = (props: ThenaTWAPProps) => {
  return (
    <Box className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        dappTokens={props.dappTokens}
        parseToken={parseToken}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        storeOverride={props.limit ? storeOverride : undefined}
      >
        <GlobalStyles styles={configureStyles(props.isDarkTheme) as any} />
        <AdapterContextProvider value={props}>
          {props.limit ? <LimitPanel /> : <TWAPPanel />}

          <StyledOrders isDarkMode={props.isDarkTheme ? 1 : 0} />
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TokenPanel isSrcToken={true} />
        <StyledTokenChange />
        <TokenPanel />
        <Components.MarketPrice />
        <LimitPrice />
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
        <TokenPanel isSrcToken={true} />
        <StyledTokenChange />
        <TokenPanel />
        <Card>
          <Components.MarketPrice />
        </Card>

        <Card>
          <LimitPrice limit={true} />
        </Card>
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

const TradeSize = () => {
  return (
    <Card className="twap-trade-size">
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
    </Card>
  );
};

const MaxDuration = () => {
  return (
    <Card className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Card>
  );
};

const TradeInterval = () => {
  return (
    <Card className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Card>
  );
};

const LimitPrice = ({ limit }: { limit?: boolean }) => {
  return (
    <>
      <Card className="twap-limit-price">
        <TwapStyles.StyledColumnFlex alignItems="center">
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            {!limit && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
          <StyledLimitPrice placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </Card>
    </>
  );
};

export { TWAP, Orders };
