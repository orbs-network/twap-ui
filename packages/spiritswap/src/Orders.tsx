import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { Configs } from "@orbs-network/twap";
import { useGetProvider, useParseTokenList } from "./hooks";
import translations from "./i18n/en.json";
import { SpiritSwapOrdersProps } from ".";

function OrderHistory(props: SpiritSwapOrdersProps) {
  const tokenList = useParseTokenList(props.getTokenImage, props.dappTokens);
  const provider = useGetProvider(props.getProvider, props.account);

  return (
    <OrdersAdapter
      account={props.account}
      config={Configs.SpiritSwap}
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
