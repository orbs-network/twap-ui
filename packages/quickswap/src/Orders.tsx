import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import { Configs } from "@orbs-network/twap";
import { parseToken } from "./hooks";
import translations from "./i18n/en.json";
import { QuickSwapOrdersProps } from "./types";
import _ from "lodash";

const parseTokens = (props: QuickSwapOrdersProps) => {
  return _.compact(_.map(props.dappTokens, (t) => parseToken(props.getTokenLogoURL, t)));
};

function OrderHistory(props: QuickSwapOrdersProps) {
  return (
    <OrdersAdapter
      account={props.account}
      config={Configs.QuickSwap}
      provider={props.provider}
      translations={translations as Translations}
      tokenList={parseTokens(props)}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
    >
      <Orders />
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
