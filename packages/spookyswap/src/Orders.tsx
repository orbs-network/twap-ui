import { Orders, OrdersAdapter, TWAPProps } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { memo } from "react";
import { Configs } from "@orbs-network/twap";
import { useGetProvider } from "./hooks";

function OrderHistory(props: TWAPProps) {
  const tokenList = props.dappTokens;
  const provider = useGetProvider(props.getProvider, props.account, props.connectedChainId);

  return (
    <OrdersAdapter
      connectedChainId={props.connectedChainId}
      account={props.account}
      config={Configs.SpookySwap}
      provider={provider}
      translations={props.translations}
      getTokenImage={props.getTokenImage}
      tokenList={tokenList}
      gasPrice={props.gasPrice}
    >
      <StyledOrdersContainer>
        <Orders />
      </StyledOrdersContainer>
    </OrdersAdapter>
  );
}

export default memo(OrderHistory);
