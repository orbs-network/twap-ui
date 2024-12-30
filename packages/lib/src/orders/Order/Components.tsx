import { CircularProgress, styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { useCallback, useMemo, useState } from "react";
import { useFormatNumber, useGetToken } from "../../hooks";
import { Order } from "../../order";
import { StyledRowFlex, StyledText } from "../../styles";
import { CheckIcon } from "./icons";
import BN from "bignumber.js";

export const useOrderExcecutionPrice = (order: Order) => {
  const srcToken = useGetToken(order.srcTokenAddress);
  const dstToken = useGetToken(order.dstTokenAddress);

  const avarageLimitPrice = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return order.getExcecutionPrice(srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);

  const [inverted, setInverted] = useState(false);

  const value = useMemo(() => {
    if (!avarageLimitPrice) return;
    return inverted ? BN(1).dividedBy(avarageLimitPrice).toString() : avarageLimitPrice;
  }, [avarageLimitPrice, inverted]);

  const priceF = useFormatNumber({ value, decimalScale: 3 });

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  const onInvert = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  return { price: priceF, leftToken, rightToken, onInvert, inverted };
};

export const OrderStatus = ({ order }: { order: Order }) => {
  return (
    <StyledStatus className={`twap-orders-status twap-orders-status-${order.status.toLowerCase()}`}>
        <StyledText>{order?.status}</StyledText>
        {order?.status === Status.Completed && <CheckIcon />}
    </StyledStatus>
  );
};

const StyledStatus = styled(StyledRowFlex)({
  gap: 4,
  width: "auto",
  svg: {
    width: 21,
    height: 21,
  },
});

export const OrderProgress = ({ order }: { order: Order }) => {
  const isOpenOrder = order.status === Status.Open;

  return (
    <StyledRowFlex className="twap-order-progress" style={{ width: "auto" }}>
      <StyledText className="twap-order-progress-text">{order?.progress.toFixed(0)}%</StyledText>
      {isOpenOrder && <CircularProgress thickness={8} variant="determinate" value={Number(order?.progress.toFixed(0) || '0')} className="twap-order-progress-spinner" />}
    </StyledRowFlex>
  );
};
