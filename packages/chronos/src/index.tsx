import { GlobalStyles, MenuItem, ThemeProvider, Typography, useMediaQuery } from "@mui/material";
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
import { memo, ReactNode, useCallback, useState, createContext, useContext, CSSProperties, useMemo, useEffect } from "react";
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
  StyledOrdersHeader,
  lightTheme,
  darkTheme,
  StyledOrderHeaderRight,
  StyledDstLogo,
  StyledSellTokenText,
  StyledSrcLogo,
  StyledTokenSummaryDisplay,
  StyledTokenSummaryLogos,
  StyledBuyTokenText,
  StyledMobileTabsMenuButton,
  StyledMobileTabsMenu,
} from "./styles";
import { Configs, Status, TokenData } from "@orbs-network/twap";
import { isNativeAddress } from "@defi.org/web3-candies";
import Web3 from "web3";
import { TwapContextUIPreferences } from "@orbs-network/twap-ui";
import _ from "lodash";

import { VscSettings } from "@react-icons/all-files/vsc/VscSettings";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { IoWalletOutline } from "@react-icons/all-files/io5/IoWalletOutline";

const useMobile = () => {
  return useMediaQuery("(max-width:700px)");
};

interface ChronosTWAPProps extends TWAPProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: any[];
  connect?: () => void;
  swapAnimationStart: boolean;
  connector?: { getProvider: () => any };
}

