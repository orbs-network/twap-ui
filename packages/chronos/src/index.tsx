import { GlobalStyles, styled, ThemeProvider, Typography } from "@mui/material";
import {
  Components,
  Translations,
  TwapAdapter,
  useTwapContext,
  Styles as TwapStyles,
  TWAPTokenSelectProps,
  hooks,
  TWAPProps,
  store,
  Orders,
  ORDERS_CONTAINER_ID,
} from "@orbs-network/twap-ui";
import { memo, ReactNode, useCallback, useState, useEffect, createContext, useContext, CSSProperties, useMemo } from "react";
import translations from "./i18n/en.json";
import { Box } from "@mui/system";
import {
  configureStyles,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledPoweredByOrbs,
  StyledSubmit,
  StyledTopColumnFlex,
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
  StyledBigBorder,
  StyledLimitPriceInput,
  StyledTimeSelectCard,
  StyledCardColumn,
  StyledChunksSlider,
  StyledOrderSummaryModal,
  StyledDisclaimerText,
  StyledStyledDisclaimerTextCard,
  StyledOrderSummaryModalHeader,
  StyledRecipient,
  StyledOrderSummaryModalPadding,
  StyledDisclaimer,
  StyledOrders,
  StyledOrdersList,
  StyledOrdersTabs,
  StyledODNP,
  StyledOrdersHeader,
  lightTheme,
  darkTheme,
  StyledOrderHeaderRight,
} from "./styles";
import { IoWalletOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { Configs, TokenData } from "@orbs-network/twap";
import { isNativeAddress } from "@defi.org/web3-candies";
import Web3 from "web3";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { IoMdArrowBack } from "react-icons/io";
import { TwapContextUIPreferences } from "@orbs-network/twap-ui";
interface ChronosTWAPProps extends TWAPProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: any[];
  connect?: () => void;
  isExample?: boolean;
}

const uiPreferences: TwapContextUIPreferences = {
  getOrdersTabsLabel: (name: string, amount: number) => `${name} (${amount})`,
};

