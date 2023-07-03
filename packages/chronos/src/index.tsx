import { GlobalStyles } from "@mui/material";
import { Components, Translations, TwapAdapter, store, Orders, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, hooks, TWAPProps } from "@orbs-network/twap-ui";
import { memo, ReactNode, useCallback, useState, useEffect, createContext, useContext } from "react";
import translations from "./i18n/en.json";
import { Box } from "@mui/system";
import {
  configureStyles,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledMaxDuration,
  StyledPoweredByOrbs,
  StyledSubmit,
  StyledTopColumnFlex,
  StyledTradeInterval,
  StyledTradeSize,
  StyledWarningMsg,
  StyledChangeOrder,
  StyledMarketPrice,
  StyledPanelRight,
  StyledPercentSelect,
  StyledTokenInputBalance,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { IoWalletOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { Configs, TokenData } from "@orbs-network/twap";
import { isNativeAddress } from "@defi.org/web3-candies";
import Web3 from "web3";

interface ChronosTWAPProps extends TWAPProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: any[];
  connect?: () => void;
  isExample?: boolean;
}

interface ChronosRawToken {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

const config = Configs.Chronos;

const parseToken = (getTokenLogoURL: (symbol: string) => string, rawToken: ChronosRawToken): TokenData | undefined => {
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
    logoUrl: getTokenLogoURL(rawToken.symbol),
  };
};

const AdapterContext = createContext({} as ChronosTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal selectToken={props.onSelect} open={props.isOpen} setOpen={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  const { onSrcTokenSelected, onDstTokenSelected, getTokenLogoURL } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: ChronosRawToken) => parseToken(getTokenLogoURL, token)}
    />
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <StyledTokenPanel className="twap-token-panel">
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenSelect onClick={() => setTokenListOpen(true)}>
        <Components.TokenLogo isSrc={isSrcToken} />
        <TwapStyles.StyledRowFlex gap={6}>
          <Components.TokenSymbol isSrc={isSrcToken} />
          <IoIosArrowDown size={12} />
        </TwapStyles.StyledRowFlex>
      </StyledTokenSelect>
      <StyledPanelRight>
        <StyledTokenPanelInput placeholder="0.00" isSrc={isSrcToken} />
        <TwapStyles.StyledRowFlex justifyContent="flex-start" className="twap-token-panel-flex-right-bottom">
          <USD>
            <Components.TokenUSD onlyValue={true} isSrc={isSrcToken} emptyUi={<>0.00</>} />
          </USD>

          {isSrcToken && <SrcTokenPercentSelector />}
        </TwapStyles.StyledRowFlex>
      </StyledPanelRight>
      <StyledTokenInputBalance>
        <IoWalletOutline />
        <Components.TokenBalance emptyUi={<>0.00</>} label="Balance:" showSymbol={true} isSrc={isSrcToken} />
      </StyledTokenInputBalance>
    </StyledTokenPanel>
  );
};

const MarketPrice = () => {
  return (
    <StyledMarketPrice>
      <Components.MarketPrice />
    </StyledMarketPrice>
  );
};

const USD = ({ children }: { children: ReactNode }) => {
  return (
    <StyledUSD>
      <figure>$</figure>
      {children}
    </StyledUSD>
  );
};

const percent = [0.25, 0.5, 0.75, 1];

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      {percent.map((it) => {
        TwapStyles.StyledRowFlex;
        const text = it === 1 ? translations.max : `${it * 100}%`;
        return (
          <button key={it} onClick={() => onClick(it)}>
            {text}
          </button>
        );
      })}
    </StyledPercentSelect>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <Components.OrderSummaryModalContainer className="twap-ui-chronos-modal">
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
          <Components.Base.Card style={{ paddingRight: 5 }}>
            <Components.DisclaimerText />
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
    </Components.OrderSummaryModalContainer>
  );
};

const ChangeTokensOrder = () => {
  return (
    <StyledChangeOrder>
      <Components.ChangeTokensOrder />
    </StyledChangeOrder>
  );
};

const limitStoreOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

export const TWAP = (props: ChronosTWAPProps) => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    setAppReady(true);
  }, []);

  if (!appReady && !props.isExample) return null;
  return (
    <Box className="adapter-wrapper">
      <TwapAdapter
        connect={props.connect ? props.connect : () => {}}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        dappTokens={props.dappTokens}
        parseToken={(rawToken) => parseToken(props.getTokenLogoURL, rawToken)}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        storeOverride={props.limit ? limitStoreOverride : undefined}
      >
        <GlobalStyles styles={configureStyles() as any} />
        <AdapterContextProvider value={props}>
          {props.limit ? <LimitPanel /> : <TWAPPanel />}
          <Orders disableAnimation={true} />
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <StyledTopColumnFlex gap={6.5}>
          <TokenPanel isSrcToken={true} />
          <ChangeTokensOrder />
          <TokenPanel />
        </StyledTopColumnFlex>
        <StyledColumnFlex>
          <MarketPrice />
          <LimitPrice />
          <TradeSize />
          <TradeInterval />
          <MaxDuration />
          <StyledWarningMsg />
          <StyledSubmit isMain />
        </StyledColumnFlex>
      </StyledColumnFlex>
      <OrderSummary>
        <Components.OrderSummaryDetails />
      </OrderSummary>
      <StyledPoweredByOrbs />
    </div>
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <StyledTopColumnFlex gap={6.5}>
          <TokenPanel isSrcToken={true} />
          <ChangeTokensOrder />
          <TokenPanel />
        </StyledTopColumnFlex>
        <StyledColumnFlex>
          <MarketPrice />
          <LimitPrice limitOnly={true} />

          <StyledWarningMsg />
          <StyledSubmit isMain />
        </StyledColumnFlex>
      </StyledColumnFlex>
      <OrderSummary>
        <TwapStyles.StyledColumnFlex>
          <Components.OrderSummaryDetailsDeadline />
          <Components.OrderSummaryDetailsOrderType />
          <Components.OrderSummaryDetailsChunkSize />
          <Components.OrderSummaryDetailsMinDstAmount />
        </TwapStyles.StyledColumnFlex>
      </OrderSummary>
      <StyledPoweredByOrbs />
    </div>
  );
};

const TradeSize = () => {
  return (
    <>
      <StyledTradeSize className="twap-trade-size">
        <TwapStyles.StyledColumnFlex className="twap-trade-size-flex">
          <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
            <Components.Labels.TotalTradesLabel />
            <Components.ChunksSliderSelect />
            <Components.ChunksInput />
          </TwapStyles.StyledRowFlex>

          <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
            <Components.TradeSize />
            <USD>
              <Components.ChunksUSD onlyValue={true} emptyUi={<>0.00</>} />
            </USD>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTradeSize>
    </>
  );
};

const MaxDuration = () => {
  return (
    <StyledMaxDuration className="twap-max-duration">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between" className="twap-max-duration-flex">
        <TwapStyles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto" }}>
          <Components.Labels.MaxDurationLabel />
          <Components.PartialFillWarning />
        </TwapStyles.StyledRowFlex>
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </StyledMaxDuration>
  );
};

const TradeInterval = () => {
  return (
    <StyledTradeInterval className="twap-trade-interval">
      <TwapStyles.StyledRowFlex className="twap-trade-interval-flex">
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledTradeInterval>
  );
};

const LimitPrice = ({ limitOnly }: { limitOnly?: boolean }) => {
  return (
    <>
      <StyledLimitPrice className="twap-limit-price">
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            {!limitOnly && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
          <Components.LimitPriceInput placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </StyledLimitPrice>
    </>
  );
};
