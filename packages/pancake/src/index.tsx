import { GlobalStyles, ThemeProvider, styled } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, store, Orders, TwapContextUIPreferences, Styles, TooltipProps, parseError } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledBalanceContainer,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledTokenPanelTitle,
  StyledBalanceAndPercent,
  StyledContainerPadding,
  StyledPricePanel,
  StyledPricePanelInput,
  StyledPricePanelInputRight,
  StyledPricePanelPercent,
  StyledWarning,
  InputContainer,
  StyledSlider,
  StyledSliderContainer,
  StyledBackBody,
  StyledTrades,
  StyledTradeInterval,
  StyledDuration,
  StyledMarketPrice,
  StyledTokenPanelContent,
  StyledButton,
  StyledTokenPanelsContainer,
  StyledTopContainer,
  StyledBottomContainer,
  StyledSliderDots,
} from "./styles";
import React, { memo, ReactNode, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { StyledBalance, StyledEmptyUSD, StyledPercentSelect, StyledTokenChange, StyledTokenPanel, StyledTokenPanelInput, StyledTokenSelect, StyledUSD } from "./styles";
import { isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import _ from "lodash";
import BN from "bignumber.js";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";
import PancakeOrders from "./PancakeOrders";
import { useTwapContext } from "@orbs-network/twap-ui";
import { useAdapterContext, AdapterContextProvider, AdapterProps, WarningVariant } from "./context";
import { configs } from "./config";
import { MdAccountBalanceWallet } from "@react-icons/all-files/md/MdAccountBalanceWallet";
import { BackBody, ChangeIcon, CloseIcon, InfoIcon } from "./icons";
import { SwapModal } from "./OrderSubmitModal";

const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "MAX", value: 1 },
];

const Tooltip = ({ text, children, childrenStyles = {} }: TooltipProps) => {
  const context = useAdapterContext();
  const { targetRef, tooltip, tooltipVisible } = context.useTooltip(text, { placement: "top", hideTimeout: 0 });
  if (context.Tooltip) {
    return <context.Tooltip content={text}>{children}</context.Tooltip>;
  }

  return (
    <span ref={targetRef} style={{ ...childrenStyles }}>
      {children} {tooltipVisible && tooltip}
    </span>
  );
};

const uiPreferences: TwapContextUIPreferences = {
  usdSuffix: " USD",
  usdPrefix: "~",
  usdEmptyUI: <></>,
  balanceEmptyUI: <></>,
  switchVariant: "ios",
  inputPlaceholder: "0.0",
  Tooltip,
  orders: {
    paginationChunks: 6,
    hideUsd: true,
  },
  modal: {
    styles: {
      zIndex: 1,
    },
  },
};

export const useConfig = (connectedChainId?: number) => {
  return useMemo(() => {
    return Object.values(configs).find((config: any) => config.chainId === connectedChainId) || configs.PancakeSwap;
  }, [connectedChainId]);
};

export const PancakeConfigs = configs;