const makeElipsisAddress = (address?: string, padding = 6): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(address.length - padding)}`;
};

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
  const srcAmount = store.useTwapStore((s) => s.srcAmountUi);

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
          <USD disabled={!srcAmount}>
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
  const srcAmountNotZero = hooks.useSrcAmountNotZero();

  return (
    <StyledMarketPrice disabled={srcAmountNotZero ? 0 : 1}>
      <Components.MarketPrice />
    </StyledMarketPrice>
  );
};

const USD = ({ children, disabled }: { children: ReactNode; disabled: boolean }) => {
  return (
    <StyledUSD disabled={disabled ? 1 : 0}>
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
            <Typography>{text}</Typography>
          </button>
        );
      })}
    </StyledPercentSelect>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  const setShowConfirmation = store.useTwapStore((store) => store.setShowConfirmation);

  return (
    <StyledOrderSummaryModal className="twap-ui-chronos-modal">
      <StyledOrderSummaryModalPadding>
        <StyledOrderSummaryModalHeader>
          <Components.Base.IconButton onClick={() => setShowConfirmation(false)} icon={<IoMdArrowBack />} />

          <Typography>Confirm Limit Operation</Typography>
        </StyledOrderSummaryModalHeader>
      </StyledOrderSummaryModalPadding>

      <TwapStyles.StyledColumnFlex gap={40}>
        <StyledOrderSummaryModalPadding>
          <TwapStyles.StyledColumnFlex gap={40}>
            <TokenSummary />
            {children}
            <StyledStyledDisclaimerTextCard>
              <StyledDisclaimerText />
            </StyledStyledDisclaimerTextCard>
          </TwapStyles.StyledColumnFlex>
        </StyledOrderSummaryModalPadding>
        <TwapStyles.StyledColumnFlex gap={12}>
          <Recipient />
          <StyledOrderSummaryModalPadding>
            <StyledDisclaimer variant="ios" />
          </StyledOrderSummaryModalPadding>
        </TwapStyles.StyledColumnFlex>
        <StyledOrderSummaryModalPadding>
          <StyledSubmit />
        </StyledOrderSummaryModalPadding>
      </TwapStyles.StyledColumnFlex>
    </StyledOrderSummaryModal>
  );
};

const Recipient = () => {
  const maker = store.useTwapStore((store) => store.lib?.maker);
  const translations = useTwapContext().translations;

  return (
    <StyledRecipient>
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.Base.Label>{translations.outputWillBeSentTo}</Components.Base.Label>
        <Components.Base.Tooltip text={maker}>
          <Typography>{makeElipsisAddress(maker)}</Typography>
        </Components.Base.Tooltip>
      </TwapStyles.StyledRowFlex>
    </StyledRecipient>
  );
};

const TokenSummary = () => {
  const srcAmount = store.useTwapStore((store) => store.srcAmountUi);
  const dstAmount = store.useTwapStore((store) => store.getDstAmountUi());
  const srcToken = store.useTwapStore((store) => store.srcToken);
  const dstToken = store.useTwapStore((store) => store.dstToken);

  const srcAmountFormatted = hooks.useFormatNumber({ value: srcAmount });
  const srcAmountFormattedTooltip = hooks.useFormatNumber({ value: srcAmount, decimalScale: 18 });

  const dstAmountFormatted = hooks.useFormatNumber({ value: dstAmount });
  const dstAmountFormattedTooltip = hooks.useFormatNumber({ value: dstAmount, decimalScale: 18 });

  return (
    <StyledTokenSummaryDisplay justifyContent="space-between">
      <StyledTokenSummaryLogos>
        <StyledSrcLogo isSrc={true} className="" />
        <StyledDstLogo />
      </StyledTokenSummaryLogos>
      <TwapStyles.StyledColumnFlex style={{ gap: 1, width: "calc(100%  - 58px)", paddingLeft: 20 }}>
        <Components.Base.Tooltip text={`Buy ${dstAmountFormattedTooltip} ${dstToken?.symbol}`}>
          <StyledBuyTokenText>
            Buy {dstAmountFormatted} {dstToken?.symbol}
          </StyledBuyTokenText>
        </Components.Base.Tooltip>

        <TwapStyles.StyledRowFlex justifyContent="flex-start">
          <Components.Base.Tooltip text={`Sell ${srcAmountFormattedTooltip} ${srcToken?.symbol}`}>
            <StyledSellTokenText>
              Sell {srcAmountFormatted} {srcToken?.symbol}
            </StyledSellTokenText>
          </Components.Base.Tooltip>
          <Components.OrderSummaryPriceCompare />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </StyledTokenSummaryDisplay>
  );
};

const StyledBuyTokenText = styled(TwapStyles.StyledOneLineText)({
  fontSize: 25,
  fontWeight: 500,
});

const StyledSellTokenText = styled(TwapStyles.StyledOneLineText)({
  fontSize: 15,
  fontWeight: 400,
  opacity: 0.8,
  flex: 1,
});

const StyledTokenSummaryDisplay = styled(TwapStyles.StyledRowFlex)({
  gap: 0,
});

const StyledSrcLogo = styled(Components.TokenLogo)({
  width: 24,
  height: 24,
  border: "1px solid white",
  position: "absolute",
  right: 0,
  bottom: 8,
});
const StyledDstLogo = styled(Components.TokenLogo)({
  width: 58,
  height: 58,
});

const StyledTokenSummaryLogos = styled(Box)({
  position: "relative",
});

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

const TWAP = (props: ChronosTWAPProps) => {
  const [appReady, setAppReady] = useState(false);

  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

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
        uiPreferences={uiPreferences}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
            <Components.Base.Portal id={ORDERS_CONTAINER_ID}>
              <OrdersLayout />
            </Components.Base.Portal>
          </AdapterContextProvider>
        </ThemeProvider>
      </TwapAdapter>
    </Box>
  );
};

const OrdersLayout = () => {
  return (
    <StyledOrders className="twap-orders">
      <StyledOrdersHeader className="twap-chronos-orders-header">
        <Components.Labels.OrdersLabel />
        <StyledOrderHeaderRight className="twap-chronos-orders-header-right">
          <StyledOrdersTabs />
          <StyledODNP />
        </StyledOrderHeaderRight>
      </StyledOrdersHeader>
      <StyledOrdersList />
    </StyledOrders>
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
          <LimitPrice limit={true} />

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
  const srcAmountNotZero = hooks.useSrcAmountNotZero();

  return (
    <>
      <StyledTradeSize className="twap-trade-size" disabled={!srcAmountNotZero ? 1 : 0}>
        <StyledCardColumn className="twap-trade-size-flex">
          <Components.Labels.TotalTradesLabel />
          <ChunksSlider />

          <TwapStyles.StyledRowFlex className="twap-card-children">
            <StyledBigBorder style={{ gap: 5 }}>
              <Components.Labels.ChunksAmountLabel />
              <Components.TradeSizeValue />
            </StyledBigBorder>
            <StyledBigBorder style={{ flex: 1 }} justifyContent="space-between">
              <Components.ChunksInput />
              <Components.SrcToken />
            </StyledBigBorder>

            <StyledBigBorder style={{ width: 90 }}>
              <Components.ChunksUSD prefix="≈$" />
            </StyledBigBorder>
          </TwapStyles.StyledRowFlex>
        </StyledCardColumn>
      </StyledTradeSize>
    </>
  );
};

const MaxDuration = () => {
  const srcAmountNotZero = hooks.useSrcAmountNotZero();

  return (
    <StyledTimeSelectCard className="twap-max-duration" disabled={!srcAmountNotZero ? 1 : 0}>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between" className="twap-max-duration-flex">
        <TwapStyles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto" }}>
          <Components.Labels.MaxDurationLabel />
          <Components.PartialFillWarning />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex style={{ flex: 1 }} className="twap-card-children">
          <Components.MaxDurationSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledTimeSelectCard>
  );
};

const TradeInterval = () => {
  const srcAmountNotZero = hooks.useSrcAmountNotZero();

  return (
    <StyledTimeSelectCard className="twap-trade-interval" disabled={!srcAmountNotZero ? 1 : 0}>
      <TwapStyles.StyledRowFlex className="twap-trade-interval-flex">
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }} className="twap-card-children">
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledTimeSelectCard>
  );
};

const LimitPrice = ({ limit }: { limit?: boolean }) => {
  const isLimitOrder = store.useTwapStore((s) => s.isLimitOrder);
  const components = Components.useLimitPriceComponents({ toggleIcon: <HiArrowsRightLeft style={{ width: 20, height: 20 }} />, showDefault: true });
  const srcAmountNotZero = hooks.useSrcAmountNotZero();
  const disabled = !srcAmountNotZero || !isLimitOrder;

  return (
    <StyledLimitPrice disabled={disabled ? 1 : 0} className="twap-limit-price">
      <StyledCardColumn>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Labels.LimitPriceLabel />
          {!limit && <Components.LimitPriceToggle variant="ios" />}
        </TwapStyles.StyledRowFlex>
        {components && (
          <StyledLimitPriceInput className="twap-card-children">
            <BigBorder style={{ gap: 4 }}>
              {components?.leftToken} <Typography>=</Typography>
            </BigBorder>

            <BigBorder style={{ flex: 1, gap: 20, paddingLeft: 19, paddingRight: 19 }}>
              {components?.input}
              {components?.rightToken}
            </BigBorder>
            <BigBorder style={{ padding: 0, width: 60 }}>{components?.toggle}</BigBorder>
          </StyledLimitPriceInput>
        )}
      </StyledCardColumn>
    </StyledLimitPrice>
  );
};

const BigBorder = ({ children, style = {} }: { children?: ReactNode; style?: CSSProperties }) => {
  return <StyledBigBorder style={style}>{children}</StyledBigBorder>;
};

const ChunksSlider = () => {
  const show = store.useTwapStore((s) => s.getChunksBiggerThanOne());

  if (!show) return null;
  return (
    <StyledChunksSlider>
      <Components.ChunksSliderSelect />
    </StyledChunksSlider>
  );
};

export { Orders, TWAP };
