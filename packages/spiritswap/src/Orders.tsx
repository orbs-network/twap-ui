import { hooks, Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { config, parseToken, useGetProvider } from "./hooks";
import translations from "./i18n/en.json";
import { SpiritSwapOrdersProps } from ".";

function OrderHistory(props: SpiritSwapOrdersProps) {
  const provider = useGetProvider(props.getProvider, props.account);
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(rawToken, props.getTokenImageUrl));
  return (
    <OrdersAdapter
      account={props.account}
      config={config}
      provider={provider}
      translations={translations as Translations}
      tokenList={parsedTokens}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
    >
      <Orders />
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