export const useParseToken = () => {
  const connectedChainId = useAdapterContext().connectedChainId;
  const config = useConfig(connectedChainId);

  return useCallback(
    (rawToken: any): TokenData | undefined => {
      if (!rawToken) return;
      const { address, decimals, symbol, logoURI } = rawToken;

      if (!symbol) {
        console.error("Invalid token", rawToken);
        return;
      }
      if (!address || isNativeAddress(address || "") || address === "BNB") {
        return config.nativeToken;
      }
      return {
        address: Web3.utils.toChecksumAddress(address),
        decimals,
        symbol,
        logoUrl: logoURI,
      };
    },
    [config.nativeToken, config.chainId]
  );
};

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Balance = ({ isSrc, hide }: { isSrc?: boolean; hide: boolean }) => {
  const onPercentClick = hooks.useCustomActions();
  const warning = hooks.useFillWarning();
  const type = warning?.type;

  const showWarning = type === "balance" && isSrc;

  if (!isSrc) return null;

  return (
    <StyledBalanceContainer style={{ cursor: isSrc ? "pointer" : "auto" }} warning={showWarning ? 1 : 0} hide={hide ? 1 : 0} onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <MdAccountBalanceWallet />
      <StyledBalance hideLabel={true} isSrc={isSrc} decimalScale={6} />
    </StyledBalanceContainer>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const { dstToken, srcToken } = hooks.useDappRawSelectedTokens();
  const [showPercent, setShowPercent] = useState(false);
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  const onSelect = useCallback(
    (token: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected]
  );
  const onTokenSelectClick = useAdapterContext().useTokenModal(onSelect, srcToken, dstToken, isSrcToken);
  return (
    <StyledContainerPadding>
      <StyledTokenPanel>
        <Styles.StyledRowFlex justifyContent="space-between">
          <StyledTokenPanelTitle>{isSrcToken ? "From" : "To"}</StyledTokenPanelTitle>
          <StyledBalanceAndPercent>
            <Balance isSrc={isSrcToken} hide={Boolean(isSrcToken && showPercent)} />
            <SrcTokenPercentSelector show={Boolean(isSrcToken && showPercent)} />
          </StyledBalanceAndPercent>
        </Styles.StyledRowFlex>
        <StyledTokenPanelContent disabled={!isSrcToken} onBlur={() => setShowPercent(false)} onFocus={() => setShowPercent(true)}>
          <StyledTokenSelect CustomArrow={MdKeyboardArrowDown} hideArrow={false} isSrc={isSrcToken} onClick={onTokenSelectClick} />
          <Styles.StyledColumnFlex style={{ flex: 1, gap: 0, alignItems: "flex-end", width: "auto", overflow:'hidden' }}>
            <StyledTokenPanelInput dstDecimalScale={7} isSrc={isSrcToken} />
            <StyledUSD decimalScale={2} isSrc={isSrcToken} hideIfZero={true} emptyUi={<StyledEmptyUSD />} />
          </Styles.StyledColumnFlex>
        </StyledTokenPanelContent>
        {isSrcToken && <SrcInputWarning />}
      </StyledTokenPanel>
    </StyledContainerPadding>
  );
};

const SrcTokenPercentSelector = ({ show }: { show: boolean }) => {
  const onPercentClick = hooks.useCustomActions();
  const srcAmount = hooks.useSrcAmount().amount;
  const srcBalance = hooks.useSrcBalance().data;
  const maxSrcInputAmount = hooks.useMaxSrcInputAmount();

  const percent = useMemo(() => {
    if (!srcAmount) return 0;
    return BN(srcAmount)
      .dividedBy(srcBalance || "0")
      .toNumber();
  }, [srcAmount, srcBalance]);

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect show={show ? 1 : 0}>
      {PERCENT.map((p) => {
        const selected = BN(srcAmount || "0").isZero() ? false : Math.round(percent * 100) === p.value * 100 || (p.value === 1 && BN(maxSrcInputAmount || 0).isEqualTo(srcAmount));
        return (
          <button key={p.text} onClick={() => (selected ? () => {} : onClick(p.value))}>
            {p.text}
          </button>
        );
      })}
    </StyledPercentSelect>
  );
};

const ChangeTokensOrder = () => {
  const switchTokens = hooks.useSwitchTokens();

  return (
    <StyledTokenChange>
      <button onClick={switchTokens}>
        <ChangeIcon />
      </button>
    </StyledTokenChange>
  );
};

export const useProvider = (props: AdapterProps) => {
  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    if (props.connector?.getProvider) {
      const res = await props.connector?.getProvider();
      setProvider(res);
    }
  }, [setProvider, props.connector]);

  useEffect(() => {
    setProviderFromConnector();
  }, [props.account, props.connectedChainId, setProviderFromConnector]);

  return provider;
};

const useHandleAddress = (connectedChainId?: number) => {
  const config = useConfig(connectedChainId);
  return useCallback(
    (address?: string) => {
      return isNativeAddress(address || "") ? config.nativeToken.symbol : address;
    },
    [config.nativeToken.symbol, connectedChainId]
  );
};

const useTrade = () => {
  const { srcToken, dstToken } = useParsedSelectedTokens();
  const { useTrade, connectedChainId } = useAdapterContext();

  const srcAmountUi = store.useTwapStore((s) => s.srcAmountUi);
  const amount = hooks.useAmountBN(srcAmountUi || "1", srcToken?.decimals);
  const handleAddress = useHandleAddress(connectedChainId);
  const res = useTrade!(handleAddress(srcToken?.address), handleAddress(dstToken?.address), amount);

  return {
    outAmount: res?.outAmount,
    isLoading: !srcToken || !dstToken ? false : res?.isLoading,
  };
};

const useParsedSelectedTokens = () => {
  const context = useAdapterContext();
  const { srcToken, dstToken } = context;

  const parseToken = useParseToken();
  return useMemo(() => {
    return {
      srcToken: parseToken(srcToken),
      dstToken: parseToken(dstToken),
    };
  }, [srcToken, dstToken, parseToken]);
};

