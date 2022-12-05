import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { memo } from "react";
import { Configs } from "@orbs-network/twap";
import { useGetProvider } from "./hooks";
import translations from "./i18n/en.json";
import { SpookySwapOrdersProps } from ".";

function OrderHistory(props: SpookySwapOrdersProps) {
  const tokenList = props.dappTokens;
  const provider = useGetProvider(props.getProvider, props.account);

  return (
    <OrdersAdapter
      connectedChainId={props.connectedChainId}
      account={props.account}
      config={Configs.SpookySwap}
      provider={provider}
      translations={translations as Translations}
      tokenList={tokenList}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
    >
      <StyledOrdersContainer>
        <Orders />
      </StyledOrdersContainer>
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
