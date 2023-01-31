import { Orders, OrdersAdapter, OrdersProps, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { useParseTokenList } from "./hooks";
import { Configs } from "@orbs-network/twap";
import translations from "./i18n/en.json";

function OrderHistory(props: OrdersProps) {
  const tokenList = useParseTokenList(props.dappTokens);

  return (
    <OrdersAdapter
      connectedChainId={props.connectedChainId}
      account={props.account}
      config={Configs.Pangolin}
      provider={props.provider}
      translations={translations as Translations}
      tokenList={tokenList}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
    >
      <Orders />
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