const useParsedTokens = () => {
  const { dappTokens } = useAdapterContext();
  const parse = useParseToken();
  return useMemo(() => {
    if (!dappTokens) return [];
    return _.compact(_.map(dappTokens, parse));
  }, [dappTokens, parse]);
};

const useTheme = () => {
  const isDarkTheme = useAdapterContext().isDarkTheme;

  return useMemo(() => {
    return isDarkTheme ? darkTheme : lightTheme;
  }, [isDarkTheme]);
};

const TwapPanel = memo(() => {
  const trade = useTrade();
  const context = useAdapterContext();
  const parseToken = useParseToken();
  const theme = useTheme();
  const config = useConfig(context.connectedChainId);
  const { srcToken, dstToken } = useParsedSelectedTokens();
  const onCancelOrderSuccess = useOnCancelOrderSuccess();

  const parsedTokens = useParsedTokens();
  return (
    <div className="twap-adapter-wrapper">
      <TwapAdapter
        connect={context.connect}
        config={config}
        maxFeePerGas={context.maxFeePerGas}
        priorityFeePerGas={context.priorityFeePerGas}
        translations={translations as Translations}
        provider={context.provider}
        account={context.account}
        srcToken={srcToken}
        dstToken={dstToken}
        storeOverride={context.limit ? storeOverride : undefined}
        parseToken={parseToken}
        dappTokens={context.dappTokens}
        uiPreferences={uiPreferences}
        onDstTokenSelected={context.onDstTokenSelected}
        usePriceUSD={context.usePriceUSD}
        onSrcTokenSelected={context.onSrcTokenSelected}
        isDarkTheme={context.isDarkTheme}
        isMobile={context.isMobile}
        connectedChainId={context.connectedChainId}
        enableQueryParams={true}
        marketPrice={trade?.outAmount}
        marketPriceLoading={trade?.isLoading}
        fee={0.25}
        isLimitPanel={context.limit}
        parsedTokens={parsedTokens}
        onCancelOrderSuccess={onCancelOrderSuccess}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <TWAPPanel />
          <PancakeOrders />
        </ThemeProvider>
      </TwapAdapter>
    </div>
  );
});

const useOnCancelOrderSuccess = () => {
  const { toast } = useAdapterContext();
  return useCallback(
    (id: number) => {
      toast({
        title: "Order cancelled",
        message: `Order ${id} has been cancelled`,
        variant: "success",
        autoCloseMillis: 4_000,
      });
    },
    [toast]
  );
};

const TWAP = (props: AdapterProps) => {
  const dappTokens = useMemo(() => {
    if (!props.dappTokens || !props.nativeToken) return undefined;
    return {
      ...props.dappTokens,
      [zeroAddress]: props.nativeToken,
    };
  }, [props.dappTokens, props.nativeToken]);
  const provider = useProvider(props);

  return (
    <AdapterContextProvider value={{ ...props, provider, dappTokens }}>
      <TwapPanel />
    </AdapterContextProvider>
  );
};

const SrcInputWarning = () => {
  const warning = hooks.useFillWarning();
  const type = warning?.type;

  if (type !== "balance" && type !== "min-chunk-size") return null;

  return (
    <Warning variant="error">
      <Styles.StyledText>{warning?.message}</Styles.StyledText>
    </Warning>
  );
};

const DefaultButton = ({ isLoading, disabled, children, onClick }: any) => {
  return (
    <StyledButton disabled={isLoading || disabled} onClick={onClick}>
      {children}
    </StyledButton>
  );
};

const Button = ({ onClick, disabled, children, loading }: any) => {
  const DappButton = useAdapterContext().Button;

  if (DappButton) {
    return (
      <DappButton onClick={onClick} disabled={disabled || loading}>
        {children}
      </DappButton>
    );
  }

  return (
    <DefaultButton onClick={onClick} disabled={disabled || loading}>
      {children}
    </DefaultButton>
  );
};

const OpenConfirmationModalButton = () => {
  const { ConnectButton, provider } = useAdapterContext();
  const { onClick, text, disabled } = useShowSwapModalButton();

  if (!provider) {
    return (
      <StyledContainerPadding>
        <StyledButtonContainer>
          <ConnectButton />
        </StyledButtonContainer>
      </StyledContainerPadding>
    );
  }

  return (
    <StyledContainerPadding>
      <StyledButtonContainer>
        <Button onClick={onClick} disabled={disabled}>
          {text}
        </Button>
      </StyledButtonContainer>
    </StyledContainerPadding>
  );
};

