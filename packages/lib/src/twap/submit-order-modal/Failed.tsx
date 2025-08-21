import { isTxRejected } from "../../utils";
import { SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { useTwapContext } from "../../context";
import { useNetwork } from "../../hooks/helper-hooks";
import { useTwapStore } from "../../useTwapStore";
import { useUnwrapToken } from "../../hooks/use-unwrap";
import { ReactNode, useCallback } from "react";

const TxError = ({ error }: { error?: any }) => {
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
      <h2 className="twap-failed-unwrap-title">{error ? error : `Transaction failed`}</h2>
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

export function Failed({ error, component }: { error?: any; component?: ReactNode }) {
  if (component) {
    return component;
  }

  return <SwapFlow.Failed error={<TxError error={error} />} link={`https://www.orbs.com/dtwap-and-dlimit-faq/`} />;
}