const uiPreferences: TwapContextUIPreferences = {
  getOrdersTabsLabel: (name: string, amount: number) => `${name} (${amount})`,
  qrSize: 120,
  switchVariant: "ios",
  orderTabsToExclude: [Status.Canceled],
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

  return <TokenSelectModal showEth={true} selectToken={props.onSelect} open={props.isOpen} setOpen={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
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
  const onPercentClick = hooks.useCustomActions();
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

  const { limit } = useAdapterContext();

  return (
    <StyledOrderSummaryModal className="twap-ui-chronos-modal">
      <StyledOrderSummaryModalPadding>
        <StyledOrderSummaryModalHeader>
          <Components.Base.IconButton onClick={() => setShowConfirmation(false)} icon={<IoMdArrowBack />} />

          <Typography>Confirm {limit ? "Limit" : "TWAP"} Operation</Typography>
        </StyledOrderSummaryModalHeader>
      </StyledOrderSummaryModalPadding>

      <TwapStyles.StyledColumnFlex gap={40}>
        <StyledOrderSummaryModalPadding>
          <TwapStyles.StyledColumnFlex gap={40}>
            <TokenSummary />
            <TwapStyles.StyledColumnFlex gap={20}>
              {children}
              <StyledStyledDisclaimerTextCard>
                <StyledDisclaimerText />
              </StyledStyledDisclaimerTextCard>
            </TwapStyles.StyledColumnFlex>
          </TwapStyles.StyledColumnFlex>
        </StyledOrderSummaryModalPadding>
        <TwapStyles.StyledColumnFlex gap={12}>
          <Recipient />
          <StyledOrderSummaryModalPadding>
            <StyledDisclaimer />
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
      <TwapStyles.StyledRowFlex justifyContent="space-between" className="twap-recipient-flex">
        <Components.Base.Label>{translations.outputWillBeSentTo}</Components.Base.Label>
        <Components.Base.Tooltip text={maker}>
          <Typography>{makeElipsisAddress(maker)}</Typography>
        </Components.Base.Tooltip>
      </TwapStyles.StyledRowFlex>
    </StyledRecipient>
  );
};

const TokenSummary = () => {
  const { srcAmount, srcToken, dstToken } = store.useTwapStore((store) => ({
    srcAmount: store.srcAmountUi,
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
  const dstAmount = hooks.useDstAmount().outAmount.ui;

  const srcAmountFormatted = hooks.useFormatNumber({ value: srcAmount });
  const srcAmountFormattedTooltip = hooks.useFormatNumber({ value: srcAmount, decimalScale: 18 });

  const dstAmountFormatted = hooks.useFormatNumber({ value: dstAmount });
  const dstAmountFormattedTooltip = hooks.useFormatNumber({ value: dstAmount, decimalScale: 18 });
  const mobile = useMobile();

  return (
    <TwapStyles.StyledColumnFlex>
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
            {!mobile && <Components.OrderSummaryPriceCompare />}
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenSummaryDisplay>
      {mobile && <Components.OrderSummaryPriceCompare />}
    </TwapStyles.StyledColumnFlex>
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

const Listener = () => {
  const switchTokens = hooks.useSwitchTokens();

  const { swapAnimationStart } = useAdapterContext();
  useEffect(() => {
    if (swapAnimationStart) {
      switchTokens();
    }
  }, [swapAnimationStart]);

  return <></>;
};

const useProvider = (props: ChronosTWAPProps) => {
  const [provider, setProvider] = useState<any>();

  const chainId = props.connectedChainId;
  const account = props.account;

  const _getProvider = useCallback(async () => {
    if (!props.connector) return;
    const provider = await props.connector.getProvider();
    setProvider(provider);
  }, [account, chainId, setProvider, props.connector]);

  useEffect(() => {
    setProvider(undefined);
    _getProvider();
  }, [account, chainId, _getProvider, setProvider]);

  return provider;
};

const TWAP = (props: ChronosTWAPProps) => {
  const provider = useProvider(props);
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  return (
    <Box className="adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        dappTokens={props.dappTokens}
        parseToken={(rawToken) => parseToken(props.getTokenLogoURL, rawToken)}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        storeOverride={props.limit ? limitStoreOverride : undefined}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        priceUsd={props.priceUsd}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            <Listener />
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

const MobileTabs = () => {
  const { setTab, tab } = store.useOrdersStore((store) => store);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSelected = (value: number) => {
    setTab(value);
    setAnchorEl(null);
  };

  return (
    <>
      {/* <StyledMobileTabsMenuButton aria-controls={open ? "basic-menu" : undefined} aria-expanded={open ? "true" : undefined} onClick={handleClick}>
        <TwapStyles.StyledRowFlex gap={5}>
          <VscSettings />
          <Typography> {_.keys(tabs)[tab]}</Typography>
        </TwapStyles.StyledRowFlex>
      </StyledMobileTabsMenuButton>
      <StyledMobileTabsMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {_.keys(tabs).map((key, index) => {
          return (
            <MenuItem key={key} onClick={() => onSelected(index)}>
              {key}
            </MenuItem>
          );
        })}
      </StyledMobileTabsMenu> */}
    </>
  );
};

const OrdersLayout = () => {
  const mobile = useMobile();

  return (
    <StyledOrders className="twap-orders">
      <StyledOrdersHeader className="twap-chronos-orders-header">
        <Components.Labels.OrdersLabel />
        <StyledOrderHeaderRight className="twap-chronos-orders-header-right">
          {!mobile ? <StyledOrdersTabs /> : <MobileTabs />}
          <Components.Base.Odnp />
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
        <StyledWarningMsg />
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
        <StyledWarningMsg />
        <StyledTopColumnFlex gap={6.5}>
          <TokenPanel isSrcToken={true} />
          <ChangeTokensOrder />
          <TokenPanel />
        </StyledTopColumnFlex>
        <StyledColumnFlex>
          <MarketPrice />
          <LimitPrice limit={true} />

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

const ChunksLeft = () => {
  return (
    <StyledBigBorder style={{ gap: 5 }} className="twap-chunks-left">
      <Components.Labels.ChunksAmountLabel />
      <Components.TradeSizeValue />
    </StyledBigBorder>
  );
};

const ChunksMiddle = () => {
  return (
    <StyledBigBorder style={{ flex: 1 }} justifyContent="space-between" className="twap-chunks-middle">
      <Components.ChunksInput />
      <Components.SrcToken />
    </StyledBigBorder>
  );
};

const ChunksRight = () => {
  return (
    <StyledBigBorder style={{ width: 90 }} className="twap-chunks-right">
      <Components.ChunksUSD prefix="≈$" />
    </StyledBigBorder>
  );
};

const TradeSize = () => {
  const srcAmountNotZero = hooks.useSrcAmountNotZero();
  const mobile = useMediaQuery("(max-width:600px)");

  return (
    <>
      <StyledTradeSize className="twap-trade-size" disabled={!srcAmountNotZero ? 0 : 1}>
        <StyledCardColumn className="twap-trade-size-flex">
          <Components.Labels.TotalTradesLabel />
          <ChunksSlider />

          {!mobile ? (
            <TwapStyles.StyledRowFlex className="twap-card-children">
              <ChunksLeft />
              <ChunksMiddle />
              <ChunksRight />
            </TwapStyles.StyledRowFlex>
          ) : (
            <TwapStyles.StyledColumnFlex className="twap-card-children">
              <ChunksMiddle />
              <TwapStyles.StyledRowFlex>
                <ChunksLeft />
                <ChunksRight />
              </TwapStyles.StyledRowFlex>
            </TwapStyles.StyledColumnFlex>
          )}
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
  const components = Components.useLimitPriceComponents({ toggleIcon: <HiArrowRight style={{ width: 20, height: 20 }} />, showDefault: true });
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

            <BigBorder className="twap-limit-price-middle">
              {components?.input}
              {components?.rightToken}
            </BigBorder>
            <BigBorder className="twap-limit-price-right">{components?.toggle}</BigBorder>
          </StyledLimitPriceInput>
        )}
      </StyledCardColumn>
    </StyledLimitPrice>
  );
};

const BigBorder = ({ children, style = {}, className = "" }: { children?: ReactNode; style?: CSSProperties; className?: string }) => {
  return (
    <StyledBigBorder style={style} className={className}>
      {children}
    </StyledBigBorder>
  );
};

const ChunksSlider = () => {
  const show = hooks.useChunksBiggerThanOne();

  if (!show) return null;
  return (
    <StyledChunksSlider>
      <Components.ChunksSliderSelect />
    </StyledChunksSlider>
  );
};

export { Orders, TWAP };
