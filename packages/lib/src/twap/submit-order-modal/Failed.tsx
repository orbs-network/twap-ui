import { isTxRejected } from "../../utils";
import { SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { useNetwork } from "../../hooks/helper-hooks";
import { useTwapStore } from "../../useTwapStore";
import { useUnwrapToken } from "../../hooks/use-unwrap";
import { useCallback } from "react";
import { useTwapContext } from "../../context";
import { useSubmitOrderPanelContext } from "./context";

const TxError = ({ error }: { error?: any }) => {
  const activeStep = useTwapStore((s) => s.state.activeStep);
  const { mutateAsync: unwrap, isLoading } = useUnwrapToken();
  const network = useNetwork();
  const updateState = useTwapStore((s) => s.updateState);
  const t = useTwapContext().translations;
  const { Button } = useSubmitOrderPanelContext();

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
      <Button disabled={isLoading} loading={isLoading} onClick={onUnwrap}>
        {t.unwrapAction.replace("{symbol}", network?.wToken.symbol || "")}
      </Button>
    </div>
  );
};

export function Failed({ error }: { error?: any }) {
  const { ErrorView } = useSubmitOrderPanelContext();
  if (ErrorView) {
    return ErrorView;
  }

  return <SwapFlow.Failed error={<TxError error={error} />} link={`https://www.orbs.com/dtwap-and-dlimit-faq/`} />;
}
