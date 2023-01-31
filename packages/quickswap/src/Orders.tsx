import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { Configs } from "@orbs-network/twap";
import { useParseTokenList } from "./hooks";
import translations from "./i18n/en.json";
import { QuickSwapOrdersProps } from "./types";

function OrderHistory(props: QuickSwapOrdersProps) {
  const tokenList = useParseTokenList(props.getTokenLogoURL, props.dappTokens);
  
  return (
    <OrdersAdapter
      account={props.account}
      config={Configs.SpiritSwap}
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
