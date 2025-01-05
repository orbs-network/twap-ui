import { isNativeAddress } from "@defi.org/web3-candies";
import { styled } from "@mui/material";
import { TokenData } from "@orbs-network/twap";
import { Components, getTokenFromTokensList, hooks, store, Styles, useTwapContext } from "@orbs-network/twap-ui";
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useAdapterContext } from "./context";
import { ArrowBottom, CloseIcon, InfoIcon, LinkIcon } from "./icons";
import { useMutation } from "@tanstack/react-query";
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
  StyledSubmitModalContentMain,
  StyledDisclaimerContent,
} from "./styles";
import Lottie from "react-lottie";
import * as Loading_Lottie from "./lottie/Loading_Lottie.json";
import * as Long_Success_Lottie from "./lottie/Long_Success_Lottie.json";
import * as Submit_Lottie from "./lottie/Submit_Lottie.json";

class BalanceError extends Error {
  constructor() {
    super("insufficient balance");
    this.name = "BalanceError";
  }
}

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
  const setShowConfirmation = store.useTwapStore((s) => s.setShowConfirmation);
  const [_state, dispatch] = useReducer((state: State, action: Action) => reducer(state, action), initialState);
  const resetTwapStore = hooks.useResetStore();

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
    if (state.step === SwapStep.ORDER_PLACED) {
      resetTwapStore();
    }
    setTimeout(() => {
      dispatch({ type: "RESET" });
    }, 300);
  }, [resetTwapStore, setShowConfirmation, state.step]);

  return <SubmitContext.Provider value={{ onClose, state, updateState, swapId: _state.swapId }}>{children}</SubmitContext.Provider>;
};

const useSubmitSwapCallback = () => {
  const { state, updateState, swapId } = useSubmitContext();
  const fromToken = store.useTwapStore((s) => s.srcToken);
  const { mutateAsync: approveCallback } = hooks.useApproveToken();
  const { data: allowance, refetch: refetchAllowance } = hooks.useHasAllowanceQuery();
  const { mutateAsync: createOrder } = hooks.useCreateOrder();
  const { mutateAsync: wrap } = hooks.useWrapToken();
  const shouldWrap = isNativeAddress(fromToken?.address || "");
  const errorToast = useToastError();
  const orderPlacedToast = useOrderPlacedToast();

  return useMutation({
    mutationFn: async () => {
      let step: SwapStep | undefined = undefined;

      const incrementStep = () => updateState(swapId, { stepIndex: state.stepIndex + 1 });
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
        orderPlacedToast();
      } catch (error) {
        console.log({ error: (error as any).message });

        errorToast(error, step);
        updateSwapState(SwapStep.ERROR);
      }
    },
  });
};

const Modal = ({ children }: { children: ReactNode }) => {
  hooks.useHasAllowanceDebounedQuery();

  const { showConfirmation } = store.useTwapStore((s) => ({
    showConfirmation: s.showConfirmation,
  }));
  return <Components.Base.Modal open={showConfirmation}>{children}</Components.Base.Modal>;
};

const SubmitModalToken = ({ token, amount }: { token?: TokenData; amount?: string }) => {
  const amountF = hooks.useFormatNumber({ value: amount, decimalScale: 6 });

  return (
    <StyledSubmitModalToken>
      <Components.Base.TokenLogo logo={token?.logoUrl} />
      <Styles.StyledText>{`${amountF} ${token?.symbol}`}</Styles.StyledText>
    </StyledSubmitModalToken>
  );
};

const SubmitModalSrcToken = () => {
  const { srcToken, srcAmount } = store.useTwapStore((store) => ({
    srcToken: store.srcToken,
    srcAmount: store.srcAmountUi,
  }));

  return <SubmitModalToken token={srcToken} amount={srcAmount} />;
};

const SubmitModalDstToken = () => {
  const { dstToken } = store.useTwapStore((store) => ({
    dstToken: store.dstToken,
  }));

  const amount = hooks.useDstAmount().amountUI;

  return <SubmitModalToken token={dstToken} amount={amount} />;
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

  const { mutateAsync: onSubmit } = useSubmitSwapCallback();

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
      <StyledSubmitModalContentMain>
        <StyledSubmitModalContentChildren>{children}</StyledSubmitModalContentChildren>
        {(message || indicator) && (
          <StyledSubmitModalBottom>
            {indicator && <ProgressIndicator />}
            {message && <StyledSubmitModalBottomMsg>{message}</StyledSubmitModalBottomMsg>}
          </StyledSubmitModalBottom>
        )}
      </StyledSubmitModalContentMain>
    </StyledSubmitModalContent>
  );
};

const AwaitingTxMessage = () => {
  const { account } = useTwapContext();

  return (
    <StyledAwaitingTxMessage>
      <Styles.StyledText>Please approve it in your wallet: {shortenWalletAddress(account)}</Styles.StyledText>
      <Components.Base.Spinner />
    </StyledAwaitingTxMessage>
  );
};