const StyledButtonContainer = styled("div")({
  width: "100%",
  "> *": {
    width: "100%",
  },
});

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <StyledTopContainer>
          <StyledTokenPanelsContainer>
            <TokenPanel isSrcToken={true} />
            <ChangeTokensOrder />
            <TokenPanel />
          </StyledTokenPanelsContainer>
          <LimitPriceToggle />
          <PricePanel />
        </StyledTopContainer>
        <StyledBottomContainer>
          <TotalTrades />
          <MaxDurationAndTradeInterval />
          <OpenConfirmationModalButton />
        </StyledBottomContainer>
      </StyledColumnFlex>
      <SwapModal />
    </div>
  );
};

const MaxDurationAndTradeInterval = () => {
  const limit = useAdapterContext().limit;

  const shouldWrap = hooks.useShouldWrap();
  const shouldUnwrap = hooks.useShouldUnwrap();

  if (limit || shouldWrap || shouldUnwrap) return null;
  return (
    <>
      <StyledContainerPadding>
        <Styles.StyledRowFlex>
          <TradeInterval />
          <MaxDuration />
        </Styles.StyledRowFlex>
      </StyledContainerPadding>
      <TimeIntervalAndDurationWarnings />
    </>
  );
};

export function TotalTrades({ className = "" }: { className?: string }) {
  const limitPanel = useAdapterContext().limit;
  const maxPossibleChunks = hooks.useMaxPossibleChunks();
  const chunks = hooks.useChunks();
  const chunkSize = hooks.useFormatNumber({ value: hooks.useSrcChunkAmountUi(), decimalScale: 3 });
  const setChunks = hooks.useSetChunks();
  const { srcToken, translations: t } = useTwapContext();
  const shouldWrap = hooks.useShouldWrap();
  const shouldUnwrap = hooks.useShouldUnwrap();
  const connectedChainId = useAdapterContext().connectedChainId;
  const config = useConfig(connectedChainId);

  const onSetChunks = useCallback(
    (value: string) => {
      const res = !value ? 0 : Number(value);
      setChunks(res);
    },
    [setChunks]
  );

  if (limitPanel || shouldWrap || shouldUnwrap) return null;

  return (
    <StyledContainerPadding>
      <StyledTrades>
        <InputContainer.Header>
          <Styles.StyledRowFlex justifyContent="space-between">
            <InputContainer.Header.Label tooltip={t.totalTradesTooltip} label="Total Trades" />
            <InputContainer.Header.Label
              tooltip={
                <>
                  {t.tradeSizeTooltip} <br /> {`Note: Min. size per trade should be > USD ${config.minChunkSizeUsd}`}
                </>
              }
              label="Size Per Trade: "
              value={!srcToken ? "" : `${chunkSize} ${srcToken?.symbol}`}
            />
          </Styles.StyledRowFlex>
        </InputContainer.Header>

        <Styles.StyledRowFlex gap={40}>
          <Components.Base.NumericInput className={className} placeholder="0" value={chunks} decimalScale={0} maxValue={maxPossibleChunks.toString()} onChange={onSetChunks} />
          <StyledSliderContainer className="twap-trades-select">
            <StyledBackBody>
              <BackBody />
            </StyledBackBody>
            <SliderDots />
            <StyledSlider className={className} maxTrades={maxPossibleChunks} value={chunks} onChange={setChunks} />
          </StyledSliderContainer>
        </Styles.StyledRowFlex>
      </StyledTrades>
    </StyledContainerPadding>
  );
}

const SliderDots = () => {
  return (
    <StyledSliderDots>
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} />
      ))}
    </StyledSliderDots>
  );
};

const MaxDuration = () => {
  const isWarning = hooks.useIsPartialFillWarning();
  const t = useTwapContext().translations;

  return (
    <StyledDuration customBorder={!!isWarning}>
      <InputContainer.Header>
        <InputContainer.Header.Label tooltip={t.maxDurationTooltip} label="Max Duration" />
      </InputContainer.Header>
      <Components.MaxDurationSelector />
    </StyledDuration>
  );
};

const TradeInterval = () => {
  const fillDelayWarning = store.useTwapStore((store) => store.getFillDelayWarning());
  const t = useTwapContext().translations;

  return (
    <StyledTradeInterval customBorder={!!fillDelayWarning}>
      <InputContainer.Header>
        <InputContainer.Header.Label tooltip={t.tradeIntervalTootlip} label="Trade Interval" />
      </InputContainer.Header>
      <Components.TradeIntervalSelector />
    </StyledTradeInterval>
  );
};

