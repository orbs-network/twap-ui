import { GlobalStyles, Box, ThemeProvider, Typography, styled } from "@mui/material";
import {
  Components,
  hooks,
  Translations,
  TwapAdapter,
  Styles as TwapStyles,
  store,
  Orders,
  TwapContextUIPreferences,
  Styles,
  TooltipProps,
  parseError,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import {
  Card,
  configureStyles,
  darkTheme,
  lightTheme,
  StyledBalanceContainer,
  StyledChunksInput,
  StyledChunksSlider,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledPoweredBy,
  StyledReset,
  StyledTimeSelect,
  StyledTimeSelectBody,
  StyledTimeSelectContainer,
  StyledTimeSelectHeader,
  StyledTotalChunks,
  StyledTradeSize,
  StyledModalHeaderClose,
  StyledModalHeader,
  StyledSwapModalContent,
  StyledModalHeaderTitle,
  StyledTokenPanelTitle,
  StyeledTokenPanelBody,
  StyledBalanceAndPercent,
  StyledTokenInputs,
  StyledTokenInputsPadding,
  StyledPricePanel,
  StyledPricePanelInput,
  StyledPricePanelInputRight,
  StyledPricePanelPercent,
  StyledWarning,
  StyledInputContainer,
  StyledInputContainerChildren,
  InputContainer,
} from "./styles";
import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyledBalance, StyledEmptyUSD, StyledPercentSelect, StyledTokenChange, StyledTokenPanel, StyledTokenPanelInput, StyledTokenSelect, StyledUSD } from "./styles";
import { isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import _ from "lodash";
import BN from "bignumber.js";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";
import PancakeOrders from "./PancakeOrders";
import { getTokenFromTokensList } from "@orbs-network/twap-ui";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { OrderSummary } from "./OrderSummary";
import { useTwapContext } from "@orbs-network/twap-ui";
import { useAdapterContext, AdapterContextProvider, AdapterProps } from "./context";
import { Price } from "./components";
import { create } from "zustand";
import { configs } from "./config";
import { MdAccountBalanceWallet } from "@react-icons/all-files/md/MdAccountBalanceWallet";
import { ChangeIcon } from "./icons/change";
import { InfoIcon } from "./icons/info";

const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "MAX", value: 1 },
];

const Button = (props: any) => {
  const DappButton = useAdapterContext().Button;

  return (
    <DappButton onClick={props.onClick} disabled={props.disabled || props.loading}>
      {props.children}
    </DappButton>
  );
};

