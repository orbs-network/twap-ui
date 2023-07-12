import { GlobalStyles, Typography } from "@mui/material";
import { Translations, TwapAdapter, Components, Styles as TwapStyles, TWAPTokenSelectProps, store, TWAPProps, Orders } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode, useCallback, useState, createContext, useContext } from "react";
import {
  StyledBalance,
  StyledBalanceAndUSD,
  StyledOrderSummary,
  StyledPanelInput,
  StyledPanelRight,
  StyledTokenChange,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledUSD,
  configureStyles,
  StyledAdapter,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledMarketPrice,
  StyledOrders,
  StyledPoweredBy,
  StyledSubmit,
  StyledTop,
} from "./styles";
import { TbArrowsDownUp } from "react-icons/tb";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

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

const TokenChange = () => {
  const { isDarkTheme } = useAdapterContext();
  return <StyledTokenChange isDarkTheme={isDarkTheme ? 1 : 0} icon={<TbArrowsDownUp />} />;
};

const TokenSelectButton = ({ isSrc, onClick }: { isSrc?: boolean; onClick: () => void }) => {
  const { srcToken, dstToken } = store.useTwapStore();

  const notSelected = (isSrc && !srcToken) || (!isSrc && !dstToken);
  return (
    <StyledTokenSelect onClick={onClick}>
      <Components.TokenLogo isSrc={isSrc} />
      <TwapStyles.StyledColumnFlex style={{ flex: 1 }} alignItems="flex-start" gap={1}>
        <Typography className="twap-token-select-title">Swap {isSrc ? "From" : "To"}</Typography>

        <TwapStyles.StyledRowFlex gap={5} justifyContent="flex-start">
          {notSelected ? <Typography className="twap-token-select-text">Select</Typography> : <Components.TokenSymbol isSrc={isSrc} />}
          <MdOutlineKeyboardArrowDown className="twap-token-select-icon" />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </StyledTokenSelect>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { isDarkTheme } = useAdapterContext();

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenPanel className="twap-token-panel">
        <TwapStyles.StyledColumnFlex gap={14}>
          <TwapStyles.StyledRowFlex justifyContent="space-between" gap={20}>
            <TokenSelectButton isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            <StyledPanelRight isDarkMode={isDarkTheme ? 1 : 0} isSrcToken={isSrcToken ? 1 : 0}>
              <StyledPanelInput placeholder="0" isSrc={isSrcToken} />
              <StyledBalanceAndUSD>
                <StyledBalance emptyUi={<div>0.00</div>} isDarkMode={isDarkTheme ? 1 : 0} isSrc={isSrcToken} />
                <StyledUSD isDarkMode={isDarkTheme ? 1 : 0} isSrc={isSrcToken} />
              </StyledBalanceAndUSD>
            </StyledPanelRight>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  const { isDarkTheme } = useAdapterContext();
  return (
    <StyledOrderSummary isDarkTheme={isDarkTheme ? 1 : 0}>
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

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const TWAP = (props: ThenaTWAPProps) => {
  return (
    <StyledAdapter isDarkMode={props.isDarkTheme ? 1 : 0} className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        dappTokens={props.dappTokens}
        parseToken={(it) => it}
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
        <Components.Base.Card>
          <StyledMarketPrice />
        </Components.Base.Card>
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
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel />
        </StyledTop>
        <Components.Base.Card>
          <Components.MarketPrice />
        </Components.Base.Card>

        <LimitPrice limit={true} />
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
    <Components.Base.Card className="twap-max-duration-wrapper">
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
    <Components.Base.Card className="twap-trade-interval-wrapper">
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

const LimitPrice = ({ limit }: { limit?: boolean }) => {
  return (
    <>
      <Components.Base.Card className="twap-limit-price">
        <TwapStyles.StyledColumnFlex alignItems="center">
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            {!limit && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
          <StyledLimitPrice placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </Components.Base.Card>
    </>
  );
};

export { TWAP, Orders };