const WrapContent = () => {
  const { config } = useTwapContext();
  return (
    <StepContent title={`Wrap ${config.nativeToken.symbol}`} indicator={true} message={<AwaitingTxMessage />}>
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
  return (
    <StepContent title="Confirm Placing" message={<AwaitingTxMessage />} indicator={true}>
      <SubmitModalSrcToken />
      <LoadingLottie />
      <SubmitModalDstToken />
    </StepContent>
  );
};

const ExplorerMessage = () => {
  const txHash = store.useTwapStore((s) => s.txHash);
  const network = hooks.useNetwork();
  return (
    <StyledOrderPlacedMessage>
      <a href={`${network?.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer">
        View on explorer: {shortenTxHash(txHash || "")} <LinkIcon />
      </a>
    </StyledOrderPlacedMessage>
  );
};

const OrderPlacedContent = () => {
  const isLimitOrder = useAdapterContext().limit;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPaused(true);
    }, 2_400);
  }, []);

  const title = isLimitOrder ? "Limit Order Placed" : "TWAP Order Placed";

  return (
    <StepContent className="twap-order-summary-placed-step" title={title} indicator={false} message={<ExplorerMessage />}>
      <SubmitModalSrcToken />
      <Lottie isPaused={paused} options={Submit_Lottie_options} width={40} style={{ position: "absolute", top: -18 }} />
      <SubmitModalDstToken />
    </StepContent>
  );
};

const OrderCreatedContent = () => {
  return (
    <StepContent className="twap-order-summary-created-step" title="Order Submitted" indicator={false} message={<ExplorerMessage />}>
      <SubmitModalSrcToken />
      <Lottie options={Long_Success_Lottie_options} width={95} style={{ position: "absolute", top: -15 }} />
      <SubmitModalDstToken />
    </StepContent>
  );
};

const ErrorContent = () => {
  const { TransactionErrorContent } = useAdapterContext();
  const { onClose } = useSubmitContext();
  return (
    <StepContent title="Error">
      <TransactionErrorContent message="Something went wrong" onClick={onClose} />
    </StepContent>
  );
};

const ApproveContent = () => {
  const { dappTokens } = useTwapContext();
  const fromToken = store.useTwapStore((store) => store.srcToken);
  const inputCurrency = useMemo(() => getTokenFromTokensList(dappTokens, fromToken?.address), [dappTokens, fromToken]);

  return (
    <StepContent title={`Approve ${inputCurrency?.symbol}`} indicator={true} message={<AwaitingTxMessage />}>
      <SubmitModalSrcToken />
    </StepContent>
  );
};

const ProgressIndicator = () => {
  const { state } = useSubmitContext();
    console.log(state.stepsCount);
    
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
  const t = useTwapContext().translations;
  const deadline = hooks.useDeadline();

  return <Components.OrderDetails.Expiry expiryMillis={deadline} />;
};

const Price = () => {
  const price = hooks.useTradePrice().priceUI;
  const { srcToken, dstToken } = store.useTwapStore((store) => ({
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
  return <Components.OrderDetails.Price price={price} srcToken={srcToken} dstToken={dstToken} />;
};

const MinReceived = () => {
  const minReceived = hooks.useDstMinAmountOut().amountUI;
  const { isLimitOrder, dstToken } = store.useTwapStore((store) => ({
    dstToken: store.dstToken,
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
  const token = store.useTwapStore((store) => store.srcToken);
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
  const fee = useTwapContext().fee;
  const dstToken = store.useTwapStore((store) => store.dstToken);
  const outAmount = hooks.useDstAmount().amountUI;

  return <Components.OrderDetails.Fee outAmount={outAmount} dstToken={dstToken} fee={fee} />;
};
const OrderReview = ({ onSubmit }: { onSubmit: () => void }) => {
  const { isLoading: allowanceLoading } = hooks.useHasAllowanceQuery();
  const Button = useAdapterContext().Button;
  const orderType = useOrderType();

  return (
    <StyledOrderReviewStep title={`Place ${orderType} order`}>
      <StyledOrderSummary>
        <StyledTokens>
          <OrderReviewTokenDisplay isSrc={true} />
          <ArrowBottom />
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
            Confirm
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
  const { token, srcAmount } = store.useTwapStore((store) => ({
    token: isSrc ? store.srcToken : store.dstToken,
    srcAmount: store.srcAmountUi,
  }));
  const dstAmount = hooks.useDstAmount().amountUI;
  const _amount = isSrc ? srcAmount : dstAmount;

  const amount = hooks.useFormatNumber({ value: _amount, decimalScale: 6 });

  return (
    <StyledTokenDisplay>
      <StyledTokenDisplayAmount>{amount}</StyledTokenDisplayAmount>
      <StyledTokenDisplayRight>
        <Styles.StyledText>{token?.symbol}</Styles.StyledText>
        <Components.Base.TokenLogo logo={token?.logoUrl} />
      </StyledTokenDisplayRight>
    </StyledTokenDisplay>
  );
};

const shortenWalletAddress = (address: string, visibleChars: number = 4): string => {
  // Validate the input
  if (!address || !address.startsWith("0x") || address.length <= visibleChars + 2) {
    return "";
  }

  // Extract the last few characters
  const visiblePart = address.slice(-visibleChars);

  // Return the shortened address
  return `0x...${visiblePart}`;
};

const shortenTxHash = (hash: string, visibleStart: number = 8): string => {
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
  return isLimitPanel ? "Limit" : "TWAP";
};

const useCurrencies = () => {
  const { srcToken, dstToken } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const { dappTokens } = useTwapContext();
  return useMemo(() => {
    return {
      inputCurrency: getTokenFromTokensList(dappTokens, srcToken),
      outputCurrency: getTokenFromTokensList(dappTokens, dstToken),
    };
  }, [dappTokens, srcToken, dstToken]);
};

const useOrderPlacedToast = () => {
  const { toast } = useAdapterContext();
  const orderType = useOrderType();
  const { inputCurrency, outputCurrency } = useCurrencies();
  const { srcAmountUi, srcToken, dstToken } = store.useTwapStore((s) => ({
    srcAmountUi: s.srcAmountUi,
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const outAmount = hooks.useDstAmount().amountUI;

  const srcAmountUiF = hooks.useFormatNumber({ value: srcAmountUi, decimalScale: 6 });
  const outAmountF = hooks.useFormatNumber({ value: outAmount, decimalScale: 6 });

  return useCallback(() => {
    toast({
      title: "Order submitted",
      message: `${srcAmountUiF} ${srcToken?.symbol} for ${outAmountF} ${dstToken?.symbol}`,
      variant: "success",
      autoCloseMillis: 4_000,
    });
  }, [toast, orderType, inputCurrency, outputCurrency]);
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
  const { config } = useTwapContext();
  const { inputCurrency } = useCurrencies();

  return useCallback(
    (error: any, step?: SwapStep) => {
      if (error.message?.toLowerCase().includes("gas required exceeds allowance")) {
        return {
          title: `Insufficient ${config.nativeToken.symbol} balance`,
          message: "You don't have enough balance to perform the swap.",
        };
      }

      const message = `Please try again. If it doesn’t work, try getting help by using the link below.`;
      if (step === SwapStep.WRAP) {
        return {
          title: `${config.nativeToken?.symbol} wrapping went wrong`,
          message,
        };
      }

      if (step === SwapStep.APPROVE) {
        return {
          title: `${inputCurrency?.symbol} approval went wrong`,
          message,
        };
      }
      if (step === SwapStep.ORDER_CREATE) {
        return {
          title: `${orderType} order placing confirmation went wrong`,
          message,
        };
      }

      return {
        title: "Transaction submission went wrong",
        message,
      };
    },
    [inputCurrency, config, orderType]
  );
};

const useRejectedToastError = () => {
  const { account } = useAdapterContext();
  const { inputCurrency } = useCurrencies();
  const orderType = useOrderType();

  const { config } = useTwapContext();

  return useCallback(
    (step?: SwapStep) => {
      const wallet = shortenWalletAddress(account, 6);

      if (step === SwapStep.APPROVE) {
        return {
          title: `You canceled ${inputCurrency?.symbol} approval`,
          message: `You didn't approve ${inputCurrency?.symbol} in your wallet: ${wallet}`,
        };
      }
      if (step === SwapStep.WRAP) {
        return {
          title: `You canceled ${config.nativeToken?.symbol} wrapping`,
          message: `You didn't approve ${config.nativeToken?.symbol} wrapping in your wallet: ${wallet}`,
        };
      }
      if (step === SwapStep.ORDER_CREATE) {
        return {
          title: `You canceled ${orderType} order placing confirmation`,
          message: `You didn't confirm placing ${orderType.toLowerCase()} order in your wallet: ${wallet}`,
        };
      }
      return {
        title: "You canceled the transaction",
        message: `You didn't confirm the transaction in your wallet: ${wallet}`,
      };
    },
    [inputCurrency, config, orderType, account]
  );
};

const StyledTokens = styled(Styles.StyledColumnFlex)({
  gap: 12,
  alignItems: "center",
  svg: {
    width: 24,
    height: 24,
  },
});

const StyledTokenDisplayRight = styled(Styles.StyledRowFlex)({
  width: "auto",
  p: {
    fontSize: 20,
    fontWeight: 600,
  },
  ".twap-token-logo": {
    width: 40,
    height: 40,
  },
});

const StyledTokenDisplayAmount = styled(Styles.StyledOneLineText)({
  fontWeight: 600,
  fontSize: 24,
});
const StyledTokenDisplay = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
  gap: 30,
});

export const isTxRejected = (error: any) => {
  if (error?.message) {
    return error.message?.toLowerCase()?.includes("rejected") || error.message?.toLowerCase()?.includes("denied");
  }
};
