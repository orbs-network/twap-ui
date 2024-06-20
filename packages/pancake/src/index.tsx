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
  StyledMenuButton,
  StyledColumnFlex,
  StyledPoweredBy,
  StyledModalHeaderClose,
  StyledModalHeader,
  StyledSwapModalContent,
  StyledModalHeaderTitle,
  StyledResetLimitButtonContainer,
  StyledResetLimitButtonLeft,
  StyledResetLimitButtonRight,
  StyledLimitPriceTitle,
  StyledLimitPriceTokenSelect,
  StyledChunksSelect,
  StyledChunkSelectMaxButton,
  StyledTradeIntervalSelect,
  StyledTradeIntervalSelectCard,
} from "./styles";
import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyledBalance,
  StyledEmptyUSD,
  StyledPercentSelect,
  StyledSelectAndBalance,
  StyledTokenChange,
  StyledTokenChangeContainer,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { Configs, TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import _ from "lodash";
import BN from "bignumber.js";
import { MdArrowDropDown } from "@react-icons/all-files/md/MdArrowDropDown";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import PancakeOrders from "./PancakeOrders";
import { getTokenFromTokensList } from "@orbs-network/twap-ui";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { OrderSummary } from "./OrderSummary";
import { useTwapContext, LimitPriceCustomPercentProps, LimitPricePercentProps } from "@orbs-network/twap-ui";
import { useAdapterContext, AdapterContextProvider, AdapterProps } from "./context";
import { create } from "zustand";
import { LimitPriceTitleProps } from "@orbs-network/twap-ui";
import { LimitPriceTokenSelectProps } from "@orbs-network/twap-ui";

const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "MAX", value: 1 },
];

const Tooltip = ({ text, children, childrenStyles = {} }: TooltipProps) => {
  const useTooltip = useAdapterContext().useTooltip;
  const tooltip = useTooltip?.(text, { placement: "top", hideTimeout: 0 });

  if (!tooltip) return null;
  return (
    <span ref={tooltip.targetRef} style={{ ...childrenStyles }}>
      {children} {tooltip.tooltipVisible && tooltip.tooltip}
    </span>
  );
};

const config = Configs.PancakeSwap;

export const parseToken = (rawToken: any): TokenData | undefined => {
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

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Balance = ({ isSrc }: { isSrc?: boolean }) => {
  const onPercentClick = hooks.useCustomActions();

  return (
    <StyledBalanceContainer onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <StyledBalance isSrc={isSrc} decimalScale={6} />
    </StyledBalanceContainer>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const { dstToken } = hooks.useDappRawSelectedTokens();
  const onTokenSelectClick = useTokenSelectClick();
  return (
    <StyledTokenPanel>
      <Card.Header>
        <StyledSelectAndBalance>
          <StyledTokenSelect CustomArrow={MdArrowDropDown} hideArrow={false} isSrc={isSrcToken} onClick={onTokenSelectClick} />
          <Balance isSrc={isSrcToken} />
        </StyledSelectAndBalance>
      </Card.Header>
        <Styles.StyledColumnFlex width="auto" gap={1} style={{ alignItems: "flex-end" }}>
          <StyledTokenPanelInput dstDecimalScale={dstToken?.decimals || 3} isSrc={isSrcToken} />
          <StyledUSD decimalScale={2} isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
        </Styles.StyledColumnFlex>
        {isSrcToken && <SrcTokenPercentSelector />}
    </StyledTokenPanel>
  );
};

const SrcTokenPercentSelector = () => {
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
    <StyledPercentSelect>
      {PERCENT.map((p) => {
        const selected = BN(srcAmount || "0").isZero() ? false : Math.round(percent * 100) === p.value * 100 || (p.value === 1 && BN(maxSrcInputAmount || 0).isEqualTo(srcAmount));
        return (
          <StyledMenuButton selected={selected ? 1 : 0} key={p.text} onClick={() => (selected ? () => {} : onClick(p.value))}>
            {p.text}
          </StyledMenuButton>
        );
      })}
    </StyledPercentSelect>
  );
};

const ChangeTokensOrder = () => {
  return (
    <StyledTokenChangeContainer>
      <StyledTokenChange icon={<AiOutlineArrowDown />} />
    </StyledTokenChangeContainer>
  );
};

const handleAddress = (address?: string) => {
  return isNativeAddress(address || "") ? "BNB" : address;
};

export const useProvider = (props: AdapterProps) => {
  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    const res = await props.connector?.getProvider();
    setProvider(res);
  }, [setProvider, props.connector]);

  useEffect(() => {
    setProviderFromConnector();
  }, [props.account, props.connectedChainId, setProviderFromConnector]);

  return provider;
};

const useTrade = (props: AdapterProps, amount?: string) => {
  const { srcToken, toToken } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    toToken: s.dstToken,
  }));

  const res = props.useTrade!(handleAddress(srcToken?.address), handleAddress(toToken?.address), BN(amount || 0).isZero() ? undefined : amount);

  return {
    result: res?.outAmount,
    isLoading: BN(amount || 0).gt(0) && res?.isLoading,
  };
};

const useMarketPrice = (props: AdapterProps) => {
  const { srcToken } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));

  const amount = hooks.useAmountBN(srcToken?.decimals, "1");
  return useTrade(props, amount);
};

