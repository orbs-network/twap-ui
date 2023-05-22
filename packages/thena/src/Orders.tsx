import { hooks, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { memo } from "react";
import translations from "./i18n/en.json";
import { ThenaOrdersProps } from "./types";
import { config } from "./hooks";
import { StyledOrders } from "./styles";
import { Orders } from "@orbs-network/twap-ui";

function OrderHistory(props: ThenaOrdersProps) {
  const parsedTokens = hooks.useParseTokens(props.dappTokens);

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
      <StyledOrders isDarkMode={props.isDarkTheme ? 1 : 0}>
        <Orders />
      </StyledOrders>
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
