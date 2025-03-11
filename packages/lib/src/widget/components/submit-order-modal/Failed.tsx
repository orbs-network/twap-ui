import { isNativeBalanceError } from "../../../utils";
import { useNetwork } from "../../../hooks/logic-hooks";
import { SwapFlow } from "@orbs-network/swap-ui";
import { useTwapContext } from "../../../context";
export function Failed(props: { error?: any }) {
  const { translations: t } = useTwapContext();
  const symbol = useNetwork()?.native.symbol || "Native token";
  const error = isNativeBalanceError(props.error) ? t.CreateOrderModalNativeBalanceError.replace("{nativeToken}", symbol) : props.error;
  return <SwapFlow.Failed error={error} link={`https://www.orbs.com/dtwap-and-dlimit-faq/`} />;
}
