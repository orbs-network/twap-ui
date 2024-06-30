import { styled } from "@mui/material";
import { TokenData } from "@orbs-network/twap";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { useEffect, useRef } from "react";
import { useTwapContext } from "../../context";
import { useFormatNumberV2, useParseOrderUi } from "../../hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { ParsedOrder } from "../../types";
import { TokenLogo } from "../base";

export function SingleOrder({
  order: parsedOrder,
  index,
  setSize,
  onSelect,
}: {
  order?: ParsedOrder;
  index: number;
  setSize: (index: number, value: number) => void;
  onSelect: (o?: ParsedOrder) => void;
}) {
  const order = useParseOrderUi(parsedOrder);
  const root = useRef<any>();

  useEffect(() => {
    setSize(index, root.current.getBoundingClientRect().height);
  }, [index]);

  if (!order) return null;

  return (
    <Wrapper className="twap-order" ref={root} onClick={() => onSelect(parsedOrder)}>
      <Container className="twap-order-container">
        <Header order={order} />
        <StyledRowFlex className="twap-order-tokens">
          <TokenDisplay token={order.ui.srcToken} amount={order.ui.srcAmountUi} />
          <HiArrowRight className="twap-order-tokens-arrow" />
          <TokenDisplay token={order.ui.dstToken} amount={order.ui.dstAmount} />
        </StyledRowFlex>
      </Container>
    </Wrapper>
  );
}

const Header = ({ order }: { order: ReturnType<typeof useParseOrderUi> }) => {
  const t = useTwapContext().translations;
  return (
    <StyledHeader>
      #{order?.order.id} {order?.ui.isMarketOrder ? t.marketOrder : t.limitOrder} <span>{`(${order?.ui.createdAtUi})`}</span>
    </StyledHeader>
  );
};

const StyledHeader = styled(StyledText)({
  justifyContent: "space-between",
  fontSize: 14,
  span: {
    fontSize: 12,
    opacity: 0.7,
  },
});

const Wrapper = styled(StyledColumnFlex)({
  padding: "0px 20px 20px 20px",
});

const Container = styled(StyledColumnFlex)({
  borderRadius: 20,
  background: "rgba(0,0,0,0.5)",
  padding: 20,
  ".twap-order-tokens": {
    justifyContent: "center",
  },
  ".twap-order-tokens-arrow": {
    width: 20,
    height: 20,
  },
  ".twap-token-logo": {
    width: 16,
    height: 16,
  },
});

const TokenDisplay = ({ token, amount }: { token?: TokenData; amount?: string }) => {
  const _amount = useFormatNumberV2({ value: amount, decimalScale: 4 });
  return (
    <StyledTokenDisplay>
      <TokenLogo logo={token?.logoUrl} />
      <StyledText>{_amount}</StyledText>
    </StyledTokenDisplay>
  );
};

const StyledTokenDisplay = styled(StyledRowFlex)({
  width: "auto",
});
