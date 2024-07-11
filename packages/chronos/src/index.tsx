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
  Orders,
  ORDERS_CONTAINER_ID,
  addMissingTokens,
  UseMarketPriceProps,
  Styles,
} from "@orbs-network/twap-ui";
import { memo, ReactNode, useCallback, useState, createContext, useContext, CSSProperties, useMemo, useEffect } from "react";
import translations from "./i18n/en.json";
import { Box } from "@mui/system";
import {
  configureStyles,
  StyledColumnFlex,
  StyledPoweredByOrbs,
  StyledSubmit,
  StyledTopColumnFlex,
  StyledTradeSize,
  StyledChangeOrder,
  StyledPanelRight,
  StyledPercentSelect,
  StyledTokenInputBalance,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledUSD,
  StyledBigBorder,
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
  StyledLimitSwitch,
} from "./styles";
import { Configs, Status, TokenData } from "@orbs-network/twap";
import { isNativeAddress } from "@defi.org/web3-candies";
import Web3 from "web3";
import { TwapContextUIPreferences } from "@orbs-network/twap-ui";
import _ from "lodash";
import BN from "bignumber.js";
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

const useParsedTokens = (props: TWAPProps): TokenData[] => {
  const { getTokenLogoURL, dappTokens } = useAdapterContext();

  return useMemo(() => {
    if (!_.size(props.dappTokens) || !config) {
      return [];
    }

    const tokens = _.compact(_.map(dappTokens, (rawToken) => parseToken(getTokenLogoURL, rawToken)));

    return addMissingTokens(config, tokens);
  }, [props.dappTokens, getTokenLogoURL]);
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
  const srcAmount = hooks.useSrcAmount().srcAmountUi;

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
  const { onClose } = hooks.useSwapModal();

  const { limit } = useAdapterContext();

  return (
    <StyledOrderSummaryModal className="twap-ui-chronos-modal">
      <StyledOrderSummaryModalPadding>
        <StyledOrderSummaryModalHeader>
          <Components.Base.IconButton onClick={onClose} icon={<IoMdArrowBack />} />

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
  const { lib, translations } = useTwapContext();

  return (
    <StyledRecipient>
      <TwapStyles.StyledRowFlex justifyContent="space-between" className="twap-recipient-flex">
        <Components.Base.Label>{translations.outputWillBeSentTo}</Components.Base.Label>
        <Components.Base.Tooltip text={lib?.maker}>
          <Typography>{makeElipsisAddress(lib?.maker)}</Typography>
        </Components.Base.Tooltip>
      </TwapStyles.StyledRowFlex>
    </StyledRecipient>
  );
};

const TokenSummary = () => {
  const srcAmount = hooks.useSrcAmount().srcAmountUi;
  const { srcToken, dstToken } = useTwapContext().state;
  const dstAmount = hooks.useOutAmount().outAmountUi;

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

const useMarketPrice = (props: UseMarketPriceProps) => {
  const { srcToken, dstToken, amount } = props;
  const useTrade = useAdapterContext().useTrade;

  const trade = useTrade!(srcToken?.address, dstToken?.address, BN(amount || 0).isZero() ? undefined : amount);
  return trade?.outAmount;
};

const Wrapped = (props: ChronosTWAPProps) => {
  const provider = useProvider(props);
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const parsedTokens = useParsedTokens(props);

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
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        isLimitPanel={props.limit}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        priceUsd={props.priceUsd}
        parsedTokens={parsedTokens}
        useMarketPrice={useMarketPrice}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <Listener />
          {props.limit ? <LimitPanel /> : <TWAPPanel />}
          <SubmitOrderModal />
          <Components.Base.Portal id={ORDERS_CONTAINER_ID}>
            <OrdersLayout />
          </Components.Base.Portal>
        </ThemeProvider>
      </TwapAdapter>
    </Box>
  );
};

const LimitPrice = () => {
  const [isSrc, setIsSrc] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const onSrcSelect = useCallback(() => {
    setIsSrc(true);
    setIsOpen(true);
  }, []);

  const onDstSelect = useCallback(() => {
    setIsSrc(false);
    setIsOpen(true);
  }, []);

  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <>
      <TokenSelect onClose={() => setIsOpen(false)} open={isOpen} isSrcToken={isSrc} />
      <Box>
        <Box>
          <Components.Labels.LimitPriceLabel />
          <StyledLimitSwitch />
        </Box>
        <Box>
          <Components.LimitPanel
            onSrcSelect={onSrcSelect}
            onDstSelect={onDstSelect}
            styles={{
              percentButtonsGap: "5px",
            }}
          />
        </Box>
      </Box>
    </>
  );
};

const TWAP = (props: ChronosTWAPProps) => {
  return (
    <AdapterContextProvider value={props}>
      <Wrapped {...props} />
    </AdapterContextProvider>
  );
};

const MobileTabs = () => {
  const tabs = hooks.useOrdersTabs();
  const setTab = hooks.stateActions.useSelectOrdersTab();
  const tab = useTwapContext().state.selectedOrdersTab;

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
      <StyledMobileTabsMenuButton aria-controls={open ? "basic-menu" : undefined} aria-expanded={open ? "true" : undefined} onClick={handleClick}>
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
      </StyledMobileTabsMenu>
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
        <StyledTopColumnFlex gap={6.5}>
          <TokenPanel isSrcToken={true} />
          <ChangeTokensOrder />
          <TokenPanel />
        </StyledTopColumnFlex>
        <StyledColumnFlex>
          <TotalTrades />
          <TradeIntervalSelect />
          <MaxDuration />
          <LimitPrice />
          <StyledSubmit isMain />
        </StyledColumnFlex>
      </StyledColumnFlex>
      <Components.ShowConfirmation />
      <StyledPoweredByOrbs />
    </div>
  );
};

const SubmitOrderModal = () => {
  const { isOpen, onClose } = hooks.useSwapModal();

  return (
    <Components.Base.Modal open={isOpen} onClose={() => onClose()}>
      <Components.CreateOrderModal />
    </Components.Base.Modal>
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

const TotalTrades = () => {
  return (
    <Components.ChunkSelector>
      <Box>
        <Box>
          <Components.Labels.TotalTradesLabel />
        </Box>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <Components.ChunkSelector.Input />
          <Components.ChunkSelector.Slider />
        </Styles.StyledRowFlex>
      </Box>
    </Components.ChunkSelector>
  );
};

const MaxDuration = () => {
  const srcAmountNotZero = hooks.useSrcAmountNotZero();

  return (
    <StyledTimeSelectCard className="twap-max-duration" disabled={!srcAmountNotZero ? 1 : 0}>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between" className="twap-max-duration-flex">
        <TwapStyles.StyledRowFlex justifyContent="flex-start" style={{ width: "auto" }}>
          <Components.Labels.MaxDurationLabel />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex style={{ flex: 1 }} className="twap-card-children"></TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </StyledTimeSelectCard>
  );
};

const TradeIntervalSelect = () => {
  return (
    <Components.TradeInterval>
      <Box>
        <Box>
          <Components.TradeInterval.Label />
        </Box>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <Components.TradeInterval.Input />
          <Components.TradeInterval.Resolution />
        </Styles.StyledRowFlex>
      </Box>
    </Components.TradeInterval>
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
      <div></div>
    </StyledChunksSlider>
  );
};

export { Orders, TWAP };
