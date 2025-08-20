import { isNativeBalanceError, isTxRejected } from "../../utils";
import { SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { useTwapContext } from "../../context";
import { useSrcAmount } from "../../hooks/use-src-amount";
import { useNetwork } from "../../hooks/helper-hooks";
import { useOrderType } from "../../hooks/order-hooks";
import { useTwapStore } from "../../useTwapStore";
import { useUnwrapToken } from "../../hooks/use-unwrap";
import { Steps } from "../../types";
import { useCallback } from "react";

const TxError = () => {
  const activeStep = useTwapStore((s) => s.state.activeStep);
  const { mutateAsync: unwrap, isLoading } = useUnwrapToken();
  const network = useNetwork();
  const { components } = useTwapContext();
  const updateState = useTwapStore((s) => s.updateState);

  const onUnwrap = useCallback(async () => {
    try {
      updateState({ swapStatus: SwapStatus.LOADING, totalSteps: 1, currentStepIndex: 0 });
      await unwrap();
      updateState({ swapStatus: SwapStatus.SUCCESS });
    } catch (error) {
      if (isTxRejected(error)) {
        updateState({ swapStatus: SwapStatus.FAILED });
      } else {
        updateState({ swapStatus: SwapStatus.FAILED, swapError: (error as any).message, activeStep: undefined });
      }
    }
  }, [unwrap, updateState]);

  if (!activeStep) return null;

  return (
    <div className="twap-failed-unwrap">
      <h2 className="twap-failed-unwrap-title">Transaction failed</h2>
      <p className="twap-failed-unwrap-text">
        Notice: {network?.native.symbol} was wrapped to {network?.wToken.symbol}
      </p>
      {components.Button ? (
        <components.Button disabled={isLoading} loading={isLoading} onClick={onUnwrap}>
          Unwrap {network?.wToken.symbol}
        </components.Button>
      ) : (
        <button className="twap-failed-unwrap-button" onClick={onUnwrap}>
          Unwrap {network?.wToken.symbol}
        </button>
      )}
    </div>
  );
};

export function Failed(props: { error?: any }) {
  const { translations: t, TransactionModal, srcToken, dstToken } = useTwapContext();
  const symbol = useNetwork()?.native.symbol || "Native token";
  const srcAmount = useSrcAmount().amountUI || "";
  const dstAmount = useTwapStore((s) => s.state.acceptedDstAmount);
  const orderType = useOrderType();
  const error = isNativeBalanceError(props.error) ? t.CreateOrderModalNativeBalanceError.replace("{nativeToken}", symbol) : props.error;
  const activeStep = useTwapStore((s) => s.state.activeStep);

  if (TransactionModal?.CreateOrder?.ErrorContent && srcToken && dstToken) {
    return (
      <TransactionModal.CreateOrder.ErrorContent
        shouldUnwrap={activeStep === Steps.UNWRAP}
        error={error}
        srcToken={srcToken}
        dstToken={dstToken}
        srcAmount={srcAmount}
        dstAmount={dstAmount || ""}
        orderType={orderType}
      />
    );
  }

  return <SwapFlow.Failed error={<TxError />} link={`https://www.orbs.com/dtwap-and-dlimit-faq/`} />;
}
