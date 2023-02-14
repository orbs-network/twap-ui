import { TokenData } from "@orbs-network/twap";
import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import _ from "lodash";
import { memo } from "react";
import { handlePartnerDaas, parseToken } from "./hooks";
import translations from "./i18n/en.json";
import { PangolinOrdersProps } from "./types";

export const parseTokens = (props: PangolinOrdersProps): TokenData[] => {
  return _.compact(_.map(props.dappTokens, parseToken));
};

function OrderHistory(props: PangolinOrdersProps) {
  const tokenList = parseTokens(props);
  const { partnerDaas, config } = handlePartnerDaas(props.partnerDaas);

  return (
    <OrdersAdapter
      connectedChainId={props.connectedChainId}
      account={props.account}
      config={config}
      provider={props.provider}
      translations={translations as Translations}
      tokenList={tokenList}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      askDataParams={[partnerDaas]}
    >
      <Orders />
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