const TimeIntervalAndDurationWarnings = () => {
  const fillDelayWarning = store.useTwapStore((store) => store.getFillDelayWarning());
  const isWarning = hooks.useIsPartialFillWarning();
  const durationUi = hooks.useDurationUi();
  const translation = useTwapContext().translations;
  const warning = useMemo(() => {
    if (fillDelayWarning) {
      return {
        variant: "error" as WarningVariant,
        message: `Trade interval must be more than 1 minute to allow time for bidder auction and block settlement.`,
      };
    }
    if (durationUi.amount === 0) {
      return {
        variant: "error" as WarningVariant,
        message: translation.enterMaxDuration,
      };
    }
    if (isWarning) {
      return {
        variant: "info" as WarningVariant,
        message: `Order will be partially filled. To fully fill it, the minimum duration should be total trades multiplied by trade interval.`,
      };
    }
  }, [fillDelayWarning, isWarning, durationUi.amount, translation.enterMaxDuration]);

  if (!warning) return null;

  return (
    <StyledContainerPadding>
      <Warning variant={warning.variant}>{warning.message}</Warning>
    </StyledContainerPadding>
  );
};

const LimitPriceToggle = () => {
  const limit = useAdapterContext().limit;

  const shouldWrap = hooks.useShouldWrap();
  const shouldUnwrap = hooks.useShouldUnwrap();

  if (limit || shouldWrap || shouldUnwrap) return null;
  return (
    <StyledContainerPadding>
      <StyledLimitPrice>
        <Styles.StyledRowFlex width="auto">
          <Components.LimitPriceToggle />
          <Components.Labels.LimitPriceLabel />
        </Styles.StyledRowFlex>
        <TradePrice />
      </StyledLimitPrice>
    </StyledContainerPadding>
  );
};

const PricePanel = () => {
  const { isMarketOrder } = store.useTwapStore((s) => ({
    isMarketOrder: !s.isLimitOrder,
  }));

  const shouldWrap = hooks.useShouldWrap();
  const shouldUnwrap = hooks.useShouldUnwrap();

  if (isMarketOrder || shouldWrap || shouldUnwrap) return null;

  return (
    <StyledContainerPadding>
      <StyledPricePanel className="twap-limit-price-panel">
        <PricePanelHeader />
        <Styles.StyledRowFlex className="twap-limit-price-panel-inputs">
          <LimitPanelInput />
          <LimitPanelPercent />
        </Styles.StyledRowFlex>
        <PricePanelWarning />
      </StyledPricePanel>
    </StyledContainerPadding>
  );
};

const TradePrice = () => {
  const { isMarketOrder } = store.useTwapStore((s) => ({
    isMarketOrder: !s.isLimitOrder,
  }));
  const { srcToken, dstToken } = useTwapContext();
  const limitPrice = hooks.useTradePrice().priceUI;
  if (!isMarketOrder) return null;

  return (
    <StyledMarketPrice>
      <Components.InvertPrice price={limitPrice} srcToken={srcToken} dstToken={dstToken} />
    </StyledMarketPrice>
  );
};

const PricePanelWarning = () => {
  const gainPercent = hooks.useTradePrice().gainPercent;

  if (gainPercent >= 0) return null;

  return (
    <Warning variant="warning">
      <span>
        {" "}
        Limit price is {gainPercent}% lower than market, you are selling at a much lower rate. Please use our <a href="/swap">Swap</a> instead.
      </span>
    </Warning>
  );
};

const Warning = ({ variant = "warning", children = "" }: { variant?: WarningVariant; children?: ReactNode }) => {
  return (
    <StyledWarning variant={variant} className="twap-warning-msg">
      <InfoIcon />
      <div className="twap-warning-msg-content">{children}</div>
    </StyledWarning>
  );
};

const PricePanelHeader = () => {
  const token = useTwapContext().srcToken;
  const { onReset } = hooks.useTradePrice();

  return (
    <Styles.StyledRowFlex className="twap-limit-price-panel-header">
      <Styles.StyledText className="twap-limit-price-panel-header-sell">Sell {token?.symbol} at rate</Styles.StyledText>
      <button className="twap-limit-price-panel-header-reset" onClick={onReset}>
        <Styles.StyledText>Set market rate</Styles.StyledText>
      </button>
    </Styles.StyledRowFlex>
  );
};