const Tooltip = ({ text, children, childrenStyles = {} }: TooltipProps) => {
  const useTooltip = useAdapterContext().useTooltip;
  const { targetRef, tooltip, tooltipVisible } = useTooltip(text, { placement: "top", hideTimeout: 0 });
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
  Button,
  orders: {
    paginationChunks: 4,
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

export const useParseToken = (connectedChainId?: number) => {
  const config = useConfig(connectedChainId);

  return useCallback(
    (rawToken: any): TokenData | undefined => {
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

  return (
    <StyledBalanceContainer hide={hide ? 1 : 0} isSrc={isSrc ? 1 : 0} onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <MdAccountBalanceWallet />
      <StyledBalance hideLabel={true} isSrc={isSrc} decimalScale={6} />
    </StyledBalanceContainer>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const selectToken = hooks.useSelectTokenCallback();
  const { dstToken, srcToken } = hooks.useDappRawSelectedTokens();
  const [showPercent, setShowPercent] = useState(false);

  const onSelect = useCallback(
    (token: any) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken]
  );
  const onTokenSelectClick = useAdapterContext().useTokenModal(onSelect, srcToken, dstToken, isSrcToken);
  return (
    <StyledTokenPanel>
      <Styles.StyledRowFlex justifyContent="space-between">
        <StyledTokenPanelTitle>{isSrcToken ? "From" : "To"}</StyledTokenPanelTitle>
        <StyledBalanceAndPercent>
          <Balance isSrc={isSrcToken} hide={Boolean(isSrcToken && showPercent)} />
          <SrcTokenPercentSelector show={Boolean(isSrcToken && showPercent)} />
        </StyledBalanceAndPercent>
      </Styles.StyledRowFlex>

      <InputContainer disabled={!isSrcToken} onBlur={() => setShowPercent(false)} onFocus={() => setShowPercent(true)}>
        <Styles.StyledRowFlex gap={5} style={{ alignItems: "center" }}>
          <StyledTokenSelect CustomArrow={MdKeyboardArrowDown} hideArrow={false} isSrc={isSrcToken} onClick={onTokenSelectClick} />
          <Styles.StyledColumnFlex style={{ flex: 1, gap: 0, alignItems: "flex-end" }}>
            <StyledTokenPanelInput dstDecimalScale={7} isSrc={isSrcToken} />
            <StyledUSD decimalScale={2} isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
          </Styles.StyledColumnFlex>
        </Styles.StyledRowFlex>
      </InputContainer>
    </StyledTokenPanel>
  );
};

const SrcTokenPercentSelector = ({ show }: { show: boolean }) => {
  const onPercentClick = hooks.useCustomActions();
  const { srcAmount } = store.useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
  }));

  const srcBalance = hooks.useSrcBalance().data;

  const maxSrcInputAmount = hooks.useMaxSrcInputAmount();

  const percent = useMemo(() => {
    return srcAmount.dividedBy(srcBalance || "0").toNumber();
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

const useTrade = (props: AdapterProps) => {
  const { srcToken, toToken, srcAmount } = store.useTwapStore((s) => ({
    srcToken: s.srcToken?.address,
    toToken: s.dstToken?.address,
    srcAmount: s.getSrcAmount().toString(),
  }));

  const handleAddress = useHandleAddress(props.connectedChainId);

  const res = props.useTrade!(handleAddress(srcToken), handleAddress(toToken), srcAmount === "0" ? undefined : srcAmount);

  return {
    outAmount: res?.outAmount,
    isLoading: BN(srcAmount || "0").gt(0) && res?.isLoading,
  };
};

const TWAP = memo((props: AdapterProps) => {
  const provider = useProvider(props);
  const trade = useTrade(props);
  const parseToken = useParseToken(props.connectedChainId);

  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const dappTokens = useMemo(() => {
    if (!props.dappTokens || !props.nativeToken) return undefined;
    return {
      ...props.dappTokens,
      [zeroAddress]: props.nativeToken,
    };
  }, [props.dappTokens, props.nativeToken]);
  const config = useConfig(props.connectedChainId);

  return (
    <div className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        storeOverride={props.limit ? storeOverride : undefined}
        parseToken={parseToken}
        dappTokens={dappTokens}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        usePriceUSD={props.usePriceUSD}
        onSrcTokenSelected={props.onSrcTokenSelected}
        isDarkTheme={props.isDarkTheme}
        isMobile={props.isMobile}
        connectedChainId={props.connectedChainId}
        enableQueryParams={true}
        dstAmountOut={trade?.outAmount}
        dstAmountLoading={trade?.isLoading}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={{ ...props, provider, dappTokens }}>
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
            <PancakeOrders />
          </AdapterContextProvider>
        </ThemeProvider>
      </TwapAdapter>
    </div>
  );
});

const TopPanel = () => {
  return (
    <StyledTokenInputs>
      <StyledTokenInputsPadding>
        <TokenPanel isSrcToken={true} />
      </StyledTokenInputsPadding>

      <ChangeTokensOrder />
      <StyledTokenInputsPadding>
        <TokenPanel />
        <LimitPriceToggle />
        <PricePanel />
      </StyledTokenInputsPadding>
    </StyledTokenInputs>
  );
};

const OpenConfirmationModalButton = () => {
  const { ConnectButton, provider, Button } = useAdapterContext();
  const { onClick, text, disabled } = useShowSwapModalButton();

  if (!provider) {
    return (
      <StyledButtonContainer>
        <ConnectButton />
      </StyledButtonContainer>
    );
  }

  return (
    <StyledButtonContainer>
      <Button onClick={onClick} disabled={disabled}>
        {text}
      </Button>
    </StyledButtonContainer>
  );
};

const StyledButtonContainer = styled("div")({
  width: "100%",
  "> *": {
    width: "100%",
  },
  marginTop: 10,
});

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <TwapStyles.StyledColumnFlex>
          <Price />
        </TwapStyles.StyledColumnFlex>
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <SwapModal limitPanel={true} />
      <StyledPoweredBy />
    </div>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <Price />
        <TotalTrades />
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
        <SwapModal limitPanel={false} />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <StyledPoweredBy />
    </div>
  );
};

const TotalTrades = () => {
  const { srcAmount } = store.useTwapStore((store) => ({
    srcAmount: store.getSrcAmount(),
  }));

  const getChunksBiggerThanOne = hooks.useChunksBiggerThanOne();

  if (srcAmount.isZero()) return null;

  if (!getChunksBiggerThanOne) {
    return (
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.Labels.TotalTradesLabel />
        <Typography style={{ fontSize: 14 }}>1</Typography>
      </TwapStyles.StyledRowFlex>
    );
  }
  return (
    <StyledTotalChunks>
      <Card.Header>
        <Components.Labels.TotalTradesLabel />
      </Card.Header>
      <Card.Body editable={true}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between">
          <StyledChunksSlider />
          <StyledChunksInput />
        </TwapStyles.StyledRowFlex>
      </Card.Body>
    </StyledTotalChunks>
  );
};

const TradeSize = () => {
  const value = hooks.useSrcChunkAmountUi();

  if (BN(value || "0").isZero()) return null;
  return (
    <StyledTradeSize>
      <Components.Labels.ChunksAmountLabel />
      <Components.TradeSize hideLabel={true} hideLogo={true} />
    </StyledTradeSize>
  );
};

const MaxDuration = () => {
  return (
    <StyledTimeSelectContainer>
      <StyledTimeSelectHeader>
        <Components.Labels.MaxDurationLabel />
      </StyledTimeSelectHeader>
      <StyledTimeSelect>
        <StyledTimeSelectBody editable={true}>
          <Components.MaxDurationSelector />
        </StyledTimeSelectBody>
        <Components.PartialFillWarning />
      </StyledTimeSelect>
    </StyledTimeSelectContainer>
  );
};

const TradeInterval = () => {
  return (
    <StyledTimeSelectContainer>
      <StyledTimeSelectHeader>
        <Components.Labels.TradeIntervalLabel />
      </StyledTimeSelectHeader>
      <StyledTimeSelect>
        <StyledTimeSelectBody editable={true}>
          <Components.TradeIntervalSelector />
        </StyledTimeSelectBody>
        <Components.FillDelayWarning />
      </StyledTimeSelect>
    </StyledTimeSelectContainer>
  );
};

const LimitPriceToggle = () => {
  return (
    <StyledLimitPrice>
      <span>
        <Components.LimitPriceToggle />
        <Components.Labels.LimitPriceLabel />
      </span>

      <MarketPrice />
    </StyledLimitPrice>
  );
};

const PricePanel = () => {
  return (
    <StyledPricePanel className="twap-limit-price-panel">
      <PricePanelHeader />
      <Styles.StyledRowFlex className="twap-limit-price-panel-inputs">
        <LimitPanelInput />
        <LimitPanelPercent />
      </Styles.StyledRowFlex>
      <PricePanelWarning />
    </StyledPricePanel>
  );
};

const MarketPrice = () => {
  const { marketPrice, leftToken, rightToken } = hooks.useMarketPriceV2();
  const priceF = hooks.useFormatNumber({ value: marketPrice?.original, decimalScale: 6 });

  return (
    <Styles.StyledText>
      1 ${leftToken?.symbol} = {priceF} {rightToken?.symbol}
    </Styles.StyledText>
  );
};

const PricePanelWarning = () => {
  const gainPercent = -5;

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

const Warning = ({ variant = "warning", children = "" }: { variant?: "error" | "warning"; children?: ReactNode }) => {
  return (
    <StyledWarning variant={variant} className="twap-warning-msg">
      <InfoIcon />
      <div className="twap-warning-msg-content">{children}</div>
    </StyledWarning>
  );
};

const PricePanelHeader = () => {
  const token = store.useTwapStore((s) => s.srcToken);
  const { onReset } = hooks.useLimitPriceV2();

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
  const { onChange, limitPrice, isLoading, usd, isCustom } = hooks.useLimitPriceV2();
  const token = store.useTwapStore((s) => s.dstToken);
  const usdF = hooks.useFormatNumber({ value: usd, decimalScale: 3 });

  return (
    <StyledPricePanelInput className="twap-limit-price-panel-input">
      <Components.Base.Label>{token?.symbol}</Components.Base.Label>
      <StyledPricePanelInputRight>
        <Components.Base.NumericInput decimalScale={isCustom ? undefined : 6} loading={isLoading} placeholder={""} onChange={onChange} value={limitPrice.original} />
        <Components.Base.USD value={usdF} />
      </StyledPricePanelInputRight>
    </StyledPricePanelInput>
  );
};

const LimitPanelPercent = () => {
  const { gainPercent, isLoading, onPercent } = hooks.useLimitPriceV2();

  return (
    <StyledPricePanelPercent className="twap-limit-price-panel-percent">
      <Components.Base.Label>Gain</Components.Base.Label>
      <Styles.StyledRowFlex className="twap-limit-price-panel-percent-right">
        <Components.Base.NumericInput allowNegative={true} loading={isLoading} placeholder={"0"} onChange={(value: string) => onPercent(Number(value))} value={gainPercent} />
        <Styles.StyledText>%</Styles.StyledText>
      </Styles.StyledRowFlex>
    </StyledPricePanelPercent>
  );
};

export { TWAP, Orders };

export enum SwapState {
  REVIEW,
  APPROVE,
  ATTEMTPING_TX,
  PENDING_CONFIRMATION,
  ERROR,
  COMPLETED,
}

interface Store {
  swapState: SwapState;
  setSwapState: (value: SwapState) => void;
}

export const useOrdersStore = create<Store>((set, get) => ({
  swapState: SwapState.REVIEW,
  setSwapState: (swapState) => set({ swapState }),
}));

const SwapModal = ({ limitPanel }: { limitPanel: boolean }) => {
  const { swapState, setSwapState } = useOrdersStore();
  const { dappTokens, ApproveModalContent, SwapPendingModalContent, SwapTransactionErrorContent, AddToWallet, SwapTransactionReceiptModalContent } = useAdapterContext();
  const { fromToken, setShowConfirmation, showConfirmation, txHash, isLimitOrder, disclaimerAccepted } = store.useTwapStore((s) => ({
    fromToken: s.srcToken,
    setShowConfirmation: s.setShowConfirmation,
    showConfirmation: s.showConfirmation,
    txHash: s.txHash,
    isLimitOrder: s.isLimitOrder,
    disclaimerAccepted: s.disclaimerAccepted,
  }));
  const reset = hooks.useResetStore();

  const { mutateAsync: approveCallback } = hooks.useApproveToken(true);
  const { data: allowance, isLoading, refetch: refetchAllowance } = hooks.useHasAllowanceQuery();
  const { mutateAsync: createOrder } = hooks.useCreateOrder(true);
  const inputCurrency = useMemo(() => getTokenFromTokensList(dappTokens, fromToken?.address), [dappTokens, fromToken]);
  const [error, setError] = useState("");
  const { data: hasNativeBalance } = hooks.useHasMinNativeTokenBalance("0.0035");
  const id = useRef(1);

  const onSubmit = useCallback(async () => {
    let _id = id.current;
    try {
      if (!hasNativeBalance) {
        setError(`Insufficient BNB balance, you need at least 0.0035BNB to cover the transaction fees.`);
        setSwapState(SwapState.ERROR);
        return;
      }
      if (!allowance) {
        setSwapState(SwapState.APPROVE);
        await approveCallback();
        const approved = await refetchAllowance();
        if (!approved.data) {
          setError("Insufficient allowance to perform the swap. Please approve the token first.");
          setSwapState(SwapState.ERROR);
          return;
        }
      }
      if (id.current === _id) {
        setSwapState(SwapState.ATTEMTPING_TX);
      }
      await createOrder();

      if (id.current === _id) {
        setSwapState(SwapState.COMPLETED);
      }
    } catch (error) {
      if (id.current === _id) {
        setSwapState(SwapState.ERROR);
        setError(parseError(error) || "An error occurred");
      }
    }
  }, [allowance, approveCallback, createOrder, setSwapState, setError, hasNativeBalance, id]);

  const wrongNetwork = store.useTwapStore((store) => store.wrongNetwork);
  let content = null;
  let title: string | undefined = undefined;

  const resetPoupupState = () => {
    setTimeout(() => {
      setSwapState(SwapState.REVIEW);
    }, 300);
  };

  const onClose = () => {
    id.current = id.current + 1;
    setShowConfirmation(false);
    resetPoupupState();
    if (txHash) {
      reset({ waitingForOrdersUpdate: true });
    }
    if (swapState === SwapState.COMPLETED) {
      reset();
    }
  };

  useEffect(() => {
    if (txHash && swapState === SwapState.ATTEMTPING_TX) {
      setSwapState(SwapState.PENDING_CONFIRMATION);
    }
  }, [txHash, swapState]);

  const addToWallet = !AddToWallet ? null : <AddToWallet logo={fromToken?.logoUrl} symbol={fromToken?.symbol} address={fromToken?.address} decimals={fromToken?.decimals} />;

  if (swapState === SwapState.REVIEW) {
    title = "Confirm Order";
    content = <OrderSummary isLimitPanel={limitPanel} disabled={isLoading || !disclaimerAccepted} onSubmit={onSubmit} />;
  }

  if (swapState === SwapState.APPROVE) {
    content = !ApproveModalContent ? null : <ApproveModalContent title={`Enable spending ${inputCurrency?.symbol}`} isBonus={false} isMM={false} />;
  }

  if (swapState === SwapState.ERROR) {
    content = !SwapTransactionErrorContent ? null : <SwapTransactionErrorContent openSettingModal={() => {}} onDismiss={onClose} message={error} />;
  }

  if (swapState === SwapState.ATTEMTPING_TX) {
    content = !SwapPendingModalContent ? null : (
      <SwapPendingModalContent title={`Create ${limitPanel ? "" : "TWAP"} ${isLimitOrder ? "Limit" : "Market"} Order`}>{addToWallet}</SwapPendingModalContent>
    );
  }

  if (swapState === SwapState.PENDING_CONFIRMATION) {
    content = (
      <SwapPendingModalContent showIcon={true} title="Transaction Submitted">
        {addToWallet}
      </SwapPendingModalContent>
    );
  }

  if (swapState === SwapState.COMPLETED) {
    content = (
      <SwapTransactionReceiptModalContent txHash={txHash} address={fromToken?.address} symbol={fromToken?.symbol} decimals={fromToken?.decimals} logo={fromToken?.logoUrl}>
        {addToWallet}
      </SwapTransactionReceiptModalContent>
    );
  }

  if (wrongNetwork) {
    content = null;
  }

  return (
    <Components.Base.Modal header={<ModalHeader title={title} onClose={onClose} />} title={title} onClose={onClose} open={showConfirmation}>
      <StyledSwapModalContent
        style={{
          paddingBottom: swapState === SwapState.REVIEW ? "24px" : "55px",
          paddingTop: title ? "30px" : "24px",
        }}
      >
        <StyledSwapModalContentChildren>{content}</StyledSwapModalContentChildren>
      </StyledSwapModalContent>
    </Components.Base.Modal>
  );
};

const StyledSwapModalContentChildren = styled("div")`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ModalHeader = ({ title, onClose }: { title?: string; onClose: () => void }) => {
  return (
    <StyledModalHeader withTitle={title ? 1 : 0}>
      {title && <StyledModalHeaderTitle>{title}</StyledModalHeaderTitle>}
      <StyledModalHeaderClose className="twap-ui-close" onClick={onClose}>
        <IoMdClose />
      </StyledModalHeaderClose>
    </StyledModalHeader>
  );
};

export const useShowSwapModalButton = () => {
  const translations = useTwapContext()?.translations;
  const { shouldWrap, shouldUnwrap, wrongNetwork, setShowConfirmation, createOrderLoading, srcAmount } = store.useTwapStore((store) => ({
    maker: store.lib?.maker,
    shouldWrap: store.shouldWrap(),
    shouldUnwrap: store.shouldUnwrap(),
    wrongNetwork: store.wrongNetwork,
    setShowConfirmation: store.setShowConfirmation,
    createOrderLoading: store.loading,
    srcAmount: store.srcAmountUi,
  }));
  const warning = hooks.useFillWarning();
  const { isLoading: dstAmountLoading, dexAmounOut } = hooks.useDstAmount();
  const { mutate: unwrap, isLoading: unwrapLoading } = hooks.useUnwrapToken(true);
  const { mutate: wrap, isLoading: wrapLoading } = hooks.useWrapToken(true);
  const { loading: changeNetworkLoading, changeNetwork } = hooks.useChangeNetwork();
  const srcUsd = hooks.useSrcUsd().value;
  const dstUsd = hooks.useDstUsd().value;

  const noLiquidity = useMemo(() => {
    if (!srcAmount || BN(srcAmount).isZero() || dstAmountLoading) return false;
    return !dexAmounOut.raw || BN(dexAmounOut.raw).isZero();
  }, [dexAmounOut.raw, dstAmountLoading, srcAmount]);

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
  if (dstAmountLoading) {
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

  if (warning)
    return {
      text: warning,
      onClick: undefined,
      disabled: true,
      loading: false,
    };

  if (shouldUnwrap)
    return {
      text: translations.unwrap,
      onClick: unwrap,
      loading: unwrapLoading,
      disabled: unwrapLoading,
    };
  if (shouldWrap)
    return {
      text: translations.wrap,
      onClick: wrap,
      loading: wrapLoading,
      disabled: wrapLoading,
    };

  if (createOrderLoading) {
    return {
      text: translations.placeOrder,
      onClick: () => {
        setShowConfirmation(true);
      },
    };
  }

  return {
    text: translations.placeOrder,
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
