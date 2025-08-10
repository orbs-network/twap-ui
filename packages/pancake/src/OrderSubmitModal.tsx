import { isNativeAddress } from "@defi.org/web3-candies";
import { styled } from "@mui/material";
import { TokenData } from "@orbs-network/twap";
import { Components, getTokenFromTokensList, hooks, store, Styles, translations, useTwapContext } from "@orbs-network/twap-ui";
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useAdapterContext } from "./context";
import { ArrowBottom, CloseIcon, InfoIcon, LinkIcon } from "./icons";
import {
  StyledSubmitModalContentHeader,
  StyledSubmitModalContent,
  StyledSubmitModalContentChildren,
  StyledSubmitModalToken,
  StyledSubmitModalProgress,
  StyledSubmitModalBottom,
  StyledSubmitModalBottomMsg,
  StyledAwaitingTxMessage,
  StyledOrderPlacedMessage,
  StyledOrderSummary,
  StyledOrderSummaryInfo,
  StyledDisclaimer,
  StyledDisclaimerContent,
  baseStyles,
  StyledSubmitModalHandle,
  StyledDrawer,
} from "./styles";
import Lottie from "react-lottie";
import * as Loading_Lottie from "./lottie/Loading_Lottie.json";
import * as Long_Success_Lottie from "./lottie/Long_Success_Lottie.json";
import * as Submit_Lottie from "./lottie/Submit_Lottie.json";
const Loading_Lottie_options = {
  loop: true,
  autoplay: true,
  animationData: Loading_Lottie,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const Submit_Lottie_options = {
  loop: false,
  autoplay: true,
  animationData: Submit_Lottie,
};

const Long_Success_Lottie_options = {
  loop: false,
  autoplay: true,
  animationData: Long_Success_Lottie,
};

export enum SwapStep {
  REVIEW,
  APPROVE,
  WRAP,
  ORDER_CREATE,
  ORDER_PLACED,
  ORDER_CREATED,
  ERROR,
}

type SwapState = {
  step?: SwapStep;
  stepIndex: number;
  stepsCount: number;
  error?: string;
  wrapped?: boolean;
  srcToken?: TokenData;
  dstToken?: TokenData;
  srcAmount?: string;
  dstAmount?: string;
};

type SubmitContextType = {
  onClose: () => void;
  state: SwapState;
  updateState: (swapId: number, payload: Partial<SwapState>) => void;
  swapId: number;
};

const SubmitContext = createContext({} as SubmitContextType);

const useSubmitContext = () => {
  return React.useContext(SubmitContext);
};

const calcStepsCount = (shouldWrap?: boolean, hasAllowance?: boolean) => {
  let count = 1.7;
  if (shouldWrap) {
    count++;
  }
  if (!hasAllowance) {
    count++;
  }
  return count;
};

type Action = { type: "UPDATE_STATE"; payload: Partial<SwapState>; swapId: number } | { type: "RESET" };

type State = {
  swapId: number;
  states: { [key: number]: SwapState };
};

const initialSwapState: SwapState = {
  step: SwapStep.REVIEW,
  stepIndex: 1,
  stepsCount: 0,
};

const initialState: State = {
  swapId: 1,
  states: {
    1: initialSwapState,
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "UPDATE_STATE":
      return {
        ...state,
        states: {
          ...state.states,
          [action.swapId]: {
            ...state.states[action.swapId],
            ...action.payload,
          },
        },
      };
    case "RESET":
      return {
        ...state,
        swapId: state.swapId + 1,
        states: {
          ...state.states,
          [state.swapId + 1]: initialSwapState,
        },
      };
    default:
      return state;
  }
}

const Provider = ({ children }: { children: ReactNode }) => {
  const { setShowConfirmation, lib } = store.useTwapStore((s) => ({
    setShowConfirmation: s.setShowConfirmation,
    lib: s.lib,
  }));

  const [_state, dispatch] = useReducer((state: State, action: Action) => reducer(state, action), initialState);
  const resetTwapStore = hooks.useResetStore();
  const { dappTokens, onSrcTokenSelected } = useAdapterContext();

  const state = _state.states[_state.swapId];

  const updateState = useCallback(
    (swapId: number, payload: Partial<SwapState>) => {
      dispatch({ type: "UPDATE_STATE", payload, swapId });
    },
    [dispatch]
  );

  const onClose = useCallback(() => {
    setShowConfirmation(false);
    // we reset the tokens and amounts, after a successfull trade
    if (state.step === SwapStep.ORDER_PLACED || state.step === SwapStep.ORDER_CREATED) {
      resetTwapStore();
    }
    setTimeout(() => {
      dispatch({ type: "RESET" });
    }, 300);

    if (state.wrapped) {
      const wToken = getTokenFromTokensList(dappTokens, lib?.config?.wToken.address);
      wToken && onSrcTokenSelected?.(wToken);
    }
  }, [resetTwapStore, setShowConfirmation, state.step, state.wrapped, onSrcTokenSelected, dappTokens, lib?.config?.wToken.address]);

  return <SubmitContext.Provider value={{ onClose, state, updateState, swapId: _state.swapId }}>{children}</SubmitContext.Provider>;
};

const useInitSwap = () => {
  const { updateState, swapId } = useSubmitContext();
  const { srcToken, dstToken } = useTwapContext();
  const srcAmount = hooks.useSrcAmount().amountUI;
  const dstAmount = hooks.useDstAmount().amountUI;

  return useCallback(() => {
    updateState(swapId, { srcToken, dstToken, srcAmount: hooks.formatWithDecimals(srcAmount), dstAmount });
  }, [updateState, swapId, srcToken, dstToken, srcAmount, dstAmount]);
};

const useSubmitSwapCallback = () => {
  const { state, updateState, swapId } = useSubmitContext();
  const { mutateAsync: approveCallback } = hooks.useApproveToken();
  const { data: allowance, refetch: refetchAllowance } = hooks.useHasAllowanceQuery();
  const { mutateAsync: createOrder } = hooks.useCreateOrder();
  const { mutateAsync: wrap } = hooks.useWrapToken();
  const { srcToken, onSrcTokenSelected, config, dappTokens, dstToken } = useTwapContext();
  const shouldWrap = isNativeAddress(srcToken?.address || "");
  const errorToast = useToastError();
  const orderPlacedToast = useOrderPlacedToast();
  const onInitSwap = useInitSwap();
  const srcAmountUi = hooks.useSrcAmount().amountUI;
  const outAmount = hooks.useDstAmount().amountUI;
  const srcAmountUiF = hooks.useFormatNumber({ value: srcAmountUi, decimalScale: 6 });
  const outAmountF = hooks.useFormatNumber({ value: outAmount, decimalScale: 6 });

  return useCallback(async () => {
    let step: SwapStep | undefined = undefined;
    const incrementStep = () => updateState(swapId, { stepIndex: state.stepIndex + 1 });
    onInitSwap();
    const updateSwapState = (_step: SwapStep) => {
      updateState(swapId, { step: _step });
      step = _step;
    };

    updateState(swapId, { stepsCount: calcStepsCount(shouldWrap, allowance) });

    try {
      if (shouldWrap) {
        updateSwapState(SwapStep.WRAP);
        await wrap();
        incrementStep();
        updateState(swapId, { wrapped: true });
      }

      if (!allowance) {
        updateSwapState(SwapStep.APPROVE);

        await approveCallback();
        const approved = await refetchAllowance();
        if (!approved.data) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
        incrementStep();
      }
      updateSwapState(SwapStep.ORDER_CREATE);
      await createOrder(() => {
        updateSwapState(SwapStep.ORDER_PLACED);
      });
      updateSwapState(SwapStep.ORDER_CREATED);
      orderPlacedToast(srcToken, dstToken, srcAmountUiF, outAmountF);
    } catch (error) {
      errorToast(error, step);
      updateState(swapId, { error: (error as any).message });
      updateSwapState(SwapStep.ERROR);
    }
  }, [
    allowance,
    approveCallback,
    config,
    createOrder,
    dappTokens,
    onSrcTokenSelected,
    orderPlacedToast,
    refetchAllowance,
    shouldWrap,
    state.stepIndex,
    swapId,
    updateState,
    wrap,
    errorToast,
    onInitSwap,
    srcAmountUiF,
    outAmountF,
    srcToken,
    dstToken,
  ]);
};

const PullableDrawer = ({ children }: { children: ReactNode }) => {
  const { isOpen, setShowConfirmation } = store.useTwapStore((s) => ({
    isOpen: s.showConfirmation,
    setShowConfirmation: s.setShowConfirmation,
  }));
  const onClose = useSubmitContext().onClose;

  return (
    <StyledDrawer
      anchor="bottom"
      open={isOpen}
      onClose={onClose}
      onOpen={() => {}}
      PaperProps={{
        style: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
      }}
    >
      <StyledSubmitModalHandle />
      {children}
    </StyledDrawer>
  );
};

const Modal = ({ children }: { children: ReactNode }) => {
  hooks.useHasAllowanceDebounedQuery();
  const isMobile = hooks.useIsMobile();
  const onClose = useSubmitContext().onClose;

  const { showConfirmation } = store.useTwapStore((s) => ({
    showConfirmation: s.showConfirmation,
  }));

  if (isMobile) {
    return <PullableDrawer>{children}</PullableDrawer>;
  }

  return (
    <Components.Base.Modal onClose={onClose} open={showConfirmation}>
      {children}
    </Components.Base.Modal>
  );
};

const SubmitModalToken = ({ token, amount }: { token?: TokenData; amount?: string }) => {
  return (
    <StyledSubmitModalToken>
      <Components.Base.TokenLogo token={token} size="40px" />
      <StyledStyledSubmitModalTokenText>{`${amount} ${token?.symbol}`}</StyledStyledSubmitModalTokenText>
    </StyledSubmitModalToken>
  );
};

const StyledStyledSubmitModalTokenText = styled(Styles.StyledText)({
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  width: "100%",
  textAlign: "center",
});

const SubmitModalSrcToken = () => {
  const {
    state: { srcToken, srcAmount },
  } = useSubmitContext();

  return <SubmitModalToken token={srcToken} amount={srcAmount} />;
};

const SubmitModalDstToken = () => {
  const {
    state: { dstToken, dstAmount },
  } = useSubmitContext();

  const amountF = hooks.useFormatNumber({ value: dstAmount });
  return <SubmitModalToken token={dstToken} amount={amountF} />;
};

export const SwapModal = () => {
  return (
    <Provider>
      <Modal>
        <ModalContent />
      </Modal>
    </Provider>
  );
};

const ModalContent = () => {
  const {
    state: { step },
  } = useSubmitContext();

  const onSubmit = useSubmitSwapCallback();

  if (step === SwapStep.ORDER_PLACED) {
    return <OrderPlacedContent />;
  }
  if (step === SwapStep.WRAP) {
    return <WrapContent />;
  }
  if (step === SwapStep.APPROVE) {
    return <ApproveContent />;
  }
  if (step === SwapStep.ORDER_CREATE) {
    return <CreateOrderContent />;
  }

  if (step === SwapStep.ERROR) {
    return <ErrorContent />;
  }

  if (step === SwapStep.REVIEW) {
    return <OrderReview onSubmit={onSubmit} />;
  }

  if (step === SwapStep.ORDER_CREATED) {
    return <OrderCreatedContent />;
  }

  return null;
};

const StepContent = ({
  indicator,
  title,
  children,
  message,
  className = "",
}: {
  indicator?: boolean;
  title: string;
  children: ReactNode;
  message?: ReactNode;
  className?: string;
}) => {
  return (
    <StyledSubmitModalContent className={`twap-submit-order-content ${className}`}>
      <ModalHeaderContent title={title} />
      <StyledSubmitModalContentChildren>{children}</StyledSubmitModalContentChildren>
      {(message || indicator) && (
        <StyledSubmitModalBottom>
          {indicator && <ProgressIndicator />}
          {message && <StyledSubmitModalBottomMsg>{message}</StyledSubmitModalBottomMsg>}
        </StyledSubmitModalBottom>
      )}
    </StyledSubmitModalContent>
  );
};

const AwaitingTxMessage = () => {
  const { account, translations } = useTwapContext();

  return (
    <StyledAwaitingTxMessage>
      <Styles.StyledText>
        {translations.pleaseApproveItInYourWallet}: {shortenWalletAddress(account || "")}
      </Styles.StyledText>
      <Components.Base.Spinner />
    </StyledAwaitingTxMessage>
  );
};

const WrapContent = () => {
  const { config, translations } = useTwapContext();
  return (
    <StepContent title={`${translations.wrap} ${config.nativeToken.symbol}`} indicator={true} message={<AwaitingTxMessage />}>
      <SubmitModalSrcToken />
      <LoadingLottie />
      <SubmitModalDstToken />
    </StepContent>
  );
};

const LoadingLottie = () => {
  return <Lottie options={Loading_Lottie_options} width={40} height={40} style={{ position: "absolute", top: 0 }} />;
};

const CreateOrderContent = () => {
  const { translations } = useTwapContext();
  return (
    <StepContent title={translations.confirmPlacing} message={<AwaitingTxMessage />} indicator={true}>
      <SubmitModalSrcToken />
      <LoadingLottie />
      <SubmitModalDstToken />
    </StepContent>
  );
};

const ExplorerMessage = () => {
  const txHash = store.useTwapStore((s) => s.txHash);
  const network = hooks.useNetwork();
  const { translations } = useTwapContext();
  return (
    <StyledOrderPlacedMessage>
      <a href={`${network?.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer">
        {translations.viewOnExplorer}: {shortenTxHash(txHash || "")} <LinkIcon />
      </a>
    </StyledOrderPlacedMessage>
  );
};

const OrderPlacedContent = () => {
  const isLimitOrder = useAdapterContext().limit;
  const [paused, setPaused] = useState(false);
  const { translations } = useTwapContext();

  useEffect(() => {
    setTimeout(() => {
      setPaused(true);
    }, 2_400);
  }, []);

  const title = isLimitOrder ? translations.limitOrderPlaced : translations.twapOrderPlaced;

  return (
    <StepContent className="twap-order-summary-placed-step" title={title} indicator={false} message={<ExplorerMessage />}>
      <SubmitModalSrcToken />
      <Lottie isPaused={paused} options={Submit_Lottie_options} width={40} style={{ position: "absolute", top: -18 }} />
      <SubmitModalDstToken />
    </StepContent>
  );
};

const OrderCreatedContent = () => {
  const { translations } = useTwapContext();
  return (
    <StepContent className="twap-order-summary-created-step" title={translations.orderSubmitted} indicator={false} message={<ExplorerMessage />}>
      <SubmitModalSrcToken />
      <Lottie options={Long_Success_Lottie_options} width={95} style={{ position: "absolute", top: -15 }} />
      <SubmitModalDstToken />
    </StepContent>
  );
};

const ErrorContent = () => {
  const { TransactionErrorContent } = useAdapterContext();
  const { onClose, state } = useSubmitContext();
  const { translations } = useTwapContext();

  const message = useMemo(() => {
    if (isTxRejected(state.error)) {
      return translations.transactionRejected;
    }

    return translations.transactionFailed;
  }, [state.error]);

  return (
    <StepContent title="Error">
      <TransactionErrorContent message={message} onClick={onClose} />
    </StepContent>
  );
};

const ApproveContent = () => {
  const { dappTokens, srcToken, translations } = useTwapContext();
  const inputCurrency = useMemo(() => getTokenFromTokensList(dappTokens, srcToken?.address), [dappTokens, srcToken]);

  return (
    <StepContent title={`${translations.approve} ${inputCurrency?.symbol}`} indicator={true} message={<AwaitingTxMessage />}>
      <SubmitModalSrcToken />
    </StepContent>
  );
};

const ProgressIndicator = () => {
  const { state } = useSubmitContext();

  if (state.stepsCount < 2) return null;
  const value = (state.stepIndex / state.stepsCount) * 100;

  return <StyledSubmitModalProgress variant="determinate" value={value} />;
};

const ModalHeaderContent = ({ title, className = " " }: { title: string; className?: string }) => {
  const { onClose } = useSubmitContext();

  return (
    <StyledSubmitModalContentHeader className={`twap-submit-order-content-header ${className}`}>
      <Styles.StyledText>{title}</Styles.StyledText>
      <button onClick={onClose}>
        <CloseIcon />
      </button>
    </StyledSubmitModalContentHeader>
  );
};

const Expiration = () => {
  const deadline = hooks.useDeadline();

  return <Components.OrderDetails.Expiry expiryMillis={deadline} />;
};

const Price = () => {
  const price = hooks.useTradePrice().priceUI;
  const { srcToken, dstToken } = useTwapContext();

  return <Components.OrderDetails.Price price={price} srcToken={srcToken} dstToken={dstToken} />;
};

const MinReceived = () => {
  const minReceived = hooks.useDstMinAmountOut().amountUI;
  const { dstToken } = useTwapContext();

  const { isLimitOrder } = store.useTwapStore((store) => ({
    isLimitOrder: store.isLimitOrder,
  }));
  return <Components.OrderDetails.MinReceived symbol={dstToken?.symbol} minReceived={minReceived} isMarketOrder={!isLimitOrder} />;
};

const TotalTrades = () => {
  const chunks = hooks.useChunks();
  if (chunks === 1) return null;
  return <Components.OrderDetails.TotalTrades totalTrades={chunks} />;
};

const SizePerTrade = () => {
  const token = useTwapContext().srcToken;
  const chunks = hooks.useChunks();

  const sizePerTrade = hooks.useSrcChunkAmountUi();
  if (chunks === 1) return null;

  return <Components.OrderDetails.SizePerTrade symbol={token?.symbol} sizePerTrade={sizePerTrade} />;
};

const TradeInterval = () => {
  const tradeInterval = store.useTwapStore((s) => s.getFillDelayUiMillis());
  const chunks = hooks.useChunks();
  if (chunks === 1) return null;
  return <Components.OrderDetails.TradeInterval tradeIntervalMillis={tradeInterval} />;
};

const Fee = () => {
  const { fee, dstToken } = useTwapContext();
  const outAmount = hooks.useDstAmount().amountUI;

  return <Components.OrderDetails.Fee outAmount={outAmount} dstToken={dstToken} fee={fee} />;
};
const OrderReview = ({ onSubmit }: { onSubmit: () => void }) => {
  const { isLoading: allowanceLoading } = hooks.useHasAllowanceQuery();
  const { Button, limit } = useAdapterContext();
  const { translations } = useTwapContext();

  return (
    <StyledOrderReviewStep title={limit ? translations.placeLimitOrder : translations.placeTWAPOrder}>
      <StyledOrderSummary>
        <StyledTokens>
          <OrderReviewTokenDisplay isSrc={true} />
          <ArrowBottom className="twap-submit-icon" />
          <OrderReviewTokenDisplay />
        </StyledTokens>

        <StyledOrderSummaryInfo>
          <Price />
          <Expiration />
          <MinReceived />
          <TotalTrades />
          <SizePerTrade />
          <TradeInterval />
          <Fee />
        </StyledOrderSummaryInfo>

        <StyledDisclaimer>
          <StyledDisclaimerContent>
            <InfoIcon />
            <Components.DisclaimerText />
          </StyledDisclaimerContent>
        </StyledDisclaimer>
        <StyledButtonContainer>
          <Button disabled={allowanceLoading} onClick={() => onSubmit()}>
            {allowanceLoading ? translations.loading : translations.confirm}
          </Button>
        </StyledButtonContainer>
      </StyledOrderSummary>
    </StyledOrderReviewStep>
  );
};

const StyledOrderReviewStep = styled(StepContent)({
  maxHeight: "90vh",
  height: "auto",
  ".twap-submit-order-content-header": {
    justifyContent: "flex-start",
  },
});

const StyledButtonContainer = styled(Styles.StyledRowFlex)({
  width: "100%",
  button: {
    width: "100%",
  },
});

const OrderReviewTokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const srcAmount = hooks.useSrcAmount().amountUI;
  const { srcToken, dstToken } = useTwapContext();
  const token = isSrc ? srcToken : dstToken;

  const dstAmount = hooks.useDstAmount().amountUI;

  const srcAmountF = hooks.useFormatNumber({ value: srcAmount, decimalScale: 13 });
  const amount = isSrc ? srcAmountF : dstAmount;

  return (
    <StyledTokenDisplay>
      <StyledTokenDisplayAmount>{amount}</StyledTokenDisplayAmount>
      <StyledTokenDisplayRight>
        <Styles.StyledText>{token?.symbol}</Styles.StyledText>
        <Components.Base.TokenLogo token={token} size="40px" />
      </StyledTokenDisplayRight>
    </StyledTokenDisplay>
  );
};

const shortenWalletAddress = (address: string, visibleChars = 4): string => {
  // Validate the input
  if (!address || !address.startsWith("0x") || address.length <= visibleChars + 2) {
    return "";
  }

  // Extract the last few characters
  const visiblePart = address.slice(-visibleChars);

  // Return the shortened address
  return `0x...${visiblePart}`;
};

const shortenTxHash = (hash: string, visibleStart = 8): string => {
  // Validate the input
  if (!hash || !hash.startsWith("0x") || hash.length <= visibleStart) {
    return "";
  }

  // Extract the first `visibleStart` characters
  const visiblePart = hash.slice(0, visibleStart + 2); // +2 to include the "0x" prefix

  // Return the shortened hash
  return `${visiblePart}...`;
};

const useOrderType = () => {
  const isLimitPanel = useAdapterContext().limit;
  const { translations } = useTwapContext();
  return isLimitPanel ? translations.limit : translations.twap;
};

const useCurrencies = () => {
  const { dappTokens, srcToken, dstToken } = useTwapContext();
  return useMemo(() => {
    return {
      inputCurrency: getTokenFromTokensList(dappTokens, srcToken),
      outputCurrency: getTokenFromTokensList(dappTokens, dstToken),
    };
  }, [dappTokens, srcToken, dstToken]);
};

const useOrderPlacedToast = () => {
  const { toast } = useAdapterContext();
  const { translations } = useTwapContext();

  return useCallback(
    (srcToken?: TokenData, dstToken?: TokenData, srcAmount?: string, outAmount?: string) => {
      try {
        toast({
          title: translations.orderSubmitted,
          message: translations.srcTokenForDstToken
            .replace("{srcAmount}", srcAmount || "")
            .replace("{srcToken}", srcToken?.symbol || "")
            .replace("{dstAmount}", outAmount || "")
            .replace("{dstToken}", dstToken?.symbol || ""),
          variant: "success",
          autoCloseMillis: 4_000,
        });
      } catch (error) {
        console.error(error);
      }
    },
    [toast, translations]
  );
};

const useToastError = () => {
  const { toast } = useAdapterContext();
  const rejectErrorData = useRejectedToastError();
  const failedToastErrorData = useFailedToastError();

  return useCallback(
    (error: any, step?: SwapStep) => {
      if (isTxRejected(error)) {
        toast({
          ...rejectErrorData(step),
          variant: "warning",
          autoCloseMillis: 4_000,
        });
      } else {
        toast({
          ...failedToastErrorData(error, step),
          variant: "error",
        });
      }
    },
    [toast, rejectErrorData, failedToastErrorData]
  );
};

const useFailedToastError = () => {
  const orderType = useOrderType();
  const { config, translations } = useTwapContext();
  const { inputCurrency } = useCurrencies();

  return useCallback(
    (error: any, step?: SwapStep) => {
      if (error.message?.toLowerCase().includes("gas required exceeds allowance")) {
        return {
          title: translations.insufficientBalance.replace("{token}", config.nativeToken.symbol),
          message: translations.insufficientBalanceMessage,
        };
      }

      const message = translations.errorMessage;
      if (step === SwapStep.WRAP) {
        return {
          title: translations.wrappingError.replace("{token}", config.nativeToken.symbol),
          message,
        };
      }

      if (step === SwapStep.APPROVE) {
        return {
          title: translations.approvingError.replace("{token}", inputCurrency?.symbol || ""),
          message,
        };
      }
      if (step === SwapStep.ORDER_CREATE) {
        return {
          title: translations.orderPlacingError.replace("{orderType}", orderType),
          message,
        };
      }

      return {
        title: translations.transactionSubmissionWentWrong,
        message,
      };
    },
    [inputCurrency, config, orderType, translations]
  );
};

const useRejectedToastError = () => {
  const { account } = useAdapterContext();
  const { inputCurrency } = useCurrencies();
  const orderType = useOrderType();

  const { config, translations } = useTwapContext();

  return useCallback(
    (step?: SwapStep) => {
      const wallet = shortenWalletAddress(account, 6);

      if (step === SwapStep.APPROVE) {
        return {
          title: translations.canceledApproval.replace("{token}", inputCurrency?.symbol || ""),
          message: translations.canceledApprovalMessage.replace("{token}", inputCurrency?.symbol || "").replace("{wallet}", wallet),
        };
      }
      if (step === SwapStep.WRAP) {
        return {
          title: translations.canceledWrapping.replace("{token}", config.nativeToken.symbol),
          message: translations.canceledWrappingMessage.replace("{token}", config.nativeToken.symbol).replace("{wallet}", wallet),
        };
      }
      if (step === SwapStep.ORDER_CREATE) {
        return {
          title: translations.canceledOrderPlacing.replace("{orderType}", orderType),
          message: translations.canceledOrderPlacingMessage.replace("{orderType}", orderType).replace("{wallet}", wallet),
        };
      }
      return {
        title: translations.canceledTransaction,
        message: translations.canceledTransactionMessage.replace("{wallet}", wallet),
      };
    },
    [inputCurrency, config, orderType, account, translations]
  );
};

const StyledTokens = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    gap: 16,
    alignItems: "center",
    ".twap-submit-icon": {
      width: 24,
      height: 24,
      "*": {
        fill: styles.label,
      },
    },
  };
});

const StyledTokenDisplayRight = styled(Styles.StyledRowFlex)({
  width: "auto",
  p: {
    fontSize: 20,
    fontWeight: 600,
  },
});

const StyledTokenDisplayAmount = styled(Styles.StyledOneLineText)({
  fontWeight: 600,
  fontSize: 24,
});
const StyledTokenDisplay = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
  gap: 50,
});

export const isTxRejected = (error: any) => {
  try {
    const message = error?.message || error;
    if (message) {
      return message?.toLowerCase()?.includes("rejected") || message?.toLowerCase()?.includes("denied");
    }
  } catch (error) {
    console.error(error);
  }
};
