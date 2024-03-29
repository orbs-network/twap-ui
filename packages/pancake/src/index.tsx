import { GlobalStyles, Box, ThemeProvider, Typography, styled, Modal } from "@mui/material";
import {
  Components,
  hooks,
  Translations,
  TwapAdapter,
  Styles as TwapStyles,
  store,
  TWAPProps,
  Orders,
  TwapContextUIPreferences,
  Styles,
  TooltipProps,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import {
  Card,
  configureStyles,
  darkTheme,
  lightTheme,
  StyledBalanceContainer,
  StyledButton,
  StyledChunksInput,
  StyledChunksSlider,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledLimitPriceBody,
  StyledLimitPriceLabel,
  StyledMarketPriceContainer,
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
} from "./styles";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  StyledBalance,
  StyledEmptyUSD,
  StyledMarketPrice,
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
import { createContext, useContext } from "react";
import Web3 from "web3";
import _ from "lodash";
import BN from "bignumber.js";
import { MdArrowDropDown } from "@react-icons/all-files/md/MdArrowDropDown";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { GrPowerReset } from "@react-icons/all-files/gr/GrPowerReset";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import PancakeOrders from "./PancakeOrders";
import { getTokenFromTokensList } from "@orbs-network/twap-ui";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { OrderSummary } from "./OrderSummary";
import { useTwapContext } from "@orbs-network/twap-ui";
import { useOutAmountLoading } from "@orbs-network/twap-ui/dist/hooks";
import { useAdapterContext, AdapterContextProvider, AdapterProps } from "./context";
import { Price } from "./components";
const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
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
  inputLoader: <></>,
  input: {
    showOnLoading: true,
  },
  Tooltip,
  Button,
  orders: {
    paginationChunks: 4,
  },
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
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  return (
    <StyledBalanceContainer onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <StyledBalance isSrc={isSrc} decimalScale={6} />
    </StyledBalanceContainer>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const selectToken = hooks.useSelectTokenCallback();
  const { dstToken, srcToken } = hooks.useDappRawSelectedTokens();

  const onSelect = useCallback(
    (token: any) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken]
  );
  const onTokenSelectClick = useAdapterContext().useTokenModal(onSelect, srcToken, dstToken, isSrcToken);
  return (
    <StyledTokenPanel>
      <Card.Header>
        <StyledSelectAndBalance>
          <StyledTokenSelect CustomArrow={MdArrowDropDown} hideArrow={false} isSrc={isSrcToken} onClick={onTokenSelectClick} />
          <Balance isSrc={isSrcToken} />
        </StyledSelectAndBalance>
      </Card.Header>
      <Card.Body editable={true}>
        <Styles.StyledColumnFlex width="auto" gap={1} style={{ alignItems: "flex-end" }}>
          <StyledTokenPanelInput dstDecimalScale={3} isSrc={isSrcToken} />
          <StyledUSD decimalScale={2} isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
        </Styles.StyledColumnFlex>
        {isSrcToken && <SrcTokenPercentSelector />}
      </Card.Body>{" "}
    </StyledTokenPanel>
  );
};

