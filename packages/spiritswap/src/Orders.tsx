import { Orders, OrdersAdapter, Translations } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { memo } from "react";
import { Configs } from "@orbs-network/twap";
import { useGetProvider, useParseTokenList } from "./hooks";
import translations from "./i18n/en.json";
import { SpiritSwapOrdersProps } from ".";

function OrderHistory(props: SpiritSwapOrdersProps) {
  const tokenList = useParseTokenList(props.getTokenImage, props.dappTokens);
  const { provider, connectedChain } = useGetProvider(props.getProvider, props.account);

  return (
    <OrdersAdapter
      connectedChainId={connectedChain}
      account={props.account}
      config={Configs.SpiritSwap}
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
