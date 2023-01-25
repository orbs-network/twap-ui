import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { Configs } from "@orbs-network/twap";
import { useGetProvider, useParseTokenList } from "./hooks";
import translations from "./i18n/en.json";
import { QuickSwapOrdersProps } from ".";

function OrderHistory(props: QuickSwapOrdersProps) {
  const tokenList = useParseTokenList(props.getTokenImageUrl, props.dappTokens);
  const provider = useGetProvider(props.getProvider, props.account);

  return (
    <OrdersAdapter
      account={props.account}
      config={Configs.QuickSwap}
      provider={provider}
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
