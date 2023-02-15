import { hooks, Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { config, parseToken, useGetProvider } from "./hooks";
import translations from "./i18n/en.json";
import { SpookySwapOrdersProps } from ".";

function OrderHistory(props: SpookySwapOrdersProps) {
  const provider = useGetProvider(props.getProvider, props.account);
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(rawToken, props.getTokenImageUrl));

  return (
    <OrdersAdapter
      connectedChainId={props.connectedChainId}
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
