import {
  Components,
  Translations,
  TwapAdapter,
  useTwapContext,
  Styles as TwapStyles,
  TWAPTokenSelectProps,
  hooks,
  TWAPProps,
  ORDERS_CONTAINER_ID,
  Styles,
  size,
  compact,
  TooltipProps,
  Status,
  Configs,
  Token,
} from "@orbs-network/twap-ui";
import { memo, ReactNode, useCallback, useState, createContext, useContext, CSSProperties, useMemo, useEffect } from "react";
import translations from "./i18n/en.json";
import {
  StyledColumnFlex,
  StyledPoweredByOrbs,
  StyledSubmit,
  StyledTopColumnFlex,
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
  StyledOrders,
  StyledOrdersHeader,
  lightTheme,
  darkTheme,
  StyledOrderHeaderRight,
  StyledDstLogo,
  StyledSrcLogo,
  StyledTokenSummaryDisplay,
  StyledTokenSummaryLogos,
  StyledMobileTabsMenuButton,
  StyledLimitSwitch,
} from "./styles";
import { isNativeAddress, network } from "@defi.org/web3-candies";
import Web3 from "web3";
import { TwapContextUIPreferences } from "@orbs-network/twap-ui";
// import { VscSettings } from "@react-icons/all-files/vsc/VscSettings";
// import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
// import { IoWalletOutline } from "@react-icons/all-files/io5/IoWalletOutline";
import { ThemeProvider } from "styled-components";

const useMobile = () => {
  return hooks.useWindowWidth() < 768;
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
const nativeToken = network(config.chainId).native;

const parseToken = (getTokenLogoURL: (symbol: string) => string, rawToken: ChronosRawToken): Token | undefined => {
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
    logoUrl: getTokenLogoURL(rawToken.symbol),
  };
};

const useParsedTokens = (props: TWAPProps): Token[] => {
  const { getTokenLogoURL, dappTokens } = useAdapterContext();

  return useMemo(() => {
    if (!size(props.dappTokens) || !config) {
      return [];
    }

    const tokens = compact<Token>(dappTokens.map((rawToken) => parseToken(getTokenLogoURL, rawToken)));

    return tokens;
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
  const srcAmount = hooks.useSrcAmount().amountUi;

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
          {/* <IoIosArrowDown size={12} /> */}
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
        {/* <IoWalletOutline /> */}
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
  const onPercentClick = hooks.useOnSrcAmountPercent();
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
            {/* <Typography>{text}</Typography> */}
          </button>
        );
      })}
    </StyledPercentSelect>
  );
};

const TokenSummary = () => {
  const srcAmount = hooks.useSrcAmount().amountUi;
  const { srcToken, dstToken } = useTwapContext();
  const dstAmount = hooks.useOutAmount().amountUi;

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
          {/* <Components.Base.Tooltip text={`Buy ${dstAmountFormattedTooltip} ${dstToken?.symbol}`}>
            <StyledBuyTokenText>
              Buy {dstAmountFormatted} {dstToken?.symbol}
            </StyledBuyTokenText>
          </Components.Base.Tooltip> */}

          <TwapStyles.StyledRowFlex justifyContent="flex-start">
            {/* <Components.Base.Tooltip text={`Sell ${srcAmountFormattedTooltip} ${srcToken?.symbol}`}>
              <StyledSellTokenText>
                Sell {srcAmountFormatted} {srcToken?.symbol}
              </StyledSellTokenText>
            </Components.Base.Tooltip> */}
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenSummaryDisplay>
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

const Tooltip = (props: TooltipProps) => {
  return <div>{props.children}</div>;
};

const Wrapped = (props: ChronosTWAPProps) => {
  const provider = useProvider(props);
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const parsedTokens = useParsedTokens(props);

  return (
    <div className="adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        Components={{
          Tooltip,
        }}
        account={props.account}
        dappTokens={props.dappTokens}
        isLimitPanel={props.limit}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        parsedTokens={parsedTokens}
      >
        <ThemeProvider theme={theme}>
          {/* <GlobalStyles styles={configureStyles(theme) as any} /> */}
          <Listener />
          {props.limit ? <LimitPanel /> : <TWAPPanel />}
        </ThemeProvider>
      </TwapAdapter>
    </div>
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

  return (
    <Components.LimitPanel>
      <TokenSelect onClose={() => setIsOpen(false)} open={isOpen} isSrcToken={isSrc} />
      <div>
        <div>
          <Components.LimitPanel.Label />
          <StyledLimitSwitch />
        </div>
        <div>
          <Components.LimitPanel.Main
            onSrcSelect={onSrcSelect}
            onDstSelect={onDstSelect}
            styles={{
              percentButtonsGap: "5px",
            }}
          />
        </div>
      </div>
    </Components.LimitPanel>
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
        <TwapStyles.StyledRowFlex gap={5}>{/* <VscSettings /> */}</TwapStyles.StyledRowFlex>
      </StyledMobileTabsMenuButton>
    </>
  );
};

const OrdersLayout = () => {
  const mobile = useMobile();

  return (
    <StyledOrders className="twap-orders">
      <StyledOrdersHeader className="twap-chronos-orders-header">
        <StyledOrderHeaderRight className="twap-chronos-orders-header-right">
          <Components.Base.Odnp />
        </StyledOrderHeaderRight>
      </StyledOrdersHeader>
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
        </StyledColumnFlex>
      </StyledColumnFlex>
      {/* <Components.ShowConfirmation connect={} /> */}
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
        <StyledColumnFlex></StyledColumnFlex>
      </StyledColumnFlex>

      <StyledPoweredByOrbs />
    </div>
  );
};

const TotalTrades = () => {
  return (
    <Components.ChunkSelector>
      <div>
        <div>
          <Components.Labels.TotalTradesLabel />
        </div>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <Components.ChunkSelector.Input />
          <Components.ChunkSelector.Slider />
        </Styles.StyledRowFlex>
      </div>
    </Components.ChunkSelector>
  );
};

const MaxDuration = () => {
  return (
    <StyledTimeSelectCard className="twap-max-duration" disabled={1}>
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
      <div>
        <div>
          <Components.TradeInterval.Label />
        </div>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <Components.TradeInterval.Input />
          <Components.TradeInterval.Resolution />
        </Styles.StyledRowFlex>
      </div>
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

export { TWAP };
