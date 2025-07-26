import { isNativeBalanceError } from "../../utils";
import { useDestTokenAmount, useNetwork, useOrderType, useSrcAmount } from "../../hooks/logic-hooks";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useTwapContext } from "../../context";
export function Failed(props: { error?: any }) {
  const { translations: t, TransactionModal, srcToken, dstToken } = useTwapContext();
  const symbol = useNetwork()?.native.symbol || "Native token";
  const srcAmount = useSrcAmount().amountUI || "";
  const dstAmount = useDestTokenAmount().amountUI || "";
  const orderType = useOrderType();
  const error = isNativeBalanceError(props.error) ? t.CreateOrderModalNativeBalanceError.replace("{nativeToken}", symbol) : props.error;

  if (TransactionModal?.CreateOrder?.ErrorContent && srcToken && dstToken) {
    return <TransactionModal.CreateOrder.ErrorContent error={error} srcToken={srcToken} dstToken={dstToken} srcAmount={srcAmount} dstAmount={dstAmount} orderType={orderType} />;
  }

  return <SwapFlow.Failed error={error} link={`https://www.orbs.com/dtwap-and-dlimit-faq/`} />;
}