const PriceDisplay = () => {
  const { TradePrice } = useAdapterContext();

  if (!TradePrice) {
    return (
      <StyledMarketPriceContainer justifyContent="space-between">
        <Components.Base.Label>Market price</Components.Base.Label>
        <StyledMarketPrice hideLabel={true} />
      </StyledMarketPriceContainer>
    );
  }

  return <Price />;
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;
  const { srcAmount, srcBalance, getMaxSrcInputAmount } = store.useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
    srcBalance: state.srcBalance,
    getMaxSrcInputAmount: state.getMaxSrcInputAmount(),
  }));

  const percent = useMemo(() => {
    return srcAmount.dividedBy(srcBalance).toNumber();
  }, [srcAmount]);

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      {PERCENT.map((p) => {
        const selected = BN(srcAmount || "0").isZero()
          ? false
          : Math.round(percent * 100) === p.value * 100 || (p.value === 1 && BN(getMaxSrcInputAmount || 0).isEqualTo(srcAmount));
        return (
          <StyledButton selected={selected ? 1 : 0} key={p.text} onClick={() => onClick(p.value)}>
            {p.text}
          </StyledButton>
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

const useProvider = (props: AdapterProps) => {
  const [provider, setProvider] = useState(undefined);

  useEffect(() => {
    setProvider(props.connector?.options?.getProvider());
  }, [props.connector, props.connectedChainId, props.account]);

  return provider;
};

const TWAP = memo((props: AdapterProps) => {
  const provider = useProvider(props);

  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const useTrade = (fromToken?: string, toToken?: string, value?: string) => {
    return props.useTrade!(handleAddress(fromToken), handleAddress(toToken), value);
  };

  const dappTokens = useMemo(() => {
    if (!props.dappTokens || !props.nativeToken) return undefined;
    return {
      ...props.dappTokens,
      [zeroAddress]: props.nativeToken,
    };
  }, [props.dappTokens, props.nativeToken]);

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
        useTrade={useTrade}
        isDarkTheme={props.isDarkTheme}
        isMobile={props.isMobile}
        connectedChainId={props.connectedChainId}
        enableQueryParams={true}
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
        <TwapStyles.StyledColumnFlex>
          <LimitPrice limitOnly={true} />
          <PriceDisplay />
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
        <LimitPrice />
        <PriceDisplay />
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
  const { getChunksBiggerThanOne, srcAmount } = store.useTwapStore((store) => ({
    getChunksBiggerThanOne: store.getChunksBiggerThanOne(),
    srcAmount: store.getSrcAmount(),
  }));

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
  const value = store.useTwapStore((store) => store.getSrcChunkAmountUi());

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

const LimitPrice = ({ limitOnly }: { limitOnly?: boolean }) => {
  const isLimitOrder = store.useTwapStore((store) => store.isLimitOrder);
  const { onChange, limitPrice } = hooks.useLimitPrice();

  return (
    <StyledLimitPrice>
      <Card>
        <Card.Header>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <StyledLimitPriceLabel>
              <Components.Labels.LimitPriceLabel />
              <Components.ResetLimitButton>
                <StyledReset>
                  <TwapStyles.StyledRowFlex gap={8}>
                    <GrPowerReset />
                    <Typography>Market</Typography>
                  </TwapStyles.StyledRowFlex>
                </StyledReset>
              </Components.ResetLimitButton>
            </StyledLimitPriceLabel>
            {!limitOnly && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
        </Card.Header>
        {isLimitOrder && (
          <Styles.StyledColumnFlex>
            <StyledLimitPriceBody editable={true}>
              <Components.Base.NumericInput decimalScale={6} placeholder={""} onChange={onChange} value={limitPrice} />
            </StyledLimitPriceBody>
          </Styles.StyledColumnFlex>
        )}
      </Card>
    </StyledLimitPrice>
  );
};

export { TWAP, Orders, OrderSummary };

export enum SwapState {
  REVIEW,
  APPROVE,
  ATTEMTPING_TX,
  PENDING_CONFIRMATION,
  ERROR,
  COMPLETED,
}

const SwapModal = ({ limitPanel }: { limitPanel: boolean }) => {
  const [swapState, setSwapState] = useState(SwapState.REVIEW);
  const { dappTokens, ApproveModalContent, SwapPendingModalContent, SwapTransactionErrorContent, AddToWallet, SwapTransactionReceiptModalContent } = useAdapterContext();
  const { fromToken, setShowConfirmation, showConfirmation, txHash, isLimitOrder } = store.useTwapStore((s) => ({
    fromToken: s.srcToken,
    srcBalance: s.srcBalance,
    dstBalance: s.dstBalance,
    setShowConfirmation: s.setShowConfirmation,
    showConfirmation: s.showConfirmation,
    txHash: s.txHash,
    isLimitOrder: s.isLimitOrder,
  }));
  const reset = hooks.useResetStore();

  const { mutateAsync: approveCallback } = hooks.useApproveToken(true);
  const { data: allowance, isLoading } = hooks.useHasAllowanceQuery();
  const { mutateAsync: createOrder } = hooks.useCreateOrder(true);
  const inputCurrency = useMemo(() => getTokenFromTokensList(dappTokens, fromToken?.address), [dappTokens, fromToken]);
  const [error, setError] = useState("");

  const onSubmit = useCallback(async () => {
    try {
      if (!allowance) {
        setSwapState(SwapState.APPROVE);
        await approveCallback();
      }
      setSwapState(SwapState.ATTEMTPING_TX);
      await createOrder();
      setSwapState(SwapState.COMPLETED);
    } catch (error) {
      setSwapState(SwapState.ERROR);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred");
      }
    }
  }, [allowance, approveCallback, createOrder, setSwapState, setError]);

  const wrongNetwork = store.useTwapStore((store) => store.wrongNetwork);
  let content = null;
  let title: string | undefined = undefined;

  const onClose = () => {
    setShowConfirmation(false);
    if (swapState === SwapState.COMPLETED) {
      reset();
    }
    setTimeout(() => {
      setSwapState(SwapState.REVIEW);
    }, 300);
  };

  useEffect(() => {
    if (txHash && swapState === SwapState.ATTEMTPING_TX) {
      setSwapState(SwapState.PENDING_CONFIRMATION);
    }
  }, [txHash, swapState]);

  const addToWallet = <AddToWallet logo={fromToken?.logoUrl} symbol={fromToken?.symbol} address={fromToken?.address} decimals={fromToken?.decimals} />;

  if (swapState === SwapState.REVIEW) {
    title = "Confirm Order";
    content = <OrderSummary disabled={isLoading} onSubmit={onSubmit} />;
  }

  if (swapState === SwapState.APPROVE) {
    content = <ApproveModalContent title={`Enable spending ${inputCurrency?.symbol}`} isBonus={false} isMM={false} />;
  }

  if (swapState === SwapState.ERROR) {
    content = <SwapTransactionErrorContent openSettingModal={() => {}} onDismiss={onClose} message={error} />;
  }

  if (swapState === SwapState.ATTEMTPING_TX) {
    content = <SwapPendingModalContent title={`Create ${limitPanel ? "" : "TWAP"} ${isLimitOrder ? "Limit" : "Market"} Order`}>{addToWallet}</SwapPendingModalContent>;
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
  const { shouldWrap, shouldUnwrap, wrongNetwork, setShowConfirmation, warning, createOrderLoading, srcUsd, srcAmount } = store.useTwapStore((store) => ({
    maker: store.lib?.maker,
    shouldWrap: store.shouldWrap(),
    shouldUnwrap: store.shouldUnwrap(),
    wrongNetwork: store.wrongNetwork,
    setShowConfirmation: store.setShowConfirmation,
    warning: store.getFillWarning(translations),
    createOrderLoading: store.loading,
    srcUsd: store.srcUsd,
    srcAmount: store.srcAmountUi,
  }));
  const outAmountLoading = useOutAmountLoading();
  const { mutate: unwrap, isLoading: unwrapLoading } = hooks.useUnwrapToken(true);
  const { mutate: wrap, isLoading: wrapLoading } = hooks.useWrapToken(true);
  const { loading: changeNetworkLoading, changeNetwork } = hooks.useChangeNetwork();

  if (wrongNetwork)
    return {
      text: translations.switchNetwork,
      onClick: changeNetwork,
      loading: changeNetworkLoading,
      disabled: changeNetworkLoading,
    };

  if (outAmountLoading) {
    return { text: "Searching for the best price", onClick: undefined, disabled: true };
  }

  if (!srcAmount || BN(srcAmount || "0").isZero()) {
    return {
      text: translations.enterAmount,
      disabled: true,
    };
  }

  if (!srcUsd || srcUsd.isZero()) {
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
      text: "",
      loading: true,
      disabled: false,
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
