import { Orders, OrdersAdapter, OrdersProps } from "@orbs-network/twap-ui";
import { StyledOrdersContainer } from "./styles";
import { memo } from "react";
import { useParseTokenList } from "./hooks";
import { Configs } from "@orbs-network/twap";

function OrderHistory(props: OrdersProps) {
  const tokenList = useParseTokenList(props.dappTokens);

  return (
    <OrdersAdapter
      connectedChainId={props.connectedChainId}
      account={props.account}
      config={Configs.Pangolin}
      provider={props.provider}
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
