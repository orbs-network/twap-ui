import { isTxRejected } from "../../utils";
import { SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { useNetwork } from "../../hooks/helper-hooks";
import { useUnwrapToken } from "../../hooks/use-unwrap";
import { useCallback } from "react";
import { useTwapContext } from "../../context";
import { useSubmitOrderPanelContext } from "./context";
import { useTwapStore } from "../../useTwapStore";

const TxError = ({ error }: { error?: any }) => {
  const { step } = useTwapStore((s) => s.state.swapExecution);
  const updatedSwapExecution = useTwapStore((s) => s.updateSwapExecution);
  const { mutateAsync: unwrap, isLoading } = useUnwrapToken();
  const network = useNetwork();
  const t = useTwapContext().translations;
  const { Button } = useSubmitOrderPanelContext();
  const updateSwap = useTwapStore((s) => s.updateSwap);

  const onUnwrap = useCallback(async () => {
    try {
      updatedSwapExecution({ status: SwapStatus.LOADING, totalSteps: 1, stepIndex: 0 });
      await unwrap();
      updatedSwapExecution({ status: SwapStatus.SUCCESS });
    } catch (error) {
      if (isTxRejected(error)) {
        updatedSwapExecution({ status: SwapStatus.FAILED });
      } else {
        updatedSwapExecution({ status: SwapStatus.FAILED, error: (error as any).message, step: undefined });
      }
    }
  }, [unwrap, updateSwap]);

  if (!step) return null;

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
