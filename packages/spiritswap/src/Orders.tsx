import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { Configs, TokenData } from "@orbs-network/twap";
import { parseToken, useGetProvider } from "./hooks";
import translations from "./i18n/en.json";
import { SpiritSwapOrdersProps } from ".";
import _ from "lodash";

const parseDappTokens = (props: SpiritSwapOrdersProps): TokenData[] => {
  if (!props.dappTokens) return [];
  return _.map(props.dappTokens, (t) => parseToken(t, props.getTokenImageUrl));
};

function OrderHistory(props: SpiritSwapOrdersProps) {
  const provider = useGetProvider(props.getProvider, props.account);

  return (
    <OrdersAdapter
      account={props.account}
      config={Configs.SpiritSwap}
      provider={provider}
      translations={translations as Translations}
      tokenList={parseDappTokens(props)}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
    >
      <Orders />
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