const LimitPanelInput = () => {
  const { onChange, priceUI: limitPrice, isLoading, usd } = hooks.useTradePrice();

  const token = useTwapContext().dstToken;
  const usdF = hooks.useFormatNumber({ value: usd, decimalScale: 2 });

  return (
    <StyledPricePanelInput className="twap-limit-price-panel-input">
      <Components.Base.Label>{token?.symbol}</Components.Base.Label>
      <StyledPricePanelInputRight>
        <Components.Base.NumericInput loading={isLoading} placeholder={""} onChange={onChange} value={limitPrice} />
        {BN(usd || 0).gt(0) && !isLoading && <Components.Base.USD value={usdF} />}
      </StyledPricePanelInputRight>
    </StyledPricePanelInput>
  );
};

const LimitPanelPercent = () => {
  const { gainPercent, isLoading, onPercent } = hooks.useTradePrice();
  const warning = BN(gainPercent || 0).lt(0);

  return (
    <StyledPricePanelPercent customBorder={!!warning} className="twap-limit-price-panel-percent">
      <Components.Base.Label>Gain</Components.Base.Label>
      <Styles.StyledRowFlex className="twap-limit-price-panel-percent-right">
        <Components.Base.NumericInput allowNegative={true} loading={isLoading} placeholder={"0"} onChange={(value: string) => onPercent(Number(value))} value={gainPercent} />
        {!isLoading && <Styles.StyledText>%</Styles.StyledText>}
      </Styles.StyledRowFlex>
    </StyledPricePanelPercent>
  );
};
export { type ToastProps } from "./context";
export { TWAP, Orders };

export const useShowSwapModalButton = () => {
  const { translations } = useTwapContext();
  const { limit } = useAdapterContext();
  const { wrongNetwork, setShowConfirmation, srcAmount } = store.useTwapStore((store) => ({
    maker: store.lib?.maker,
    wrongNetwork: store.wrongNetwork,
    setShowConfirmation: store.setShowConfirmation,
    srcAmount: store.srcAmountUi,
  }));
  const shouldWrap = hooks.useShouldWrap();
  const shouldUnwrap = hooks.useShouldUnwrap();
  const warning = hooks.useFillWarning();
  const { priceUI: marketPrice, isLoading: marketPriceLoading } = hooks.useMarketPriceV2();
  const { mutate: unwrap, isLoading: unwrapLoading } = hooks.useUnwrapToken();
  const { mutate: wrap, isLoading: wrapLoading } = hooks.useWrapToken();
  const { loading: changeNetworkLoading, changeNetwork } = hooks.useChangeNetwork();
  const srcUsd = hooks.useSrcUsd().value;
  const dstUsd = hooks.useDstUsd().value;

  const placeOrderText = limit ? "Place Limit Order" : "Place TWAP Order";

  const noLiquidity = useMemo(() => {
    if (BN(srcAmount || 0).isZero() || marketPriceLoading) return false;
    return !marketPrice || BN(marketPrice).isZero();
  }, [marketPrice, marketPriceLoading, srcAmount]);

  if (wrongNetwork)
    return {
      text: translations.switchNetwork,
      onClick: changeNetwork,
      loading: changeNetworkLoading,
      disabled: changeNetworkLoading,
    };

  if (!srcAmount || BN(srcAmount || "0").isZero()) {
    return {
      text: translations.enterAmount,
      disabled: true,
    };
  }
  if (marketPriceLoading) {
    return { text: "Searching for the best price", onClick: undefined, disabled: true };
  }

  if (noLiquidity) {
    return {
      text: "Insufficient liquidity for this trade.",
      disabled: true,
      loading: false,
    };
  }

  if (!srcUsd || srcUsd.isZero() || !dstUsd || dstUsd.isZero()) {
    return {
      text: "Searching for the best price",
      disabled: true,
    };
  }
  if (shouldUnwrap)
    return {
      text: translations.unwrap,
      onClick: unwrap,
      loading: unwrapLoading,
      disabled: unwrapLoading || warning,
    };
  if (shouldWrap)
    return {
      text: translations.wrap,
      onClick: wrap,
      loading: wrapLoading,
      disabled: wrapLoading || warning,
    };
  if (warning)
    return {
      text: placeOrderText,
      onClick: undefined,
      disabled: true,
      loading: false,
    };

  return {
    text: placeOrderText,
    onClick: () => {
      setShowConfirmation(true);
    },
    loading: false,
    disabled: false,
  };
};

export const isChainSupported = (chainId?: number) => {
  return !!Object.values(configs).find((config) => config.chainId === chainId);
};
