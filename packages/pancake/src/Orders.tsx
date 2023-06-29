import { hooks, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import translations from "./i18n/en.json";
import { ThenaOrdersProps } from "./types";
import { config, parseToken } from "./hooks";
import { Orders } from "@orbs-network/twap-ui";
import {} from "@orbs-network/twap-ui";
import { OrdersErrorWrapper } from "@orbs-network/twap-ui";

function OrderHistory(props: ThenaOrdersProps) {
  const parsedTokens = hooks.useParseTokens(props.dappTokens, parseToken);

  return (
    <OrdersAdapter
      account={props.account}
      config={config}
      provider={props.provider}
      translations={translations as Translations}
      tokenList={parsedTokens}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
    >
      <Orders />
    </OrdersAdapter>
  );
}

const Test = (props: ThenaOrdersProps) => {
  return (
    <OrdersErrorWrapper>
      <OrderHistory {...props} />
    </OrdersErrorWrapper>
  );
};

export default memo(Test);