const TWAP = memo((props: AdapterProps) => {
  const provider = useProvider(props);
  const marketPrice = useMarketPrice(props);

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

  const uiPreferences = useMemo((): TwapContextUIPreferences => {
    return {
      usdSuffix: " USD",
      usdPrefix: "~",
      usdEmptyUI: <></>,
      balanceEmptyUI: <></>,
      switchVariant: "ios",
      inputPlaceholder: "0.0",
      Tooltip: props.useTooltip ? Tooltip : undefined,
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
  }, [props.useTooltip]);

  return (
    <Box className="twap-adapter-wrapper">
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
        marketPrice={marketPrice.result}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={{ ...props, provider, dappTokens }}>
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
            <PancakeOrders />
          </AdapterContextProvider>
        </ThemeProvider>
      </TwapAdapter>
    </Box>
  );
});

const TopPanel = () => {
  return (
    <Styles.StyledColumnFlex gap={0}>
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
    </Styles.StyledColumnFlex>
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
        <LimitPrice />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <SwapModal limitPanel={true} />
      <StyledPoweredBy />
    </div>
  );
};

const useTokenSelectClick = (isSrcToken?: boolean) => {
  const selectToken = hooks.useSelectTokenCallback();
  const { dstToken, srcToken } = hooks.useDappRawSelectedTokens();

  const onSelect = useCallback(
    (token: any, isSrcToken?: boolean) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken]
  );

  return useAdapterContext().useTokenModal(onSelect, srcToken, dstToken, isSrcToken);
};

const PercentButton = ({ selected, text, onClick }: LimitPricePercentProps) => {
  return (
    <StyledMenuButton onClick={onClick} selected={selected ? 1 : 0}>
      {text}
    </StyledMenuButton>
  );
};

const ZeroButton = ({ text, onClick }: LimitPriceCustomPercentProps) => {
  return (
    <StyledResetLimitButtonContainer>
      <StyledResetLimitButtonLeft selected={1} onClick={onClick}>
        {text}
      </StyledResetLimitButtonLeft>
      <StyledResetLimitButtonRight selected={1} onClick={onClick}>
        X
      </StyledResetLimitButtonRight>
    </StyledResetLimitButtonContainer>
  );
};

const LimitPriceTitle = ({ textLeft, textRight, token, onTokenClick }: LimitPriceTitleProps) => {
  return (
    <StyledLimitPriceTitle>
      <span>{textLeft}</span>
      <StyledLimitPriceTokenSelect onClick={onTokenClick} symbol={token?.symbol} logo={token?.logoUrl} />
      <span>{textRight}</span>
    </StyledLimitPriceTitle>
  );
};

const LimitTokenSelect = ({ token, onClick }: LimitPriceTokenSelectProps) => {
  return <StyledLimitPriceTokenSelect onClick={onClick} symbol={token?.symbol} logo={token?.logoUrl} />;
};


const LimitPriceInput = ({ value, onChange, isLoading }: any) => {

  return  <Components.Base.NumericInput value={value} onChange={onChange} loading={isLoading} />
}

const LimitPrice = () => {
  const onSrcSelect = useTokenSelectClick(true);
  const onDstSelect = useTokenSelectClick(false);

  return (
    <Card>
        <Components.LimitPanel
          onSrcSelect={onSrcSelect}
          onDstSelect={onDstSelect}
          styles={{
            percentButtonsGap: "5px",
          }}
          Components={{
            PercentButton,
            ZeroButton,
            Title: LimitPriceTitle,
            TokenSelect: LimitTokenSelect,
            Input: LimitPriceInput
          }}
        />
    </Card>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <LimitPrice />
        <TotalTrades />
        <TradeIntervalSelect />
        <SwapModal limitPanel={false} />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <StyledPoweredBy />
    </div>
  );
};

const MenuButton = ({ text, selected, onClick }: { text: string; selected: boolean; onClick: () => void}) => {
  return (
    <StyledMenuButton selected={selected ? 1 : 0} onClick={onClick}>
      {text}
    </StyledMenuButton>
  );
};

const TotalTradesWarningButton = ({ onClick, text }: { onClick: () => void; text: string }) => {
  return (
    <StyledChunkSelectMaxButton selected={1} onClick={onClick}>
      {text}
    </StyledChunkSelectMaxButton>
  );
};

const TotalTrades = () => {
  const show = hooks.useChunksBiggerThanOne();
  if (!show) return null;
  return (
    <Card>
      <Card.Header>
        <Components.Labels.TotalTradesLabel />
      </Card.Header>
      <StyledChunksSelect Components={{ MenuButton: MenuButton, WarningButton: TotalTradesWarningButton }} />
    </Card>
  );
};

const TradeIntervalSelect = () => {
  return (
    <StyledTradeIntervalSelectCard>
      <Card.Header>
        <Components.Labels.TradeIntervalLabel />
      </Card.Header>
      <StyledTradeIntervalSelect>
      <Components.TradeIntervalSelect Components={{ Button: MenuButton }} />
      </StyledTradeIntervalSelect>
    </StyledTradeIntervalSelectCard>
  )
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
  const { isLoading: dstAmountLoading } = hooks.useOutAmount();
  const { mutate: unwrap, isLoading: unwrapLoading } = hooks.useUnwrapToken(true);
  const { mutate: wrap, isLoading: wrapLoading } = hooks.useWrapToken(true);
  const { loading: changeNetworkLoading, changeNetwork } = hooks.useChangeNetwork();
  const srcUsd = hooks.useSrcUsd().value;
  const dstUsd = hooks.useDstUsd().value;
  const noLiquidity = hooks.useNoLiquidity();

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
