import { SwapFlow } from "@orbs-network/swap-ui";
import { useSubmitOrderPanelContext } from "./context";
import { ORBS_TWAP_FAQ_URL } from "@orbs-network/twap-sdk";

const TxError = ({ error }: { error?: any }) => {
  return (
    <div className="twap-failed-unwrap">
      <h2 className="twap-failed-unwrap-title">{error ? error : `Transaction failed`}</h2>
    </div>
  );
};

export function Failed({ error }: { error?: any }) {
  const { ErrorView } = useSubmitOrderPanelContext();
  if (ErrorView) {
    return ErrorView;
  }

  return <SwapFlow.Failed error={<TxError error={error} />} link={ORBS_TWAP_FAQ_URL} />;
}
